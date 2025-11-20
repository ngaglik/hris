import { onMounted, defineComponent, ref, h } from 'vue'
import { useMessage, useDialog, NButton } from 'naive-ui'
import { Config } from '@/constant/config'
import { apiFetch } from "@/services/apiClient"
import { getAuthData, saveAuthData, logout } from "@/services/authService"
import selectTree from '@/container/selectTree/selectTree.vue'
import UserProfile from '../profile/UserProfile.vue'

export default defineComponent({
  components: {
    selectTree,
    UserProfile
  },
  setup() {
    const dialog = useDialog()
    const message = useMessage()

    // state
    const inputSearch = ref('')
    const selectedOrgId = ref<string | number | null>(null)
    const tableData = ref<any[]>([])
    const current = ref(1)
    const pageSize = ref(50)
    const total = ref(0)
    const loading = ref(false)
    let auth = getAuthData()
    let token = auth?.token
    let session = auth?.session
    let employee = auth?.employee
   
    const genderOptions = [
      { label: 'Laki-Laki', value: 'L' },
      { label: 'Perempuan', value: 'P' }
    ]

    const fetchData = async (page = 1) => {
      loading.value = true
      const response = await apiFetch(`${Config.UrlBackend}/api/employee?page=${page}&pageSize=${pageSize.value}&inputSearch=${inputSearch.value}&selectedOrgId=${selectedOrgId.value}`, {
        method: "GET"
      });
      const result = await response.json()
      tableData.value = result.data || []
      current.value = result.page || 1
      total.value = result.total || 0
      loading.value = false
    }

    // modal state
    const isModalOpen = ref(false)
    const isEditMode = ref(false)
    const isPreviewOpen = ref(false)

    const formData = ref({
      id: null,
      person_id: '',
      national_id_number: '',
      front_title: '',
      name: '',
      end_title: '',
      birth_date: '',
      gender: '',
      address: '',
      phone_number: '',
      email: ''
    })

    const formDataFilter = ref({
      professional_id: '',
      professional_group_id: ''
    })

    // modal methods
    const openAddModal = () => {
      isEditMode.value = false
      formData.value = {
        id: null,
        person_id: '',
        national_id_number: '',
        front_title: '',
        name: '',
        end_title: '',
        birth_date: '',
        gender: '',
        address: '',
        phone_number: '',
        email: ''
      }
      isModalOpen.value = true
    }

    const openEditModal = (row: any) => {
      isPreviewOpen.value = false
      isEditMode.value = true
      formData.value = { ...row }
      isModalOpen.value = true
    }

    const openProfile = (row: any) => {
      isModalOpen.value = false
      formData.value = { ...row }
      isPreviewOpen.value = true
    }

    const closeModal = () => {
      isModalOpen.value = false
    }

    // table & pagination
    const handleInputSearch = () => {
      fetchData(current.value)
    }

    const handlePageChange = (page: number) => {
      current.value = page
      fetchData(page)
    }

    // form submit
    const submitForm = async () => {
      if (!token) {
        console.error('No token found!')
        return
      }

      loading.value = true
      try {
        const url = isEditMode.value
          ? `${Config.UrlBackend}/api/person/update`
          : `${Config.UrlBackend}/api/person/create`

        const response = await apiFetch(url, {
          method: "POST",
          body: JSON.stringify(formData.value),
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        message.success(data.message || (isEditMode.value ? 'Data diperbarui' : 'Data ditambahkan'))
        await fetchData(current.value)
        isModalOpen.value = false
      } catch (error) {
        console.error(error)
        message.error('Terjadi kesalahan saat menyimpan data')
      } finally {
        loading.value = false
      }
    }

    // table columns
    const columns = [
      {
        title: 'Aksi',
        key: 'actions',
        fixed: 'left',
        width: 150,
        render(row: any) {
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
                { default: () => 'Ubah' }
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
      { title: 'ID', key: 'employee_id' },
      { title: 'Title depan', key: 'front_title' },
      { title: 'Name', key: 'name', fixed: 'left' },
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
      { title: 'Email', key: 'email' }
    ]

    // load pertama kali
    onMounted(() => {
      fetchData(current.value)
    })

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
      onOrgSelected: (orgId: string | number | null) => {
        selectedOrgId.value = orgId
        fetchData(current.value)
      },
      isPreviewOpen,
      isModalOpen,
      isEditMode,
      formData,
      openAddModal,
      openEditModal,
      openProfile,
      closeModal,
      submitForm,
      genderOptions,
      employee,
      formDataFilter
    }
  }
})
