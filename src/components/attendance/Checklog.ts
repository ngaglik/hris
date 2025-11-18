import { defineComponent, ref, h } from 'vue'
import { useMessage,useDialog, NButton, NDatePicker } from 'naive-ui'
import { Config, generalOptions } from '@/constant/config'
import { CheckBearerExpired } from '../../secured'

export default defineComponent({
  setup() {
    const message = useMessage()
    const inputSearch = ref('')
    
    const tableData = ref([])
    const current = ref(1)
    const pageSize = ref(100)
    const total = ref(0)
    const loading = ref(false)
    
    const fetchData = async (page = 1) => {
      const localData = JSON.parse(localStorage.getItem(Config.TokenName) || "{}");
      const token = localData.token;
      const session = localData.session; 
      if (!token) {
        console.error('No token found!');
        return false;
      }
      loading.value = true
      const response = await fetch(
        `${Config.UrlBackend}/api/employee/unit?sessionId=${session}&page=${page}&pageSize=${pageSize.value}&inputSearch=${inputSearch.value}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            uSession: `${session}`
          }
        }
      )
      CheckBearerExpired(response.status)
      const result = await response.json()
      tableData.value = result.data
      current.value = result.page
      total.value = result.total
      loading.value = false
    }

    const formFilter = ref({
      id: null,
      year: 2025,
      month: 1,
    })

     
    const handleInputSearch = () => {
      fetchData(current.value)
    }

    const handlePageChange = (page) => {
      current.value = page
      fetchData(page)
    }

    const submitForm = () => {
      if (isEditMode.value) {
        message.success(`Data updated: ${formData.value.asset_name}`)
        // TODO: panggil API update
      } else {
        message.success(`Data added: ${formData.value.asset_name}`)
        // TODO: panggil API add
      }
      isModalOpen.value = false
    }

    const columns = [
      
      { title: 'Name', key: 'name' },
      { title: 'Tgl Lahir', key: 'birth_date' },
      { title: 'JKel', key: 'gender' },
      { title: 'Alamat', key: 'address' }
    ]

    // Fetch data once created
    fetchData(current.value)

    return {
      columns,
      tableData,
      current,
      pageSize,
      total,
      loading,
      inputSearch,
      handleInputSearch,
      handlePageChange,

      generalOptions,
      formFilter,
      submitForm,
    }
  }
})
