<template>
  <div class="comment-card">
    <p><strong>{{ comment.name }}</strong> dedi ki:</p>
    <p>{{ comment.text }}</p>
    <small>{{ new Date(comment.created_at).toLocaleString() }}</small>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  comment: Object
})
</script>

<style scoped>
.comment-card {
  flex: 0 1 300px;
  max-width: none;
  margin: 10px;
  background: #f2f2f2;
  border-radius: 8px;
  padding: 10px;
  box-sizing: border-box;
}
</style>
