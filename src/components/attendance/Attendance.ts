import { defineComponent, ref } from 'vue'
import { useMessage } from 'naive-ui'
import { getAuthData, logout } from "@/services/authService"
import { apiFetch } from "@/services/apiClient"
import { Config, generalOptions } from '@/constant/config'
import Checklog from './Checklog.vue'
import Schedule from './Schedule.vue'

export default defineComponent({
  components: {
    Checklog,
    Schedule
  },

  setup() {
    const message = useMessage()
    const loadingCheckIn = ref(false)
    const loadingCheckOut = ref(false)

    let auth = getAuthData()
    if (!auth) {
      logout()
    }
    let token = auth?.token
    let session = auth?.session
    let employeeId = auth?.employee?.[0].id

    const insertFingerlog = async (mode: number) => {
      try {
        if (mode === 1) {
          loadingCheckIn.value = true
        } else {
          loadingCheckOut.value = true
        }

        const payload = {
          pin: String(employeeId),
          iomode: mode
        }

        const response = await apiFetch(
          `${Config.UrlBackend}/api/attendance/fingerlog`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          throw new Error(
            errorData?.message || 
            `Server error (${response.status})`
          )
        }

        message.success(
          mode === 1
            ? 'Check In berhasil'
            : 'Check Out berhasil'
        )

      } catch (err: any) {
        message.error(err?.message || 'Gagal mengirim absensi')
      } finally {
        if (mode === 1) {
          loadingCheckIn.value = false
        } else {
          loadingCheckOut.value = false
        }
      }
    }

    const CheckIn = () => insertFingerlog(1)
    const CheckOut = () => insertFingerlog(2)

    return {
      loadingCheckIn,
      loadingCheckOut,
      CheckIn,
      CheckOut,
      employeeId
    }
  }
})