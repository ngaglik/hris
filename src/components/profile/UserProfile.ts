import { defineComponent, ref, computed, onMounted } from 'vue'
import { Config } from '@/constant/config'
import { apiFetch } from "@/services/apiClient"
import { getAuthData, saveAuthData, logout } from "@/services/authService"
import Education from './Education.vue'

export default defineComponent({
  components: { Education },

  props: {
    employeeId: {
      type: String,
      default: ''
    },
    personId: {
      type: String,
      default: ''
    }
  },

  setup(props) {
    const profile = ref<any>({})
    const loading = ref(false)
    let auth = getAuthData()
    let token = auth?.token
    let session = auth?.session

    const persId = computed(() => {
      const employee = auth?.employee?.[0]
      return props.personId || props.employeeId || employee?.personId || ''
    })

    const empId = computed(() => {
      const employee = auth?.employee?.[0]

      return props.employeeId || employee?.id || ''
    })
    

    const fetchData = async () => {      
      loading.value = true
      const response = await apiFetch(`${Config.UrlBackend}/api/person/${persId.value}`, {
        method: "GET"
      });
      const result = await response.json()
      profile.value = Array.isArray(result) ? result[0] : result
      tableData.value = result.data
      current.value = result.page
      total.value = result.total
      loading.value = false
    }

    onMounted(() => fetchData())

    return {
      profile,
      loading,
      empId,
      persId,
      fetchData
    }
  }
})