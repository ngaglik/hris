import { defineComponent, ref } from 'vue'
import { Config } from '@/constant/config'
import { CheckBearerExpired } from '../../secured'
import UserProfile from './UserProfile.vue'
import UnitProfile from './UnitProfile.vue'


export default defineComponent({
  components: {
    UserProfile,
    UnitProfile
  }
})