import { onMounted,defineComponent, ref, h } from 'vue'
import { useMessage,useDialog, NButton, NDatePicker } from 'naive-ui'
import { Config } from '@/constant/config'
import { CheckBearerExpired } from '../../secured'
import selectTree from '@/container/selectTree/selectTree.vue'

export default defineComponent({
  components: {
    selectTree
  },
  setup() {
    const dialog = useDialog()
    const message = useMessage()
    const inputSearch = ref('')
    const tableData = ref([])
    const current = ref(1)
    const pageSize = ref(50)
    const total = ref(0)
    const loading = ref(false)

    const genderOptions = [
      { label: 'Laki-Laki', value: 'L' },
      { label: 'Perempuan', value: 'P' }
    ]


    const fetchData = async (page = 1) => {
      const token = localStorage.getItem(Config.TokenName)
      const session = localStorage.getItem(Config.SessionName)
      if (!token) {
        console.error('No token found!')
        return false
      }
      loading.value = true
      const response = await fetch(
        `${Config.UrlBackend}/api/employee?page=${page}&pageSize=${pageSize.value}&inputSearch=${inputSearch.value}`,
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

    const isModalOpen = ref(false)
    const isEditMode = ref(false)

    const formData = ref({
      id: null,
      name: '',
      birth_date: '',
      gender: '',
      address: ''
    })

    const formDataFilter = ref({
      professional_id: '',
      professional_group_id: ''
    })

    const openAddModal = () => {
      isEditMode.value = false
      formData.value = {
        id: null,
        name: '',
        birth_date: '',
        gender: '',
        address: ''
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
      { title: 'Name', key: 'name',fixed: 'left' },
      { title: 'NIP', key: 'national_employee_id_number' },
      { title: 'Status Pegawai', key: 'employee_category_name' },
      { title: 'Jabatan profesi', key: 'professional_name' },
      { title: 'Unit kerja', key: 'organization_name' },      
      { title: 'Jabatan manajerial', key: 'position_name' },
      { title: 'NIK', key: 'national_id_number' },
      { title: 'Tgl Lahir', key: 'birth_date' },
      { title: 'JKel', key: 'gender' },
      { title: 'Alamat', key: 'address' },
      { title: 'Phone', key: 'phone_number' }
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
      submitForm,
      genderOptions,

      formDataFilter
    }
  }
})
