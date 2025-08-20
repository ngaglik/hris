<template>
  <div>
    <n-form-item label="Organisasi">
      <n-tree-select
        :options="options"
        @update:value="handleUpdateValue"
      />
    </n-form-item>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import type { TreeSelectOption } from 'naive-ui'
import { Config } from '@/constant/config'

export default defineComponent({
  emits: ['update'], // ✅ emit event ke parent

  setup(_, { emit }) {
    const options = ref<TreeSelectOption[]>([])

    const handleUpdateValue = (
      value: string | number | Array<string | number> | null,
      option: TreeSelectOption | null | Array<TreeSelectOption | null>
    ) => {
      console.log('Selected:', value, option)
      emit('update', value) // ✅ emit ke parent
    }

    const token = localStorage.getItem(Config.TokenName)
    const session = localStorage.getItem(Config.SessionName)
    if (!token) {
      console.error('No token found!')
      return false
    }

    onMounted(async () => {
      const response = await fetch(Config.UrlBackend + `/api/organization/tree`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          uSession: `${session}`,
        },
      })
      options.value = await response.json()
    })

    return {
      options,
      handleUpdateValue
    }
  }
})
</script>
