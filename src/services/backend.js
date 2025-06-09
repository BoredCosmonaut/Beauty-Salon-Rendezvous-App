const express = require('express')
const cors = require('cors')
const multer = require('multer')
const pg = require('pg')
const path = require('path')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
const app = express();
const PORT = 3000;
dotenv.config()
// PostgreSQL bağlantısı
const { Pool } = pg
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

// Middlewares
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

// Eğer uploads klasörü yoksa oluştur
const uploadDir = './uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

// Multer ayarları
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname)
        cb(null, uniqueName)
    }
});
const upload = multer({ storage })

// Başvuru gönderme
app.post('/api/salons/apply', upload.single('image'), async (req, res) => {
    const { name, address, phone, opening, closing } = req.body
    const imagePath = req.file ? `uploads/${req.file.filename}` : null

    try {
        const result = await pool.query(
            `INSERT INTO pending_salons (name, address, phone, opening, closing, image)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [name, address, phone, opening, closing, imagePath]
        )
        res.status(200).json({
            success: true,
            message: "Başarıyla istek yollandı",
            data: result.rows[0]
        })
    } catch (err) {
        console.error('Hata:', err)
        res.status(500).json({ success: false, message: 'Sunucu hatası.' })
    }
})

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ message: 'Token eksik' })

  const token = authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Token eksik' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded.isAdmin) return res.status(403).json({ message: 'Yetkisiz' })
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Token geçersiz' })
  }
}

// POST /api/admin/login
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const result = await pool.query(
      'SELECT * FROM admin_users WHERE username = $1',
      [username]
    )

    const admin = result.rows[0]
    if (!admin) return res.status(401).json({ message: 'Kullanıcı bulunamadı' })

    const valid = await bcrypt.compare(password, admin.password)
    if (!valid) return res.status(401).json({ message: 'Şifre hatalı' })

    const token = jwt.sign(
    { id: admin.id, username: admin.username, isAdmin: true },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
    )

    res.json({ token })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Sunucu hatası' })
  }
})

app.get('/api/salons/pending', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pending_salons')
    res.json({ success: true, data: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
})

app.post('/api/salons/approve/:id',authMiddleware,async (req ,res) => {
    const id = req.params.id;

    try{
        const {rows} = await pool.query('SELECT * FROM pending_salons WHERE id = $1', [id]);
        if(rows.length  === 0) return res.status(404).json({ success: false, message: 'Salon bulunamadı' });
        const salon = rows[0];
        // Approved salonları tutan tabloya ekle
        await pool.query(
        `INSERT INTO salons (name, address, phone, opening, closing, image) 
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [salon.name, salon.address, salon.phone, salon.opening, salon.closing, salon.image]
        );
        
        await pool.query('DELETE FROM pending_salons WHERE id = $1',[id]);
        res.json({ success: true, message: 'Salon onaylandı' })
    }   catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Sunucu hatası' })
    }
});

app.post('/api/salons/reject/:id', authMiddleware, async (req, res) => {
  const id = req.params.id

  try {
    // Pending tablodan sil
    await pool.query('DELETE FROM pending_salons WHERE id = $1', [id])
    res.json({ success: true, message: 'Salon reddedildi' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Sunucu hatası' })
  }
});

app.get('/api/salons/approved',async (req,res) => {
  try {
    const result = await pool.query("SELECT * FROM salons");
    res.json({success: true,data:result.rows});
  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

app.get('/api/salons/:id', async(req,res) => {
  const {id} = req.params;
  try {
    const result = await pool.query('SELECT * FROM salons WHERE id = $1',[id]);
    if(result.rows.length == 0) {
      return res.status(404).json({ success: false, message: 'Salon bulunamadı' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Sunucu hatası' })
  };
});

app.get('/api/appointments/:salonId', async (req, res) => {
  const { salonId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ success: false, message: 'Tarih gerekli' });
  }

  try {
    const result = await pool.query(
      'SELECT time FROM appointments WHERE salon_id = $1 AND date = $2',
      [salonId, date]
    );
    res.json({ success: true, times: result.rows.map(r => r.time) });
  } catch (err) {
    console.error('Randevu saatleri alınamadı:', err);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

app.post('/api/appointments', async (req, res) => {
  const { salonId, date, time, note, name, phone } = req.body;

  if (!salonId || !date || !time) {
    return res.status(400).json({
      success: false,
      message: 'Salon ID, tarih ve saat zorunludur.'
    });
  }

  try {
    // Çakışma kontrolü
    const conflictCheck = await pool.query(
      'SELECT * FROM appointments WHERE salon_id = $1 AND date = $2 AND time = $3',
      [salonId, date, time]
    );

    if (conflictCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Bu tarih ve saatte zaten bir randevu mevcut.'
      });
    }

    // Randevu ekle
    const insertResult = await pool.query(
      `INSERT INTO appointments (salon_id, date, time, note, name, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [salonId, date, time, note || null, name || null, phone || null]
    );

    res.status(201).json({
      success: true,
      message: 'Randevu başarıyla oluşturuldu.',
      appointment: insertResult.rows[0]
    });

  } catch (error) {
    console.error('Randevu oluşturulurken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

app.post('/api/comments', async (req,res) => {
  const {name,text,salonId} = req.body;
  if (!name || !text) {
    return res.status(400).json({ success: false, message: "İsim ve yorum zorunludur." });
  }

  try {
    const result = await pool.query(`INSERT INTO comments(name,text,salon_id) VALUES ($1, $2, $3) RETURNING *`,[name,text,salonId || null]);
    res.status(201).json({ success: true, comment: result.rows[0] });
  } catch(err){
    console.error("Yorum eklenemedi:",err);
    res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
})

app.get('/api/comments/:salonId', async(req,res) => {
  const { salonId } = req.params;
  try {
    const result = await pool.query(
      'SELECT name, text, created_at FROM comments WHERE salon_id = $1 ORDER BY created_at DESC',
      [salonId]
    );
    res.json({ success: true, comments: result.rows });
  } catch (err) {
    console.error('Yorumlar alınamadı:', err);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

app.post('/api/admin/create', async (req, res) => {
  const { username, password } = req.body
  const hashed = await bcrypt.hash(password, 10)

  try {
    const result = await pool.query(
      'INSERT INTO admin_users (username, password) VALUES ($1, $2) RETURNING *',
      [username, hashed]
    )
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Hata oluştu' })
  }
})



// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`)
})
