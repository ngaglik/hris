import { Config } from '@/constant/config'
import { checkLogin } from './secured'

import { defineComponent, ref, computed, onMounted } from 'vue'
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

export default defineComponent({
  name: 'App',
  components: {
    ProfileBar,
    Login,
  },

  setup() {
    const router = useRouter()
    const layoutOptions = ref<MenuOption[]>(LAYOUT_ITEMS)
    const collapsed = ref(false)
    const activeName = ref('/')
    const isLoggedIn = ref(false)

    // Cek login status saat mounted
    onMounted(async () => {
     try {
		    isLoggedIn.value = await checkLogin()
		  } catch (err) {
		    console.error('Login check failed:', err)
		    isLoggedIn.value = false
		  }

      // Collapse sidebar otomatis jika layar kecil
      const handleResize = () => {
        collapsed.value = window.innerWidth < 768
      }
      handleResize()
      window.addEventListener('resize', handleResize)
    })

    // UI utilities
    window.$message = useMessage()
    window.$dialog = useDialog()
    window.$notification = useNotification()
    window.$loadingBar = useLoadingBar()

    const handleMenuSelect = (value: string) => {
      activeName.value = value
      router.push({ path: value })
    }

    const handleLogout = () => {
      localStorage.removeItem(Config.TokenName)
      localStorage.removeItem(Config.SessionName)
      isLoggedIn.value = false
      window.$message?.info('Anda berhasil logout.')
    }

    const { theme, lang, changeTheme, changeLang } = useConfig()
    const showLang = computed(() => lang.value.name === 'id-ID' ? 'Bahasa' : 'English')

    return {
      layoutOptions,
      collapsed,
      activeName,
      theme,
      lang,
      showLang,
      changeTheme,
      changeLang,
      handleMenuSelect,
      handleLogout,
      isLoggedIn,
      idID,
      dateId,
    }
  },
})
