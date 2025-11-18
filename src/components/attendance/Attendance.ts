import { defineComponent, ref } from 'vue'
import { Config } from '@/constant/config'
import { CheckBearerExpired } from '../../secured'
import Checklog from './Checklog.vue'
import Schedule from './Schedule.vue'


export default defineComponent({
  components: {
    Checklog,
    Schedule
  },  
  created() {
    const localData = JSON.parse(localStorage.getItem(Config.TokenName) || "{}");
    const token = localData.token;
    const session = localData.session; 
    if (!token) {
      console.error('No token found!');
      return false;
    }
  }
})