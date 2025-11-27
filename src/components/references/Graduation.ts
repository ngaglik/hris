import { defineComponent, ref, h } from 'vue'
import { useMessage,useDialog, NButton, NDatePicker } from 'naive-ui'
import { Config } from '@/constant/config'
import { apiFetch } from "@/services/apiClient"
import { getAuthData, saveAuthData, logout } from "@/services/authService"

export default defineComponent({
  setup() {
    const dialog = useDialog()
    const message = useMessage()
    const inputSearch = ref('')
    const tableData = ref([])
    const current = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    const loading = ref(false)
    let auth = getAuthData()
    if (!auth) {
        logout();
        return null;
      }
    let token = auth?.token
    let session = auth?.session
    let employee = auth?.employee
    
    const fetchData = async (page = 1) => {
      loading.value = true
      const response = await apiFetch(Config.UrlBackend+`/api/graduation?page=${page}&pageSize=${pageSize.value}&inputSearch=${inputSearch.value}`, {
        method: "GET"
      });
      const result = await response.json()
      tableData.value = result.data || []
      current.value = result.page || 1
      total.value = result.total || 0
      loading.value = false
    }

    const isModalOpen = ref(false)
    const isEditMode = ref(false)

    const formData = ref({
      id: null,
      name: ''
    })

    const openAddModal = () => {
      isEditMode.value = false
      formData.value = {
        id: null,
        name: ''
      }
      isModalOpen.value = true
    }

    const openEditModal = (row) => {
      isEditMode.value = true
      formData.value = { ...row }
      isModalOpen.value = true
    }

    const closeModal = () => {
      isModalOpen.value = false
    }
 
    const handleInputSearch = () => {
      fetchData(current.value)
    }

    const handlePageChange = (page) => {
      current.value = page
      fetchData(page)
    }

    const submitForm = () => {
      if (isEditMode.value) {
        message.success(`Data updated: ${formData.value.name}`)
        // TODO: panggil API update
      } else {
        message.success(`Data added: ${formData.value.name}`)
        // TODO: panggil API add
      }
      isModalOpen.value = false
    }

    const columns = [
      {
        title: 'Aksi',
        key: 'actions',
        render(row) {
          return h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              onClick: () => openEditModal(row)
            },
            { default: () => 'Edit' }
          )
        }
      },
      { title: 'Name', key: 'name' },
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

      isModalOpen,
      isEditMode,
      formData,
      openAddModal,
      openEditModal,
      closeModal,
      submitForm
    }
  }
})
