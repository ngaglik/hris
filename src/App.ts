import { Config } from '@/constant/config'
import { getAuthData, saveAuthData, logout } from "@/services/authService";
import { NConfigProvider } from 'naive-ui'
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

type MenuItem = MenuOption & {
  children?: MenuItem[]
}

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
    const collapsed = ref(false)
    const activeName = ref('/')
    const isLoggedIn = ref(false)
    const layoutOptions = computed<MenuOption[]>(() => {
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
      logout();
      isLoggedIn.value = false
    }

    

    const { theme, lang, changeTheme, changeLang } = useConfig()
    const showLang = computed(() => lang.value.name === 'id-ID' ? 'Bahasa' : 'English')
    // Cek login status saat mounted
    onMounted(async () => {
      let auth = getAuthData();
      if(!auth?.token){
        layoutOptions.value = [] 
        isLoggedIn.value = false
      }
      else{
        
        let employeeId = auth?.employee?.[0].id
        let tags = auth?.employee?.[0].tags
        let employeeCategoryId = auth?.employee?.[0].employee_category_id
        let employeeOrganizationId = auth?.employee?.[0].organization_id

        
        layoutOptions.value = menu
        isLoggedIn.value = true
      }
    
      // Collapse sidebar otomatis jika layar kecil
      const handleResize = () => {
        collapsed.value = window.innerWidth < 768
      }
      handleResize()
      window.addEventListener('resize', handleResize)
    })

    

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
