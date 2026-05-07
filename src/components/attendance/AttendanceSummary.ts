import { defineComponent, ref, onMounted } from "vue";
import { useMessage } from "naive-ui";
import { Config, generalOptions, scheduleTypeStyle } from "@/constant/config";
import { apiFetch } from "@/services/apiClient";
import { getAuthData, logout } from "@/services/authService";

/* =====================================================
   TYPES
===================================================== */

interface AttendanceSummaryDto {
  employee_id: number;
  employee_name: string;

  total_workday: number;
  total_present: number;
  total_alpha: number;

  total_no_checkin: number;
  total_no_checkout: number;

  total_late: number;
  total_late_duration: number;

  total_early_leave: number;
  total_early_leave_duration: number;

  attendance_rate: number;
  discipline_score: number;
}

/* =====================================================
   HELPERS
===================================================== */

const formatMinutes = (total: number): string => {
  if (!total || total <= 0) return "0 menit";

  const h = Math.floor(total / 60);
  const m = total % 60;

  if (h === 0) return `${m} menit`;
  if (m === 0) return `${h} jam`;

  return `${h}j ${m}m`;
};

/* =====================================================
   COMPONENT
===================================================== */

export default defineComponent({
  name: "AttendanceSummary",

  setup() {
    const message = useMessage();

    /* ---------------------------------------------
       STATE
    --------------------------------------------- */

    const loading = ref(false);

    const filter = ref({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    });

    const summary = ref<AttendanceSummaryDto | null>(null);

    /* ---------------------------------------------
       FETCH SUMMARY
    --------------------------------------------- */

    const fetchSummary = async () => {
      const auth = getAuthData();

      if (!auth) {
        logout();
        return;
      }

      const employeeId = auth.employee?.id;

      if (!employeeId) {
        message.error("Data pegawai tidak ditemukan");
        return;
      }

      loading.value = true;

      try {
        const url =
          `${Config.UrlBackend}/api/attendance/getattendancereport` +
          `?employeeId=${employeeId}` +
          `&year=${filter.value.year}` +
          `&month=${filter.value.month}`;

        const res = await apiFetch(url, { method: "GET" });

        if (!res || !res.ok) {
          const errData = await res?.json().catch(() => null);

          message.error(
            errData?.message ??
              `Gagal memuat ringkasan kehadiran (${res?.status ?? "error"})`,
          );
          return;
        }

        const result = await res.json();

        // Backend format:
        // { data: [ {...} ] }

        summary.value = result?.data?.[0] ?? null;
      } catch (err: any) {
        message.error(`Error: ${err?.message ?? err}`);
      } finally {
        loading.value = false;
      }
    };

    const cardStyle = (value?: number) => ({
      flex: "1 1 120px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      background: value ? "#fff1f0" : "#fafafa",
      border: `1.5px solid ${value ? "#f5222d" : "#e8e8e8"}`,
      borderRadius: "8px",
      padding: "10px 16px",
    });

    const numberStyle = (value?: number) => ({
      fontSize: "26px",
      fontWeight: 800,
      color: value ? "#cf1322" : "#bbb",
      minWidth: "36px",
      textAlign: "center",
      lineHeight: 1,
    });

    const warningCardStyle = (v?: number) => ({
      ...cardStyle(v),
      background: v ? "#fff7e6" : "#fafafa",
      border: `1.5px solid ${v ? "#fa8c16" : "#e8e8e8"}`,
    });

    const warningNumberStyle = (v?: number) => ({
      ...numberStyle(v),
      fontSize: "22px",
      color: v ? "#d46b08" : "#bbb",
    });

    const earlyCardStyle = (v?: number) => ({
      ...cardStyle(v),
      background: v ? "#fffbe6" : "#fafafa",
      border: `1.5px solid ${v ? "#faad14" : "#e8e8e8"}`,
    });

    const earlyNumberStyle = (v?: number) => ({
      ...numberStyle(v),
      fontSize: "22px",
      color: v ? "#d48806" : "#bbb",
    });

    const alphaCardStyle = (v?: number) => ({
      ...cardStyle(v),
      background: v ? "#2a0000" : "#fafafa",
      border: `1.5px solid ${v ? "#820014" : "#e8e8e8"}`,
    });

    const alphaNumberStyle = (v?: number) => ({
      ...numberStyle(v),
      color: v ? "#fff" : "#bbb",
    });
    /* ---------------------------------------------
       EVENTS
    --------------------------------------------- */

    const handleFilterChange = () => {
      fetchSummary();
    };

    /* ---------------------------------------------
       LIFECYCLE
    --------------------------------------------- */

    onMounted(fetchSummary);

    /* ---------------------------------------------
       EXPORT
    --------------------------------------------- */

    return {
      loading,
      filter,
      summary,
      formatMinutes,
      handleFilterChange,
      scheduleTypeStyle,
      generalOptions,
      alphaNumberStyle,
      alphaCardStyle,
      earlyNumberStyle,
      earlyCardStyle,
      warningNumberStyle,
      warningCardStyle,
      numberStyle,
      cardStyle,
    };
  },
});
