import { onMounted, defineComponent, ref, h , computed} from 'vue'
import { useMessage, useDialog, NButton } from 'naive-ui'
import { Config } from '@/constant/config'
import { apiFetch } from "@/services/apiClient"
import { getAuthData, saveAuthData, logout } from "@/services/authService"

export default defineComponent({
  props: {
    personId: {
      type: String,
      default: ''
    },
    familyId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      profile: {},
      loading: false
    }
  },
  setup(props) {
    const dialog = useDialog()
    const message = useMessage()

    // state
    const inputSearch = ref('')
    const tableData = ref<any[]>([])
    const current = ref(1)
    const pageSize = ref(50)
    const total = ref(0)
    const loading = ref(false)


    let auth = getAuthData()
    if (!auth) {
        logout();
        return null;
      }
    let token = auth?.token
    let session = auth?.session
    const employee = auth.employee?.[0]
    const tags = employee?.tags ?? []

    const famId = computed(() => {
      const employee = auth?.employee?.[0]
      return props.familyId || employee?.familyId || ''
    })
    

    const maritalOptions = ref<any[]>([])
    const fetchMaritalOptions = async () => {
      try {
        const response = await apiFetch(
          `${Config.UrlBackend}/api/option/marital`,
          { method: 'GET' }
        )

        const result = await response.json()

        // asumsi response:
        // [{ id: 1, name: 'Suami' }, { id: 2, name: 'Istri' }]
        maritalOptions.value = (result.data || result).map((item: any) => ({
          label: item.name,
          value: item.id
        }))
      } catch (error) {
        console.error(error)
        message.error('Gagal memuat status perkawinan')
      }
    }
  const getMaritalOptionsLabel = (value: string | number | null | undefined) => {
    if (value == null) return '-'
    const option = maritalOptions.value.find(
      o => String(o.value) === String(value)
    )
    return option?.label ?? '-'
  }

    const familyRelationshipOptions = ref<any[]>([])
    const fetchFamilyRelationshipOptions = async () => {
      try {
        const response = await apiFetch(
          `${Config.UrlBackend}/api/option/family_relationship`,
          { method: 'GET' }
        )

        const result = await response.json()

        // asumsi response:
        // [{ id: 1, name: 'Suami' }, { id: 2, name: 'Istri' }]
        familyRelationshipOptions.value = (result.data || result).map((item: any) => ({
          label: item.name,
          value: item.id
        }))
      } catch (error) {
        console.error(error)
        message.error('Gagal memuat hubungan keluarga')
      }
    }
    const getFamilyRelationshipLabel = (value: string | number | null | undefined) => {
    if (value == null) return '-'
    const option = familyRelationshipOptions.value.find(
      o => String(o.value) === String(value)
    )
    return option?.label ?? '-'
  }
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

    const fetchData = async (page = 1) => {
      loading.value = true
      const response = await apiFetch(`${Config.UrlBackend}/api/person/family?page=${page}&pageSize=${pageSize.value}&inputSearch=${inputSearch.value}&familyId=${famId.value}`, {
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
      national_id_number: '',
      name: '',
      birth_date: '',
      gender: '',
      family_id:'',
      family_relationship_id :'',
    })


    // modal methods
    const openAddModal = () => {
      isEditMode.value = false
      formData.value = {
        id: null,
        national_id_number: '',
        name: '',
        birth_date: '',
        gender: '',
        family_relationship_id :'',
        family_id : famId,
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

    const deleteData = async (row: any) => {
      dialog.warning({
        title: 'Konfirmasi Hapus',
        content: `Apakah yakin ingin menghapus data "${row.name}"?`,
        positiveText: 'Hapus',
        negativeText: 'Batal',
        onPositiveClick: async () => {
          loading.value = true
          try {
            const response = await apiFetch(
              `${Config.UrlBackend}/api/person/family/${row.id}`,
              {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            )

            if (!response.ok) {
              const err = await response.json()
              throw new Error(err.message || 'Gagal menghapus data')
            }

            const result = await response.json()
            message.success(result.message || 'Data berhasil dihapus')

            // reload data
            await fetchData(current.value)
          } catch (error) {
            console.error(error)
            message.error('Gagal menghapus data')
          } finally {
            loading.value = false
          }
        }
      })
    }


    // form submit
    const submitForm = async () => {
      if (!token) return

      loading.value = true
      try {
        const url = isEditMode.value
          ? `${Config.UrlBackend}/api/person/family_update`
          : `${Config.UrlBackend}/api/person/family_add`

        // 🔥 BEDAKAN PAYLOAD
        let payload: any

        if (isEditMode.value) {
          // EDIT → PAKAI ID
          payload = { ...formData.value }
        } else {
          // CREATE → HAPUS ID
          const { id, ...withoutId } = formData.value
          payload = withoutId
        }

        const response = await apiFetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        })

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
      { title: 'Name', key: 'name', fixed: 'left'},
      { title: 'Hubungan Keluarga', key: 'family_relationship_id', render: (row: any) => getFamilyRelationshipLabel(row.family_relationship_id)},
      { title: 'NIK', key: 'national_id_number' },
      { title: 'Tgl Lahir', key: 'birth_date' },
      { title: 'Kelamin', key: 'gender', render: (row: any) => getGenderLabel(row.gender)},
      { title: 'Status Perkawinan', key: 'is_married', render: (row: any) => getMarriedLabel(row.is_married) },
      { title: 'NPWP', key: 'tax_id_number' },
      { title: 'Status Pelaporan Suami-Istri', key: 'is_tax_combined', render: (row: any) => getTaxCombinedLabel(row.is_tax_combined) },
      { title: 'Status Perkawinan (SPT)', key: 'tax_marital_id', render: (row: any) => getMaritalOptionsLabel(row.tax_marital_id) },
      {
        title: 'Aksi',
        key: 'actions',
        //fixed: 'right',
        width: 80,
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
                  type: 'error',
                  onClick: () => deleteData(row)
                },
                { default: () => 'Hapus' }
              )
            ]
          )
        }
      },
    ]

    // load pertama kali
    onMounted(() => {
      fetchFamilyRelationshipOptions()
      fetchMaritalOptions()
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
      getGenderLabel,
      marriedOptions,
      getMarriedLabel,
      taxCombinedOptions,
      getTaxCombinedLabel,
      familyRelationshipOptions,
      getFamilyRelationshipLabel,

      maritalOptions,
      fetchMaritalOptions,
      getMaritalOptionsLabel,

      deleteData,
      employee,
      famId
    }
  }
})
