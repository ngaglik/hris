import {
	enUS,
	idID,
	darkTheme,
	GlobalTheme
} from 'naive-ui'
import { ref } from 'vue'

const theme = ref<GlobalTheme | null>(null)
const lang = ref(idID)
export default () => {
	const changeTheme = () => {
		if (theme.value === null) {
			theme.value = darkTheme as GlobalTheme
		} else {
			theme.value = null
		}
	}
	const changeLang = () => {
		console.log('lang', lang.value)
		if (lang.value.name === 'id-ID') {
			lang.value = enUS
		} else {
			lang.value = idID
		}
	}
	return {
		theme,
		lang,
		changeTheme,
		changeLang,
	}
}
