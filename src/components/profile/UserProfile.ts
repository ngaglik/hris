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
    const profileEmployee = ref<any>({})
    const profilePerson = ref<any>({})
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
    const getGenderLabel = (value: string | null | undefined) => {
      const option = genderOptions.find(o => o.value === value)
      return option ? option.label : '-'
    }

    const marriedOptions = [
      { label: 'Kawin', value: true },
      { label: 'Tidak Kawin', value: false }
    ]
    const getMarriedLabel = (value: boolean | null | undefined) => {
      const option = marriedOptions.find(o => o.value === value)
      return option ? option.label : '-'
    }

    const taxCombinedOptions = [
      { label: 'SPT Digabung', value: true },
      { label: 'SPT Terpisah', value: false }
    ]
    const getTaxCombinedLabel = (value: boolean | null | undefined) => {
      const option = taxCombinedOptions.find(o => o.value === value)
      return option ? option.label : '-'
    }

    let auth = getAuthData()
    if (!auth) {
      logout()
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
    

    const fetchDataPerson = async () => {      
      loading.value = true
      try {
        const response = await apiFetch(
          `${Config.UrlBackend}/api/person/${persId.value}`,
          { method: "GET" }
        )
        const result = await response.json()
        profilePerson.value = result[0]
      } finally {
        loading.value = false
      }
    }
    const fetchDataEmployee = async () => {      
      loading.value = true
      try {
        const response = await apiFetch(
          `${Config.UrlBackend}/api/employee/${persId.value}`,
          { method: "GET" }
        )
        const result = await response.json()
        profileEmployee.value = result[0]
      } finally {
        loading.value = false
      }
    }

    const handleEditData = async () => {
      isModalOpen.value = true  
    }
    const closeModal = () => {
      isModalOpen.value = false
    }

    // form submit
    const submitForm = async () => {
      if (!token) {
        console.error('No token found!')
        return
      }

      loading.value = true
      try {
        const url = `${Config.UrlBackend}/api/person/update`
        const response = await apiFetch(url, {
          method: "POST",
          body: JSON.stringify(profilePerson.value),
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        message.success(data.message ||  'Data diperbarui')
        await fetchDataPerson()
        isModalOpen.value = false
      } catch (error) {
        console.error(error)
        message.error('Terjadi kesalahan saat menyimpan data')
      } finally {
        loading.value = false
      }
    }

    onMounted(async () => {
      loading.value = true
      try {
        await Promise.all([
          fetchDataPerson(),
          fetchDataEmployee()
        ])
      } finally {
        loading.value = false
      }
    })


    return {
      isModalOpen,
      handleEditData,
      closeModal,
      profilePerson,
      profileEmployee,
      tableData,
      current,
      pageSize,
      total,
      loading,
      submitForm,

      genderOptions,
      getGenderLabel,
      marriedOptions,
      getMarriedLabel,
      taxCombinedOptions,
      getTaxCombinedLabel,
      empId,
      persId,
      fetchDataPerson,
      fetchDataEmployee,
    }
  }
})