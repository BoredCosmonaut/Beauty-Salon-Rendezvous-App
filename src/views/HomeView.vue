
<template>
    <main class="main">
      <div class="cards">
        <salonCard 
        v-for="salon in salons"
        :key="salon.id"
        :salon="salon"
        />
      </div>
    </main>
</template>

<script setup>
import { onMounted,ref } from 'vue';
import salonCard from '@/components/salonCard.vue';
import axios from 'axios';

const salons = ref([]);

const fetchSalons = async() => {
  try {
    const res = await axios.get('http://localhost:3000/api/salons/approved');
    salons.value = res.data.data;
  } catch(err) {
    console.error("Salonlar alınamadı:",err);
  }
}

onMounted(fetchSalons);
</script>

<style scoped>
  .main {
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
.cards {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center; /* Kartları ortala ve boşluk bırak */
  gap: 20px; /* Kartlar arası boşluk */
  padding: 2%;
  box-sizing: border-box;
}
</style>