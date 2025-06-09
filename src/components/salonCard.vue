<template>
    <main>
        <div class="card">
            <img :src="`http://localhost:3000/${salon.image}`" alt="" class="salon_img">
            <div class="right">
                <p class="name">İsim:{{salon.name}}</p>
                <div class="hour">
                    <p class="opening">Açılış:{{salon.opening}}</p>
                    <p class="closing">Kapanış:{{ salon.closing }}</p>
                </div>
                <p class="phone_number">Phone: {{ salon.phone }}</p>
                <div v-if="isAdmin" class="admin-buttons">
                    <button @click="$emit('approve', salon.id)" class="submitButton">Onayla</button>
                    <button @click="$emit('reject', salon.id)" class="submitButton">Reddet</button>
                </div>
                <RouterLink v-if="!isAdmin" :to="`/salon/${salon.id}`" class="infoButton" >Detayları Gör</RouterLink>
            </div>
        </div>
    </main>
</template> 

<script setup>
 import { defineProps } from 'vue';
    defineProps({
        salon: Object,
        isAdmin: Boolean
    })
</script>

<style scoped>
    main {
        display: flex;
    }
    .card {
    background-color: pink;
    display: flex;
    flex-direction: row;
    width: 700px;  /* Yüzde değil sabit değer */
    max-width: 100%;
    padding: 1%;
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
    margin: 1%;
    box-sizing: border-box;
    }

    img {
        width: auto;
        max-width: 350px;
        height: auto;
        max-height: 300px;
    }

    .right {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        width: 70%;
        max-width: 400px;
        height: auto;
        margin-left: 4%;
    }

    .right p {
        margin-top: -10px;
    }

    .infoButton {
        text-decoration: none;
        background-color: white;
        padding: 4%;
        border-radius: 10px;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;
    }

    .submitButton {
        width: 100px;
        height:auto;
        padding: 8px;
        margin-right: 4%;
        border: none;
        border-radius: 10px;
        box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
    }

    .submitButton:hover{
        cursor: pointer;
    }
</style>