import { defineComponent, ref } from 'vue'
import { Config } from '@/constant/config'
import { getAuthData, saveAuthData, logout } from "@/services/authService"
import Checklog from './Checklog.vue'
import Schedule from './Schedule.vue'


export default defineComponent({
  components: {
    Checklog,
    Schedule
  },  
  created() {
    let auth = getAuthData()
    if (!auth) {
        logout();
        return null;
      }
    let token = auth?.token
    let session = auth?.session
    if (!token) {
      console.error('No token found!');
      return false;
    }
  }
})