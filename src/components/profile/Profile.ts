import { defineComponent, ref, computed, onMounted } from 'vue'
import { getAuthData, logout } from '@/services/authService'
import UserProfile from './UserProfile.vue'
import UnitProfile from './UnitProfile.vue'

export default defineComponent({
  components: {
    UserProfile,
    UnitProfile
  },

  setup() {
    const activeTab = ref('user')
    const showUnitTab = ref(false)

    onMounted(() => {
      const auth = getAuthData()

      // ❌ Tidak login
      if (!auth?.token) {
        logout()
        return
      }

      const employee = auth.employee?.[0]
      const tags = employee?.tags ?? []
      const employeeId = employee?.id
      const positionId = employee?.positionId

      // ✅ RULE VISIBILITAS TAB
      // contoh: hanya OSDM / ADMIN / pegawai tertentu
      showUnitTab.value =
        tags.includes('OSDM') ||
        tags.includes('ADMIN') || positionId!= 0

      // Jika tab aktif tidak boleh tampil
      if (!showUnitTab.value && activeTab.value === 'unit-kerja') {
        activeTab.value = 'user'
      }
    })

    return {
      activeTab,
      showUnitTab
    }
  }
})
