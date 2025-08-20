import { defineComponent, ref } from 'vue'
import { Config } from '@/constant/config'
import { CheckBearerExpired } from '../../secured'

export default defineComponent({
  data() {
    return {
      profile: {},
      loading: false
    }
  },
  methods: {
    async fetchData() {
      const token = localStorage.getItem(Config.TokenName);
      const session = localStorage.getItem(Config.SessionName);
      const personId = ref('381');
      if (!token) {
        console.error('No token found!');
        return false;
      }
      this.loading = true;
      //const url = `${Config.UrlBackend}/api/person/session/${Config.AppId}/${session}/${personId.value}`
      const url = `${Config.UrlBackend}/api/person/${personId.value}`
      const response = await fetch(url, {
      //const response = await fetch(Config.UrlBackend+"/api/person?personId=381&page=1&pageSize=20", {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          uSession: `${session}`,
        },
      });
      CheckBearerExpired(response.status);
      const result = await response.json();
      this.profile = result[0];

      console.log(this.profile)
      this.loading = false;
    },
    
  },
  created() {
    this.fetchData();
  }
})