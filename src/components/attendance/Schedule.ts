import { defineComponent, ref, h } from 'vue'
import { useMessage,useDialog, NButton, NDatePicker, NSelect } from 'naive-ui'
import { Config, generalOptions, dictHari } from '@/constant/config'
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
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    })
    const isModalOpen = ref(false)
    const scheduleTypeOptions = ref<any[]>([])
    const scheduleGroupOptions = ref<any[]>([])

    const fetchScheduleType = async () => {
      try {
        const res = await apiFetch(`${Config.UrlBackend}/api/option/schedule_type`)
        const result = await res.json()

        scheduleTypeOptions.value = result.data.map((x: any) => ({
          label: x.name,
          value: x.id
        }))
      } catch (error) {
        console.error("Error loading schedule type", error)
      }
    }
    const fetchScheduleGroup = async () => {
      try {
        const res = await apiFetch(`${Config.UrlBackend}/api/option/schedule_group/-/true`)
        const result = await res.json()

        scheduleGroupOptions.value = result.data.map((x: any) => ({
          label: x.name,
          value: x.id
        }))
      } catch (error) {
        console.error("Error loading schedule group", error)
      }
    }

    const fetchData = async (page = 1) => {
      let auth = getAuthData()
      if (!auth) {
        logout();
        return null;
      }
      let token = auth?.token
      let session = auth?.session
      let employeeId = auth?.employee?.[0].id

      loading.value = true      
      const response = await apiFetch(`${Config.UrlBackend}/api/attendance/getschedule?employeeId=${employeeId}&year=${formFilter.value.year}&month=${formFilter.value.month}&page=${page}&pageSize=${pageSize.value}&inputSearch=${inputSearch.value}`, {
        method: "GET"
      });
      if (!response.ok) return false;
      const result = await response.json()
      tableData.value = result.data
      current.value = result.page
      total.value = result.total
      loading.value = false
    }

    const handleEditData = () => {
      fetchScheduleType()
      fetchScheduleGroup()
      isModalOpen.value = true
    }

    const closeModal = () => {
      isModalOpen.value = false
    }
     
    const handleShowData = () => {
      fetchData(current.value)
    }

    const onUpdateValue = (row: any) => {
      formData.value = { ...row }
    }

    const handlePageChange = (page) => {
      current.value = page
      fetchData(page)
    }

    const columns = [      
      {
        title: 'Tanggal',
        key: 'schedule_date',
        render(row) {
          return row.schedule_date
        },
        cellProps: () => ({
          style: {
            backgroundColor: '#d9fdd3'   // hijau muda
          }
        })
      },
      {
        title: 'Hari',
        key: 'day_name',
        render(row) {
          const dayName = dictHari.get(row.day_name.trim()) ?? row.day_name
          const isWeekend = row.day_name.trim() === 'Sunday'

          return h(
            'span',
            {
              style: {
                color: isWeekend ? 'red' : 'inherit',
                fontWeight: isWeekend ? 'bold' : 'normal'
              }
            },
            dayName
          )
        }
      },
      {
        title: 'Masuk',
        key: 'schedule_time_start',
        render(row) {
          if (!row.schedule_time_start) return '-'
          const timeValue = new Date(row.schedule_time_start)
          if (isNaN(timeValue.valueOf())) return row.schedule_time_start

          return timeValue.toTimeString().slice(0, 5) // HH:MM
        }
      },
      {
        title: 'Pulang',
        key: 'schedule_time_end',
        render(row) {
          if (!row.schedule_time_end) return '-'
          const timeValue = new Date(row.schedule_time_end)
          if (isNaN(timeValue.valueOf())) return row.schedule_time_end

          return timeValue.toTimeString().slice(0, 5) // HH:MM
        }
      },
      {
        title: 'Ket',
        key: 'schedule_type_name'
      }
    ]

    const columnsEdit = [      
      {
        title: 'Tanggal / Hari',
        key: 'tanggal_hari',
        render(row) {
          const hari = dictHari.get(row.day_name.trim()) ?? row.day_name
          const merah = hari === 'Sabtu' || hari === 'Minggu'

          return h(
            'div',
            {
              style: 'display:flex; flex-direction:column; gap:0px;'
            },
            [
              // Input tanggal editable
              h('input', {
                type: 'text',
                value: row.schedule_date || '',
                style:
                  'width: 80px; padding: 4px; border: 1px solid #ccc; border-radius: 4px;',
                onInput: (e) => {
                  row.schedule_date = e.target.value
                }
              }),

              // Nama hari
              h(
                'span',
                {
                  style: {
                    fontSize: '10px',
                    color: merah ? 'red' : 'inherit',
                    fontWeight: merah ? 'bold' : 'normal'
                  }
                },
                hari
              )
            ]
          )
        },
        cellProps: () => ({
          style: {
            width: '80px',   // hijau muda
            backgroundColor: '#d9fdd3'   // hijau muda
          }
        })
      },      
      {
        title: 'Ket',
        key: 'schedule_type_name',
        render(row) {
          return h(NSelect, {
          value: row.schedule_type_id,
          options: scheduleTypeOptions.value,
          onUpdateValue(v) {
            row.schedule_type_id = v
          },
          style: "width: 120px"
        })
        },
        headerCellProps: {
          style: { fontWeight: 'bold' }
        },
        cellProps: () => ({
          style: {
            width: '90px',  
            verticalAlign: 'top'
          }
        })
      },
      {
        title: 'Jadwal',
        key: 'schedule_group_name',
        render(row) {
          return h(NSelect, {
          value: row.schedule_group_id,
          options: scheduleGroupOptions.value,
          onUpdateValue(v) {
            row.schedule_group_id = v
          },
          style: "width: 140px"
        })
        },
        headerCellProps: {
          style: { fontWeight: 'bold' }
        },
        cellProps: () => ({
          style: {
            width: '100px',  
            verticalAlign: 'top'
          }
        })
      }
    ]

    // Fetch data once created
    fetchData(current.value)
    

    return {
      columns,
      columnsEdit,
      tableData,
      current,
      pageSize,
      total,
      loading,
      inputSearch,
      handleShowData,
      handleEditData,
      handlePageChange,
      scheduleTypeOptions,
      scheduleGroupOptions,

      isModalOpen,
      onUpdateValue,
      generalOptions,
      dictHari,
      formFilter,
      
    }
  }
})
