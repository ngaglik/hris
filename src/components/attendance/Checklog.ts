import { defineComponent, ref, h } from 'vue'
import { useMessage,useDialog, NButton, NDatePicker } from 'naive-ui'
import { Config, generalOptions } from '@/constant/config'
import { apiFetch } from "@/services/apiClient"
import { getAuthData, saveAuthData, logout } from "@/services/authService"

export default defineComponent({
  setup() {
    const message = useMessage()
    const inputSearch = ref('')
    
    const tableData = ref([])
    const current = ref(1)
    const pageSize = ref(100)
    const total = ref(0)
    const loading = ref(false)
    const formFilter = ref({
      id: null,
      year: 2025,
      month: new Date().getMonth() + 1,
    })

    const fetchData = async (page = 1) => {
      let auth = getAuthData()
      let token = auth?.token
      let session = auth?.session
      let employeeId = auth?.employee?.[0].id

      loading.value = true      
      const response = await apiFetch(`${Config.UrlBackend}/api/attendance/getfingerlog?employeeId=${employeeId}&year=${formFilter.value.year}&month=${formFilter.value.month}&page=${page}&pageSize=${pageSize.value}&inputSearch=${inputSearch.value}`, {
        method: "GET"
      });
      if (!response.ok) return false;
      const result = await response.json()
      tableData.value = result.data
      current.value = result.page
      total.value = result.total
      loading.value = false
    }

    

     
    const handleInputSearch = () => {
      fetchData(current.value)
    }

    const handlePageChange = (page) => {
      current.value = page
      fetchData(page)
    }

    const columns = [
      
      { title: 'Nama', key: 'employee_name' },
      { title: 'Tanggal', key: 'dateonly_input' },
      { title: 'Jam', key: 'timeonly_input' },
      { title: 'Ket', key: 'annotaion' }
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
      
    }
  }
})
