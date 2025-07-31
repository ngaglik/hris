import { defineComponent, ref, onMounted } from 'vue'
import type { TreeSelectOption } from 'naive-ui'
import { Config } from '@/constant/config'

export default defineComponent({
  setup() {
    const options = ref<TreeSelectOption[]>([])

    const handleUpdateValue = (
      value: string | number | Array<string | number> | null,
      option: TreeSelectOption | null | Array<TreeSelectOption | null>
    ) => {
      console.log(value, option)
    }
    const token = localStorage.getItem(Config.TokenName)
      const session = localStorage.getItem(Config.SessionName)
      if (!token) {
        console.error('No token found!')
        return false
      }

    onMounted(async () => {
      const response = await fetch(Config.UrlBackend+`/api/organization/tree`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          uSession: `${session}`,
        },
      });
      options.value = await response.json()
    })

    return {
      options,
      handleUpdateValue
    }
  }
})
