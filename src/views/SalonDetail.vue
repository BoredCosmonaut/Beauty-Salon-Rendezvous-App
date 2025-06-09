<template>
    <main class="main" v-if="salon">
        <div class="left">
            <img :src="`http://localhost:3000/${salon.image}`" alt="" class="salon_image">
        </div>
        <div class="right">
            <div class="rightFirst">
            <p class="name">İsim: {{ salon.name }}</p>
            <div class="hours">
                <p class="opening">Açılma Saati: {{ salon.opening }}</p>
                <p class="closing">Kapanma Saati: {{ salon.closing }}</p>
            </div>
            <p class="phone_number">Telefon Numarası: {{ salon.phone }}</p>
            <p class="address">Adres: {{ salon.address }}</p>
            <button @click="showForm = !showForm" class="randevuButton">Randevu Al</button>
            </div>
            <transition name="slide-fade">
            <div v-if="showForm" class="randevuForm">
            <label>
                İsim:
                <input type="text" v-model="appointmentName" @change="fetchTakenTimes" />
            </label>
            <label>
                Telefon Numarası:
                <input type="text" v-model="appointmentNumber" @change="fetchTakenTimes" />
            </label>
            <label>
                Tarih:
                <input type="date" v-model="appointmentDate" @change="fetchTakenTimes" />
            </label>

            <label>
                Saat:
                <input type="time" v-model="appointmentTime" />
                <p v-if="takenTimes.includes(appointmentTime)" style="color: red;">
                    Bu saat dolu, başka bir saat seçin.
                </p>
            </label>

                <p>Ekstra Not</p>
                <textarea v-model="note"></textarea>

                <button @click="submitAppointment">Gönder</button>
            </div>
            </transition>
        </div>
    </main>
    <div class="comments">
        <h2 class="commentsText">Bu güzellik salonu için değerlendirme bırakın.</h2>
        <div class="commentForm">
        <form @submit.prevent="submitForm">
            <label for="">
                İsminiz: 
                <input v-model="commentName" type="text" name="" id="">
            </label>
            <p class="textArea">
                Değerlendirme: 
                <textarea v-model="commentText" name="" id="" rows="3" cols="30"></textarea>
            </p>
            <button @click="submitComment" class="commentButton">Gönder</button>
        </form>
        </div>
        <h2>Diğer Müşterilerin Yorumları</h2>
        <section class="commentsBox">
        <div v-if="comments.length === 0">Henüz yorum yok.</div>
        <div v-else class="commentCards">
            <CommentCard 
            v-for="comment in comments" 
            :key="comment.id" 
            :comment="comment"
            />
        </div>
        </section>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
import CommentCard from '@/components/commentCard.vue'
const route = useRoute();
const id = route.params.id;
const salon = ref(null);

const showForm = ref(false)
const appointmentDate = ref('')
const appointmentTime = ref('')
const appointmentName = ref('')
const appointmentNumber = ref('')
const note = ref('')
const takenTimes = ref([])

const commentName = ref('');
const commentText = ref('');
const comments = ref([])
const fetchSalon = async () => {
    try{
        const res = await axios.get(`http://localhost:3000/api/salons/${id}`);
        salon.value = res.data.data
    } catch(err) {
        console.error('Salon detayı alınamadı',err);
    }
}

const fetchTakenTimes = async () => {
  if (!appointmentDate.value) return

  try {
    const res = await axios.get(`http://localhost:3000/api/appointments/${id}`, {
      params: { date: appointmentDate.value }
    })
    takenTimes.value = res.data.times.map(time => time.slice(0, 5)) // '12:30:00' → '12:30'
  } catch (err) {
    console.error('Saatler alınamadı:', err)
  }
}

const submitAppointment = async () => {
  if (!appointmentName.value || !appointmentNumber.value || !appointmentDate.value || !appointmentTime.value) {
    alert("Lütfen tüm bilgileri doldurun.");
    return;
  }

  if (takenTimes.value.includes(appointmentTime.value)) {
    alert("Seçilen saat dolu, lütfen başka bir saat seçin.");
    return;
  }

  try {
    await axios.post('http://localhost:3000/api/appointments', {
      salonId: id,
      name: appointmentName.value,
      phone: appointmentNumber.value,
      date: appointmentDate.value,
      time: appointmentTime.value,
      note: note.value
    });
    alert('Randevunuz alındı!');
    showForm.value = false;

    // Form sıfırlama
    appointmentName.value = '';
    appointmentNumber.value = '';
    appointmentDate.value = '';
    appointmentTime.value = '';
    note.value = '';
    takenTimes.value = [];
  } catch (err) {
    console.error("Randevu gönderme hatası:", err);
    alert("Randevu oluşturulamadı.");
  }
};

const submitComment = async () => {
  try {
    await axios.post('http://localhost:3000/api/comments', {
      name: commentName.value,
      text: commentText.value,
      salonId: id // Eğer salonla ilgiliyse
    });
    alert('Yorum gönderildi!');
    commentName.value = '';
    commentText.value = '';
    fetchComments();
  } catch (err) {
    alert('Yorum gönderilemedi');
    console.error(err);
  }
};

const fetchComments = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/api/comments/${id}`)
    comments.value = res.data.comments
  } catch (err) {
    console.error('Yorumlar alınamadı:', err)
  }
}

onMounted(() => {
  fetchSalon()
  fetchComments()
});
</script>

<style scoped>
    .main{
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        margin-top: 2%;
    }

    .left {
        position: relative;
        right: 5%;
    }

    .salon_image {
        width: 700px;
        height: 500px;
    }

    .right {
        display: flex;
        flex-direction: column;
        width: 25%;
        text-align: left;
        padding: 10px;
        background-color: white;
        box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
    }

    .rightFirst{
        width: 80%;
        text-align: left;
        padding: 10px;
        background-color: white;
    }
    
    .right p {
        font-size: 16px;
    }

    .randevuButton {
        border: none;
        font-size: 15px;
        padding: 10px;
        background-color: #CA99AB;
        color: white;
        margin: auto;
        position: relative;
        left: 40%;
        border-radius: 10px;
    }

    textarea {
        resize: none;
    }

    .randevuForm {
        width: 80%;
        text-align: left;
        display: flex;
        flex-direction: column;
        padding: 10px;
        background-color: white;
    }

    .randevuForm input{
        margin-top: 3%;
    }

    .randevuForm button {
        border: none;
        font-size: 15px;
        padding: 10px;
        background-color: #CA99AB;
        color: white;
        margin: auto;
        position: relative;
        left: 7%;
        margin-top: 10px;
        border-radius: 10px;
    }

    button:hover {
        cursor: pointer;
    }

    .slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s ease;
  overflow: hidden;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
  max-height: 0;
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 1000px; /* ihtiyacına göre artırılabilir */
}

.comments {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    width: 100%;
}

.commentForm {
    display: flex;
    flex-direction: column;
    width: 500px;
    height: auto;
    margin: auto;
    align-items: center;
    justify-content: center;
    background-color: white;
    padding: 10px;
    border-radius: 20px;
            box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
}

.textArea {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-right: 62px;
}

.commentButton {
    width: 100px;
    padding: 7px;
    border: none;
    color: white;
    font-weight: 600;
    background-color: #CA99AB;
    border-radius: 10px;
}

.commentsBox {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  align-items: flex-start;
  width: 100%;
}

.commentCards {
    display: flex;
    flex-direction: row;
}

</style>