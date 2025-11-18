<template>
    <n-marquee>
          <n-h1 prefix="bar">
              <n-text type="primary">
                HRIS
              </n-text>
            </n-h1>
            Human Resource Information System</n-marquee>
  <div class="login-wrapper">
    <n-card title="Login" style="max-width: 400px; margin: 0 auto;">
      <n-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-placement="top"
      >
        <n-form-item label="Username" path="username">
          <n-input v-model:value="form.username" placeholder="Masukkan username" />
        </n-form-item>

        <n-form-item label="Password" path="password">
          <n-input
            v-model:value="form.password"
            type="password"
            show-password-on="click"
            placeholder="Masukkan password"
          />
        </n-form-item>

        <n-space justify="end">
          <n-button
            type="primary"
            :loading="loading"
            @click="submit"
          >
            Login
          </n-button>
        </n-space>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FormInst, useMessage } from 'naive-ui'
import { Config } from '@/constant/config'

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const message = useMessage()

const form = ref({
  username: 'admin',
  password: '123456'
})

const rules = {
  username: [
    { required: true, message: 'Username wajib diisi', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Password wajib diisi', trigger: 'blur' }
  ]
}

const emit = defineEmits(['login-success'])

const submit = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true
      try {
        const response = await fetch(Config.UrlBackend+'/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            appid: Config.AppId,
            username: form.value.username,
            password: form.value.password
          })
        })

        if (!response.ok) {
          message.error('Username atau password salah')
          loading.value = false
          return
        }

        const data = await response.json()

        // Simpan token misalnya ke localStorage
        localStorage.setItem(Config.TokenName, JSON.stringify(data))
        //localStorage.setItem(Config.SessionName, data.session)
        message.success('Login berhasil!')

        emit('login-success')
      } catch (error) {
        console.error(error)
        message.error('Terjadi kesalahan saat login')
      } finally {
        loading.value = false
      }
    }
  })
}



</script>

<style scoped>
.login-wrapper {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
