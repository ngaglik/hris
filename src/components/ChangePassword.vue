<template>
  <n-modal
    :show="show"
    preset="card"
    title="Ubah Password"
    style="width: 420px"
    :mask-closable="false"
    :close-on-esc="false"
    @update:show="onUpdateShow"
  >
    <n-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-placement="top"
      @keyup.enter="submit"
    >
      <n-form-item label="Password Lama" path="oldPassword">
        <n-input
          v-model:value="form.oldPassword"
          type="password"
          show-password-on="click"
          placeholder="Masukkan password lama"
          :disabled="loading"
        />
      </n-form-item>

      <n-form-item label="Password Baru" path="newPassword">
        <n-input
          v-model:value="form.newPassword"
          type="password"
          show-password-on="click"
          placeholder="Masukkan password baru"
          :disabled="loading"
        />
      </n-form-item>

      <n-form-item label="Konfirmasi Password Baru" path="confirmPassword">
        <n-input
          v-model:value="form.confirmPassword"
          type="password"
          show-password-on="click"
          placeholder="Ulangi password baru"
          :disabled="loading"
        />
      </n-form-item>
    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button :disabled="loading" @click="onCancel">Batal</n-button>
        <n-button type="primary" :loading="loading" @click="submit">
          Simpan
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { FormInst, useMessage } from "naive-ui";
import { Config } from "@/constant/config";
import { apiFetch } from "@/services/apiClient";

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
}>();

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const loading = ref(false);

const form = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const rules = {
  oldPassword: [
    { required: true, message: "Password lama wajib diisi", trigger: "blur" },
  ],
  newPassword: [
    { required: true, message: "Password baru wajib diisi", trigger: "blur" },
    {
      validator: (
        _rule: unknown,
        value: string,
        callback: (error?: Error) => void,
      ) => {
        if (value && value.length < 6) {
          callback(new Error("Password baru minimal 6 karakter"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  confirmPassword: [
    {
      required: true,
      message: "Konfirmasi password wajib diisi",
      trigger: "blur",
    },
    {
      validator: (
        _rule: unknown,
        value: string,
        callback: (error?: Error) => void,
      ) => {
        if (value !== form.newPassword) {
          callback(new Error("Konfirmasi password tidak cocok"));
        } else {
          callback();
        }
      },
      trigger: ["blur", "input"],
    },
  ],
};

const resetForm = () => {
  form.oldPassword = "";
  form.newPassword = "";
  form.confirmPassword = "";
  formRef.value?.restoreValidation();
};

const onUpdateShow = (value: boolean) => {
  emit("update:show", value);
  if (!value) resetForm();
};

const onCancel = () => {
  emit("update:show", false);
  resetForm();
};

const submit = async () => {
  if (loading.value) return;

  await formRef.value?.validate(async (errors) => {
    if (errors) return;

    loading.value = true;

    try {
      const response = (await apiFetch(
        `${Config.UrlBackend}/api/auth/change-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            oldPassword: form.oldPassword,
            newPassword: form.newPassword,
          }),
        },
      )) as Response;

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        message.error(result?.message ?? "Gagal mengubah password");
        return;
      }

      message.success(result?.message ?? "Password berhasil diubah");
      emit("update:show", false);
      resetForm();
    } catch (error) {
      console.error("Change password error:", error);
      message.error("Terjadi kesalahan saat mengubah password");
    } finally {
      loading.value = false;
    }
  });
};
</script>
