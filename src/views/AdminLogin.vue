<template>
    <div class="main">
        <h2 class="adminHeader">Admin Girişi</h2>
        <form @submit.prevent="login" class="loginForm">
            <input v-model="form.username" placeholder="Kullanıcı Adı" required class="loginInput">
            <input v-model="form.password" placeholder="Şifre" required type="password" class="loginInput">
            <button type="submit">Giriş Yap</button>
            <p v-if="error" class="error">{{ error }}</p>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios'; 
import { useRouter } from 'vue-router';
const form = ref({
    username : '',
    password : ''
})
const error = ref('');
const router = useRouter();

const login = async () => {
    try {
        const res = await axios.post('http://localhost:3000/api/admin/login', form.value);
        localStorage.setItem('token', res.data.token);
        router.push('/admin/panel');
    } catch(err) {
        error.value = err.response?.data?.message || "Giriş Başarısız";
    }
}
</script>

<style scoped>
    .loginForm{
        margin: auto;
        display: flex;
        flex-direction: column;
        width: 15%;
        justify-content: center;
        align-items: center;
        background-color: #CA99AB;
        padding: 10px;
        border-radius: 20px;
    }

    .loginInput {
        border-radius: 10px;
        width: 75%;
        border: none;
        margin-top: 5%;
        padding:10px ;
    }

    button {
        margin-top: 5%;
        border: none;
        padding: 7px 25px;
    }
</style>