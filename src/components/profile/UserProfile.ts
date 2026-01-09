import { defineComponent, ref, computed, onMounted } from 'vue'
import { useMessage,useDialog, NButton, NDatePicker, NSelect } from 'naive-ui'
import { Config } from '@/constant/config'
import { apiFetch } from "@/services/apiClient"
import { getAuthData, saveAuthData, logout } from "@/services/authService"
import Education from './Education.vue'
import Family from './Family.vue'

export default defineComponent({
  components: { Education,Family },

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
    const message = useMessage()
    const profile = ref<any>({})
    const tableData = ref<any[]>([])
    const current = ref(1)
    const pageSize = ref(50)
    const total = ref(0)
    const loading = ref(false)

    const isModalOpen = ref(false)
    const genderOptions = [
      { label: 'Laki-Laki', value: 'L' },
      { label: 'Perempuan', value: 'P' }
    ]

    let auth = getAuthData()
    if (!auth) {
        logout();
        return null;
      }
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
      const response = await apiFetch(`${Config.UrlBackend}/api/employee/${persId.value}`, {
        method: "GET"
      });
      const result = await response.json()
      profile.value = Array.isArray(result) ? result[0] : result
      tableData.value = result.data
      current.value = result.page
      total.value = result.total
      loading.value = false
    }

    const handleEditData = async () => {
      isModalOpen.value = true  
    }
    const closeModal = () => {
      isModalOpen.value = false
    }

    onMounted(() => fetchData())

    return {
      isModalOpen,
      handleEditData,

      profile,
      tableData,
      current,
      pageSize,
      total,
      loading,

      genderOptions,
      empId,
      persId,
      fetchData
    }
  }
})