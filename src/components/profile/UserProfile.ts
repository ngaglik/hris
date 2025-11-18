import { defineComponent } from 'vue'
import { Config } from '@/constant/config'
import { CheckBearerExpired } from '../../secured'
import Education from './Education.vue'

export default defineComponent({
  components: { Education },
  props: {
    employeeId: {
      type: String,
      default: ''
    },
    personId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      profile: {},
      loading: false
    }
  },
  computed: {
    persId() {
      const localData = JSON.parse(localStorage.getItem(Config.TokenName) || "{}");
      const employee = localData?.employee?.[0];
      return this.employeeId || employee?.personId || '';
    },
    empId() {
      const localData = JSON.parse(localStorage.getItem(Config.TokenName) || "{}");
      const employee = localData?.employee?.[0];
      return this.employeeId || employee?.id || '';
    }
  },
  methods: {
    async fetchData() {
      const localData = JSON.parse(localStorage.getItem(Config.TokenName) || "{}");
      const token = localData?.token;
      const session = localData?.session;

      if (!token) {
        console.error('No token found!');
        return false;
      }

      if (!this.persId) {
        console.error('Person ID not found!');
        return false;
      }

      this.loading = true;

      const url = `${Config.UrlBackend}/api/person/${this.persId}`;

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            uSession: `${session}`,
          },
        });

        CheckBearerExpired(response.status);

        const result = await response.json();
        this.profile = Array.isArray(result) ? result[0] : result;

        console.log(this.profile);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        this.loading = false;
      }
    },
  },
  created() {
    this.fetchData();
  }
})
