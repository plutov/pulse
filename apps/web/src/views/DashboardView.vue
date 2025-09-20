<template>
  <div class="min-h-screen bg-white p-8">
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center border-b border-black pb-4 mb-8">
        <h1 class="text-3xl font-bold text-black">Dashboard</h1>
        <button 
          @click="logout"
          class="bg-black text-white px-4 py-2 border border-black hover:bg-white hover:text-black transition-colors"
        >
          Logout
        </button>
      </div>
      
      <div class="text-center text-black">
        <p class="text-xl">Welcome to Pulse Dashboard</p>
        <p class="mt-4">Monitor management will go here.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>