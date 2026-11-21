import { defineComponent, ref, h, computed } from 'vue'
import { useMessage, useDialog, NButton } from 'naive-ui'
import { Config } from '@/constant/config'
import { apiFetch } from "@/services/apiClient"
import { getAuthData, logout } from "@/services/authService"

const BASE = '/api/organization'

interface OrgRow {
  id: string
  parentId: string
  name: string
  children?: OrgRow[]
}

// Node as returned by /api/organization/treetable (same source as the
// "Struktur Organisasi dan SDM" table on the dashboard).
interface OrgNodeTable {
  index: string
  name: string
  children?: OrgNodeTable[]
}

export default defineComponent({
  setup() {
    const dialog = useDialog()
    const message = useMessage()
    const inputSearch = ref('')
    const loading = ref(false)
    const flatOrgs = ref<OrgRow[]>([])

    let auth = getAuthData()
    if (!auth) {
      logout();
      return null;
    }

    // ── Ambil hirarki organisasi (nested) ───────────────────────────────
    // Menggunakan endpoint yang sama dengan "Struktur Organisasi dan SDM"
    // pada dashboard agar hirarki yang tampil identik.
    const flattenTree = (
      nodes: OrgNodeTable[],
      parentId = ''
    ): OrgRow[] =>
      nodes.flatMap((node) => {
        const id = String(node.index)
        return [
          { id, parentId, name: node.name ?? '', children: [] as OrgRow[] },
          ...flattenTree(node.children ?? [], id),
        ]
      })

    const fetchData = async () => {
      loading.value = true
      try {
        const response = await apiFetch(
          Config.UrlBackend + `/api/organization/treetable`,
          { method: "GET" }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tree = (await response.json()) as OrgNodeTable[]
        flatOrgs.value = flattenTree(Array.isArray(tree) ? tree : [])
      } catch (error) {
        console.error(error)
        message.error("Gagal memuat data organisasi")
      } finally {
        loading.value = false
      }
    }

    // ── Bangun tree dari daftar flat ─────────────────────────────────────
    const buildTree = (rows: OrgRow[]): OrgRow[] => {
      const map = new Map<string, OrgRow>()
      rows.forEach(r => map.set(r.id, { ...r, children: [] }))

      const roots: OrgRow[] = []
      map.forEach(node => {
        const parent = node.parentId
        if (parent && parent !== '0' && parent !== node.id && map.has(parent)) {
          map.get(parent)!.children!.push(node)
        } else {
          roots.push(node)
        }
      })

      const sortRec = (list: OrgRow[]) => {
        list.sort((a, b) => a.name.localeCompare(b.name))
        list.forEach(n => sortRec(n.children || []))
      }
      sortRec(roots)
      return roots
    }

    // buang children kosong agar leaf tidak menampilkan panah expand
    const pruneEmpty = (nodes: OrgRow[]): OrgRow[] =>
      nodes.map(n => ({
        ...n,
        children: n.children && n.children.length ? pruneEmpty(n.children) : undefined
      }))

    // filter pencarian dengan tetap mempertahankan induk dari hasil yang cocok
    const filterTree = (nodes: OrgRow[], q: string): OrgRow[] => {
      if (!q) return nodes
      const result: OrgRow[] = []
      for (const node of nodes) {
        const kids = filterTree(node.children || [], q)
        if (node.name.toLowerCase().includes(q) || kids.length > 0) {
          result.push({ ...node, children: kids })
        }
      }
      return result
    }

    const tableData = computed<OrgRow[]>(() =>
      pruneEmpty(filterTree(buildTree(flatOrgs.value), inputSearch.value.trim().toLowerCase()))
    )

    const rowKey = (row: OrgRow) => row.id

    // ── State modal ──────────────────────────────────────────────────────
    const isModalOpen = ref(false)
    const isEditMode = ref(false)

    const formData = ref({
      id: '',
      parentId: '0',
      name: ''
    })

    const openAddModal = () => {
      isEditMode.value = false
      formData.value = { id: '', parentId: '0', name: '' }
      isModalOpen.value = true
    }

    const openAddChildModal = (row: OrgRow) => {
      isEditMode.value = false
      formData.value = { id: '', parentId: row.id, name: '' }
      isModalOpen.value = true
    }

    const openEditModal = (row: OrgRow) => {
      isEditMode.value = true
      formData.value = {
        id: row.id,
        parentId: row.parentId || '0',
        name: row.name
      }
      isModalOpen.value = true
    }

    const closeModal = () => {
      isModalOpen.value = false
    }

    // ── Parent options (tree-select) ─────────────────────────────────────
    const collectSelfAndDescendants = (rootId: string): Set<string> => {
      const childrenMap = new Map<string, string[]>()
      flatOrgs.value.forEach(r => {
        const arr = childrenMap.get(r.parentId) || []
        arr.push(r.id)
        childrenMap.set(r.parentId, arr)
      })

      const out = new Set<string>([rootId])
      const stack = [rootId]
      while (stack.length) {
        const cur = stack.pop() as string
        ;(childrenMap.get(cur) || []).forEach(child => {
          if (!out.has(child)) {
            out.add(child)
            stack.push(child)
          }
        })
      }
      return out
    }

    const parentOptions = computed(() => {
      const exclude = isEditMode.value && formData.value.id
        ? collectSelfAndDescendants(formData.value.id)
        : new Set<string>()

      const rows = flatOrgs.value.filter(r => !exclude.has(r.id))
      const toOption = (n: OrgRow): any => ({
        key: n.id,
        label: n.name,
        children: n.children && n.children.length ? n.children.map(toOption) : undefined
      })

      return [
        { key: '0', label: '— Root (tanpa induk) —' },
        ...buildTree(rows).map(toOption)
      ]
    })

    // ── Simpan (create/update) ───────────────────────────────────────────
    const submitForm = async () => {
      if (!formData.value.name || !formData.value.name.trim()) {
        message.warning("Nama organisasi wajib diisi")
        return
      }

      loading.value = true
      try {
        const url = isEditMode.value
          ? Config.UrlBackend + `${BASE}/${encodeURIComponent(formData.value.id)}`
          : Config.UrlBackend + BASE

        const response = await apiFetch(url, {
          method: isEditMode.value ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: formData.value.id,
            parentId: formData.value.parentId,
            name: formData.value.name
          })
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
        await fetchData()
      } catch (error: any) {
        console.error(error)
        message.error(error?.message || "Terjadi kesalahan saat menyimpan data")
      } finally {
        loading.value = false
      }
    }

    // ── Hapus ────────────────────────────────────────────────────────────
    const deleteData = (row: OrgRow) => {
      dialog.warning({
        title: "Konfirmasi Hapus",
        content: `Apakah yakin ingin menghapus organisasi "${row.name}"?`,
        positiveText: "Hapus",
        negativeText: "Batal",
        onPositiveClick: async () => {
          loading.value = true
          try {
            const response = await apiFetch(
              Config.UrlBackend + `${BASE}/${encodeURIComponent(row.id)}`,
              { method: "DELETE", headers: { "Content-Type": "application/json" } }
            )
            const result = await response.json().catch(() => ({}))
            if (!response.ok) {
              throw new Error(result?.message || "Gagal menghapus data")
            }
            message.success(result?.message || "Data berhasil dihapus")
            await fetchData()
          } catch (error: any) {
            console.error(error)
            message.error(error?.message || "Gagal menghapus data")
          } finally {
            loading.value = false
          }
        }
      })
    }

    // ── Kolom tabel ──────────────────────────────────────────────────────
    const columns = [
      { title: 'Nama', key: 'name', minWidth: 240 },
      {
        title: 'Aksi',
        key: 'actions',
        width: 280,
        render(row: OrgRow) {
          return h('div', { class: 'flex gap-2' }, [
            h(
              NButton,
              { size: 'small', onClick: () => openAddChildModal(row) },
              { default: () => 'Tambah Anak' }
            ),
            h(
              NButton,
              { size: 'small', type: 'primary', onClick: () => openEditModal(row) },
              { default: () => 'Ubah' }
            ),
            h(
              NButton,
              { size: 'small', type: 'error', onClick: () => deleteData(row) },
              { default: () => 'Hapus' }
            )
          ])
        }
      },
    ]

    fetchData()

    return {
      columns,
      tableData,
      rowKey,
      loading,
      inputSearch,

      isModalOpen,
      isEditMode,
      formData,
      parentOptions,
      openAddModal,
      openAddChildModal,
      openEditModal,
      closeModal,
      submitForm,
      deleteData
    }
  }
})
