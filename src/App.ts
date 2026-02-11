import { Config } from '@/constant/config'
import { getAuthData, saveAuthData, logout } from "@/services/authService";
import { NConfigProvider } from 'naive-ui'
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { idID, dateId } from './locales/idID'
import {
  useMessage,
  useDialog,
  useNotification,
  useLoadingBar,
  MenuOption
} from 'naive-ui'
import { LAYOUT_ITEMS } from '@/constant/constant'
import { useRouter } from 'vue-router'
import useConfig from '@/hooks/useConfig'
import ProfileBar from '@/components/ProfileBar.vue'
import Login from '@/components/Login.vue'

// =====================
// Types
// =====================
type MenuItem = MenuOption & {
  children?: MenuItem[]
}

// =====================
// Auth State Machine
// =====================
enum AuthState {
  INIT = 'INIT',
  CHECKING = 'CHECKING',
  AUTH = 'AUTH',
  UNAUTH = 'UNAUTH',
  LOGOUT = 'LOGOUT',
  ERROR = 'ERROR'
}

// =====================
// Utils
// =====================
function removeNodeByKey(
  items: MenuItem[],
  keyToRemove: string
): MenuItem[] {
  return items
    .filter(item => item.key !== keyToRemove)
    .map(item => ({
      ...item,
      children: item.children
        ? removeNodeByKey(item.children as MenuItem[], keyToRemove)
        : undefined
    }))
}

export default defineComponent({
  name: 'App',
  components: {
    ProfileBar,
    Login,
  },

  setup() {
    const router = useRouter()

    // =====================
    // UI State
    // =====================
    const collapsed = ref(false)
    const activeName = ref('/')
    const layoutOptions = ref<MenuOption[]>([])

    // =====================
    // Auth State Machine
    // =====================
    const authState = ref<AuthState>(AuthState.INIT)

    const isLoggedIn = computed(() => authState.value === AuthState.AUTH)
    const isAuthChecked = computed(() =>
      ![AuthState.INIT, AuthState.CHECKING].includes(authState.value)
    )

    // =====================
    // UI Utilities
    // =====================
    window.$message = useMessage()
    window.$dialog = useDialog()
    window.$notification = useNotification()
    window.$loadingBar = useLoadingBar()

    // =====================
    // Config
    // =====================
    const { theme, lang, changeTheme, changeLang } = useConfig()
    const showLang = computed(() => lang.value.name === 'id-ID' ? 'Bahasa' : 'English')

    // =====================
    // Auth Actions
    // =====================
    const checkAuth = async () => {
      authState.value = AuthState.CHECKING
      try {
        const auth = getAuthData()
        if (auth?.token) {
          authState.value = AuthState.AUTH
        } else {
          authState.value = AuthState.UNAUTH
        }
      } catch (e) {
        console.error('Auth check error', e)
        authState.value = AuthState.ERROR
      }
    }



    const onLoginSuccess = async () => {
      await checkAuth()   // ⬅ masuk ulang ke state machine
    }

    const doLogout = async () => {
      authState.value = AuthState.LOGOUT
      logout()
      authState.value = AuthState.UNAUTH
    }

    // =====================
    // Menu Builder
    // =====================
    const buildMenu = () => {
      const auth = getAuthData()
      if (!auth?.token) return []

      let menu: MenuItem[] = JSON.parse(JSON.stringify(LAYOUT_ITEMS))
      const emp = auth.employee?.[0]

      if (!emp?.tags?.includes('OSDM')) {
        menu = removeNodeByKey(menu, '/administrator')
      }

      if (emp?.id !== 381) {
        menu = removeNodeByKey(menu, '/selfservices')
        if (emp?.employee_category_id !== 17) {
          menu = removeNodeByKey(menu, '/Attendance')
        }
      }

      return menu
    }

    // =====================
    // Watch Auth State
    // =====================
    watch(authState, (state) => {
      if (state === AuthState.AUTH) {
        layoutOptions.value = buildMenu()
      }

      if (state === AuthState.UNAUTH) {
        layoutOptions.value = []
      }

      if (state === AuthState.ERROR) {
        layoutOptions.value = []
      }
    })

    // =====================
    // Handlers
    // =====================
    const handleMenuSelect = (value: string) => {
      activeName.value = value
      router.push({ path: value })
    }

    const handleLogout = async () => {
      await doLogout()
    }

    // =====================
    // Lifecycle
    // =====================
    onMounted(async () => {
      await checkAuth()

      // responsive sidebar
      const handleResize = () => {
        collapsed.value = window.innerWidth < 768
      }
      handleResize()
      window.addEventListener('resize', handleResize)
    })

    return {
      // ui
      layoutOptions,
      collapsed,
      activeName,

      // auth
      authState,
      isLoggedIn,
      isAuthChecked,
      onLoginSuccess,

      // config
      theme,
      lang,
      showLang,
      changeTheme,
      changeLang,

      // handlers
      handleMenuSelect,
      handleLogout,

      // locale
      idID,
      dateId,

      // enum
      AuthState
    }
  },
})
