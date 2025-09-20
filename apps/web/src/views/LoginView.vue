<template>
  <div class="min-h-screen bg-white flex items-center justify-center">
    <div class="w-full max-w-md">
      <form @submit.prevent="handleLogin" class="border border-black p-8">
        <h2 class="text-2xl font-bold text-black mb-6 text-center">Login</h2>
        
        <div class="mb-4">
          <label for="username" class="block text-black text-sm font-bold mb-2">
            Username
          </label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="w-full px-3 py-2 border border-black text-black bg-white focus:outline-none focus:border-black"
          />
        </div>
        
        <div class="mb-6">
          <label for="password" class="block text-black text-sm font-bold mb-2">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full px-3 py-2 border border-black text-black bg-white focus:outline-none focus:border-black"
          />
        </div>
        
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-black text-white py-2 px-4 border border-black hover:bg-white hover:text-black transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        
        <div v-if="error" class="mt-4 text-black text-sm text-center">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/services/api'

const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await authApi.login({
      loginPayload: {
        username: username.value,
        password: password.value
      }
    })
    
    localStorage.setItem('token', response.token)
    router.push('/dashboard')
  } catch (err) {
    error.value = 'Invalid username or password'
  } finally {
    loading.value = false
  }
}
</script>