import { defineComponent, ref, h } from 'vue'
import { useMessage, useDialog, NButton } from 'naive-ui'
import { Config } from '@/constant/config'
import { apiFetch } from "@/services/apiClient"
import { getAuthData, logout } from "@/services/authService"

const BASE = '/api/graduation'

export default defineComponent({
  setup() {
    const dialog = useDialog()
    const message = useMessage()
    const inputSearch = ref('')
    const tableData = ref<any[]>([])
    const current = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    const loading = ref(false)
    let auth = getAuthData()
    if (!auth) {
      logout();
      return null;
    }

    const fetchData = async (page = 1) => {
      loading.value = true
      try {
        const response = await apiFetch(
          Config.UrlBackend + `${BASE}?page=${page}&pageSize=${pageSize.value}&inputSearch=${encodeURIComponent(inputSearch.value)}`,
          { method: "GET" }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json()
        tableData.value = result.data || []
        current.value = result.page || 1
        total.value = result.total || 0
      } catch (error) {
        console.error(error)
        message.error("Gagal memuat data")
      } finally {
        loading.value = false
      }
    }

    const isModalOpen = ref(false)
    const isEditMode = ref(false)

    const formData = ref({
      id: null as number | null,
      name: ''
    })

    const openAddModal = () => {
      isEditMode.value = false
      formData.value = { id: null, name: '' }
      isModalOpen.value = true
    }

    const openEditModal = (row: any) => {
      isEditMode.value = true
      formData.value = { id: row.id ?? null, name: row.name ?? '' }
      isModalOpen.value = true
    }

    const closeModal = () => {
      isModalOpen.value = false
    }

    const handleInputSearch = () => {
      current.value = 1
      fetchData(1)
    }

    const handlePageChange = (page: number) => {
      current.value = page
      fetchData(page)
    }

    const submitForm = async () => {
      if (!formData.value.name || !formData.value.name.trim()) {
        message.warning("Nama wajib diisi")
        return
      }

      loading.value = true
      try {
        const url = isEditMode.value
          ? Config.UrlBackend + `${BASE}/${formData.value.id}`
          : Config.UrlBackend + BASE

        const response = await apiFetch(url, {
          method: isEditMode.value ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formData.value.name })
        })

        const result = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(result?.message || `HTTP error! status: ${response.status}`)
        }

        message.success(
          result?.message ||
          (isEditMode.value ? "Data diperbarui" : "Data ditambahkan")
        )
        isModalOpen.value = false
        await fetchData(current.value)
      } catch (error: any) {
        console.error(error)
        message.error(error?.message || "Terjadi kesalahan saat menyimpan data")
      } finally {
        loading.value = false
      }
    }

    const deleteData = (row: any) => {
      dialog.warning({
        title: "Konfirmasi Hapus",
        content: `Apakah yakin ingin menghapus data "${row.name}"?`,
        positiveText: "Hapus",
        negativeText: "Batal",
        onPositiveClick: async () => {
          loading.value = true
          try {
            const response = await apiFetch(
              Config.UrlBackend + `${BASE}/${row.id}`,
              { method: "DELETE", headers: { "Content-Type": "application/json" } }
            )
            const result = await response.json().catch(() => ({}))
            if (!response.ok) {
              throw new Error(result?.message || "Gagal menghapus data")
            }
            message.success(result?.message || "Data berhasil dihapus")
            if (tableData.value.length === 1 && current.value > 1) {
              current.value -= 1
            }
            await fetchData(current.value)
          } catch (error: any) {
            console.error(error)
            message.error(error?.message || "Gagal menghapus data")
          } finally {
            loading.value = false
          }
        }
      })
    }

    const columns = [
      { title: 'Id', key: 'id', width: 140 },
      { title: 'Name', key: 'name' },
      {
        title: 'Aksi',
        key: 'actions',
        width: 160,
        render(row: any) {
          return h('div', { class: 'flex gap-2' }, [
            h(NButton, { size: 'small', type: 'primary', onClick: () => openEditModal(row) }, { default: () => 'Ubah' }),
            h(NButton, { size: 'small', type: 'error', onClick: () => deleteData(row) }, { default: () => 'Hapus' })
          ])
        }
      },
    ]

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
      deleteData
    }
  }
})
