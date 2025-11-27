import { defineComponent, ref } from 'vue'
import { Config } from '@/constant/config'
import { getAuthData, saveAuthData, logout } from "@/services/authService"
import UserProfile from './UserProfile.vue'
import UnitProfile from './UnitProfile.vue'


export default defineComponent({
  components: {
    UserProfile,
    UnitProfile
  },  
  created() {
    let auth = getAuthData()
    if (!auth) {
        logout();
        return null;
      }
    let token = auth?.token
    if (!token) {
      console.error('No token found!');
      return false;
    }
  }
})