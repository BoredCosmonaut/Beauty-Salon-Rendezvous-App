<template>
    <div class="pendingSalons">
        <h1 class="pendingHeader">Onay Bekleyen Salonlar</h1>
        <div class="cards">
            <salonCard 
            v-for="salon in salons"
            :key = "salon.id"
            :salon = "salon"
            :isAdmin="true"
            @approve="approveSalon"
            @reject="rejectSalon"
            />
        </div>
    </div>
</template>

<script setup>
import salonCard from '@/components/salonCard.vue';
import { ref, onMounted } from 'vue'
import axios from 'axios'
const salons = ref([]);

const fetchPendingSalons = async () => {
    try {
        const res = await axios.get("http://localhost:3000/api/salons/pending",{
            headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}
        })
        salons.value = res.data.data
    } catch(err) {
        console.error(err)
    }
}

onMounted(fetchPendingSalons);

const approveSalon = async (id) => {
  await axios.post(`http://localhost:3000/api/salons/approve/${id}`, {}, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
  salons.value = salons.value.filter(s => s.id !== id)
}

const rejectSalon = async (id) => {
  await axios.post(`http://localhost:3000/api/salons/reject/${id}`, {}, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
  salons.value = salons.value.filter(s => s.id !== id)
}
</script>

<style scoped>
  .main {
    width: 100%;
    height: auto;
  }
  .cards {
    padding: 2%;
  }
</style>