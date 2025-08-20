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
    const selectedOrgId = ref<string | number | null>(null)
    const tableData = ref([])
    const current = ref(1)
    const pageSize = ref(50)
    const total = ref(0)
    const loading = ref(false)

    const genderOptions = [
      { label: 'Laki-Laki', value: 'L' },
      { label: 'Perempuan', value: 'P' }
    ]

    const onOrgSelected = (orgId: string | number | null) => {
      selectedOrgId.value = orgId;
      console.log('Selected Org ID:', selectedOrgId.value)
      fetchData(current.value)
    }

    const fetchData = async (page = 1) => {
      tableData.value = []
      const token = localStorage.getItem(Config.TokenName)
      const session = localStorage.getItem(Config.SessionName)
      if (!token) {
        console.error('No token found!')
        return false
      }
      loading.value = true
      const response = await fetch(
        `${Config.UrlBackend}/api/employee?page=${page}&pageSize=${pageSize.value}&inputSearch=${inputSearch.value}&selectedOrgId=${selectedOrgId.value}`,
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
      national_id_number:'',
      front_title:'',
      name: '',
      end_title:'',
      birth_date: '',
      gender: '',
      address: '',
      phone_number:'',
      email:''
    })

    const formDataFilter = ref({
      professional_id: '',
      professional_group_id: ''
    })

    const openAddModal = () => {
      isEditMode.value = false
      formData.value = {
        id: null,
        national_id_number:'',
        front_title:'',
        name: '',
        end_title:'',
        birth_date: '',
        gender: '',
        address: '',
        phone_number:'',
        email:''
      }
      isModalOpen.value = true
    }

    const openEditModal = (row) => {
      isEditMode.value = true
      formData.value = { ...row }
      isModalOpen.value = true
    }
    const openProfile = (row) => {
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

    const submitForm = async () => {
      const token = localStorage.getItem(Config.TokenName)
      const session = localStorage.getItem(Config.SessionName)
      if (!token) {
        console.error('No token found!')
        return false
      }

      loading.value = true
      try {
        const url = isEditMode.value
          ? `${Config.UrlBackend}/api/person/update`
          : `${Config.UrlBackend}/api/person/create`

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            uSession: `${session}`
          },
          body: JSON.stringify({
            id: formData.value.id,
            national_id_number: formData.value.national_id_number,
            front_title: formData.value.front_title,
            name: formData.value.name,
            end_title: formData.value.end_title,
            birth_date: formData.value.birth_date,
            gender: formData.value.gender,
            address: formData.value.address,
            phone_number: formData.value.phone_number,
            email: formData.value.email
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()
        message.success(data.message || (isEditMode.value ? 'Data diperbarui' : 'Data ditambahkan'))
        await fetchData(current.value) // refresh table
        isModalOpen.value = false
      } catch (error) {
        console.error(error)
        message.error('Terjadi kesalahan saat menyimpan data')
      } finally {
        loading.value = false
      }
    }


    const columns = [      
      { title: 'ID', key: 'employee_id' },
      { title: 'Title depan', key: 'front_title' },
      { title: 'Name', key: 'name',fixed: 'left' },
      { title: 'Title belakang', key: 'end_title' },
      { title: 'NIP', key: 'national_employee_id_number' },
      { title: 'Status Pegawai', key: 'employee_category_name' },
      { title: 'Jabatan profesi', key: 'professional_name' },
      { title: 'Unit kerja', key: 'organization_name' },      
      { title: 'Jabatan manajerial', key: 'position_name' },
      { title: 'NIK', key: 'national_id_number' },
      { title: 'Tgl Lahir', key: 'birth_date' },
      { title: 'JKel', key: 'gender' },
      { title: 'Alamat', key: 'address' },
      { title: 'Phone', key: 'phone_number' },
      { title: 'Email', key: 'email' },
      {
        title: 'Aksi',
        key: 'actions',
        fixed: 'right',
        width: 120,
        render(row) {
          return h(
          'div',
          { class: 'flex gap-2' },
          [
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                onClick: () => openEditModal(row)
              },
              { default: () => 'Ubah Personal' }
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'success',
                onClick: () => openProfile(row)
              },
              { default: () => 'Lihat Profil' }
            )
          ]
        )
        }
      },
    ]

    // Fetch data once created
   // fetchData(current.value)

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
      onOrgSelected,

      isModalOpen,
      isEditMode,
      formData,
      openAddModal,
      openEditModal,
      openProfile,
      closeModal,
      submitForm,
      genderOptions,

      formDataFilter
    }
  }
})
