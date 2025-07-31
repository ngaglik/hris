import { Config } from '@/constant/config'
import { checkLogin } from './secured'

const isLoggedIn = ref(false);
checkLogin().then((result) => {
  isLoggedIn.value = result;
});

import { defineComponent, ref, computed } from 'vue'
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
	setup () {
		const router = useRouter()
		// mount on window
		window.$message = useMessage()
		window.$dialog = useDialog()
		window.$notification = useNotification()
		window.$loadingBar = useLoadingBar()
		const layoutOptions = ref<MenuOption[]>(LAYOUT_ITEMS)
		const collapsed = ref(false)
		const activeName = ref('/')
		const handleMenuSelect = (value: string) => {
			activeName.value = value
			router.push({
				path: value,
			})
		}
    
		// config
		const { theme, lang, changeTheme, changeLang, } = useConfig()
		const showLang = computed(() => {
			return lang.value.name === 'id-ID' ? 'Bahasa' : 'English'
		})

    const handleLogout = () => {
      localStorage.removeItem(Config.TokenName)
      localStorage.removeItem(Config.SessionName)
      isLoggedIn.value = false
      window.$message?.info('Anda berhasil logout.')
    }
    
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
      isLoggedIn,     
      handleLogout, 
      idID,
      dateId,
		}
	},
})