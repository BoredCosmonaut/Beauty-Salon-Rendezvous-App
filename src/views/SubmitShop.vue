<template>
    <h2>Aramıza Katılın.</h2>
    <p class="topText">Aşağıdaki formu doldurarak sitemize kendi salonunuzu ekleyin.</p>
    <div class="main">
        <form @submit.prevent="submitForm" class="salonForm">
            <input v-model="form.name" placeholder="Salon Adı" required name="name">
            <input v-model="form.address" placeholder="Adres" required>
            <input v-model="form.phone" placeholder="Telefon Numarası" required type="text">
            <div class="saat">
            <p>Açılış Saati</p>   
            <input v-model="form.opening" placeholder="Açılış Saati" required type="time" class="hourInput">
            <p>Kapanış Saati</p>
            <input v-model="form.closing" placeholder="Kapanış Saati" required type="time" class="hourInput">
            </div>
            <p class="imageText">Müsterilerin sizi daha kolay bulması için salonunuzun resmini ekleyin.</p>
            <input type="file" @change="handleImageUpload" required />
            <button type="submit">Gönder</button>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const form = ref({
  name: '',
  address: '',
  phone: '',
  opening: '',
  closing: '',
  image: null // resim dosyasını burada tutacağız
})

// input[type="file"] değiştiğinde tetiklenir
const handleImageUpload = (e) => {
  form.value.image = e.target.files[0]
}

const submitForm = async () => {
    const formData = new FormData();
    formData.append('name',form.value.name);
    formData.append('address', form.value.address);
    formData.append('phone', form.value.phone);
    formData.append('opening',form.value.opening);
    formData.append('closing', form.value.closing);
    formData.append('image', form.value.image);
    try{
        const response = await axios.post('http://localhost:3000/api/salons/apply',formData, {
            headers: {
                'Content-Type': 'mulipart/form-data'
            }
        })
        alert('Salon başvurunuz gönderildi!!');
        console.log(response.data)
    } catch (err) {
        console.error('Hata:', err);
        alert('Bir hata oluştu');
    }
}
</script>

<style scoped>
    .main {
        width: 75%;
        max-width: 400px;
        height: auto;
        display: flex;
        flex-direction: column;
        background-color: #CA99AB;
        margin: auto;
        position: relative;
        text-align: left;
        top: 15px;
    }

    .salonForm {
        position: relative;
        display: flex;
        flex-direction: column;
        width: auto;
        align-items: center;
    }

    .salonForm input {
        width: 200px;
        margin-bottom: 2%;
    }

    .salonForm input:nth-child(1) {
        margin-top: 3%;
    }

    .saat {
        display: flex;
        flex-direction: column;
        width: 90%;
        align-items: center;
    }

    .hourInput {
        width: 1%;
        max-width: 50px;
        height: 10px;
    }

    input {
        border: none;
        padding: 5px;
        border-radius: 10px;
    }

    .imageText {
        width: 75%;
        text-align: center;
    }
</style>