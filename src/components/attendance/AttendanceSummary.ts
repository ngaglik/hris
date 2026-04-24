import { defineComponent, ref, onMounted } from "vue";
import { useMessage } from "naive-ui";
import { Config, generalOptions, scheduleTypeStyle } from "@/constant/config";
import { apiFetch } from "@/services/apiClient";
import { getAuthData, logout } from "@/services/authService";

// Pemetaan warna per attendance_category_id sesuai master data
const CATEGORY_STYLE: Record<
  number,
  { bg: string; color: string; border: string }
> = {
  1: { bg: "#f6ffed", color: "#389e0d", border: "#52c41a" }, // Masuk
  2: { bg: "#fff7e6", color: "#d46b08", border: "#fa8c16" }, // Terlambat masuk
  3: { bg: "#fffbe6", color: "#d48806", border: "#faad14" }, // Pulang awal
  4: { bg: "#fff1f0", color: "#cf1322", border: "#f5222d" }, // Tidak Check In
  5: { bg: "#fff1f0", color: "#cf1322", border: "#f5222d" }, // Tidak Check Out
  6: { bg: "#2a0000", color: "#fff", border: "#820014" }, // Alpha
};

const DEFAULT_STYLE = { bg: "#fafafa", color: "#595959", border: "#d9d9d9" };

export default defineComponent({
  name: "AttendanceSummary",

  setup() {
    const message = useMessage();
    const loading = ref(false);

    const filter = ref({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    });

    const categorySummary = ref<any[]>([]);
    const scheduleTypeSummary = ref<any[]>([]);
    const totalLateMinutes = ref(0);
    const totalEarlyMinutes = ref(0);

    const totalNoCheckin = ref(0);
    const totalNoCheckout = ref(0);
    const totalAlpha = ref(0);

    /** Format menit ke "Xj Ym" */
    const formatMinutes = (total: number): string => {
      if (total <= 0) return "0 menit";
      const h = Math.floor(total / 60);
      const m = total % 60;
      if (h === 0) return `${m} menit`;
      if (m === 0) return `${h} jam`;
      return `${h}j ${m}m`;
    };

    const getCategoryStyle = (id: number) =>
      CATEGORY_STYLE[id] ?? DEFAULT_STYLE;

    // ── Fetch ─────────────────────────────────────────────────────────────────

    const fetchSummary = async () => {
      const auth = getAuthData();
      if (!auth) {
        logout();
        return;
      }
      const employeeId = auth?.employee?.id;
      if (!employeeId) {
        message.error("Data pegawai tidak ditemukan");
        return;
      }

      loading.value = true;
      try {
        const res = await apiFetch(
          `${Config.UrlBackend}/api/attendance/getsummaryattendance` +
            `?employeeId=${employeeId}` +
            `&year=${filter.value.year}` +
            `&month=${filter.value.month}`,
          { method: "GET" },
        );

        if (!res || !res.ok) {
          const errData = await res?.json().catch(() => null);
          message.error(
            errData?.message ??
              `Gagal memuat ringkasan kehadiran (${res?.status ?? "error"})`,
          );
          return;
        }

        const result = await res.json();
        categorySummary.value = result.categorySummary ?? [];
        scheduleTypeSummary.value = result.scheduleTypeSummary ?? [];
        totalLateMinutes.value = result.totalLateMinutes ?? 0;
        totalEarlyMinutes.value = result.totalEarlyMinutes ?? 0;

        totalNoCheckin.value = result.totalNoCheckin ?? 0;
        totalNoCheckout.value = result.totalNoCheckout ?? 0;
        totalAlpha.value = result.totalAlpha ?? 0;
      } catch (err: any) {
        message.error(`Error: ${err?.message ?? err}`);
      } finally {
        loading.value = false;
      }
    };

    const handleFilterChange = () => {
      fetchSummary();
    };

    // ── Init ─────────────────────────────────────────────────────────────────

    onMounted(() => fetchSummary());

    return {
      loading,
      filter,
      categorySummary,
      scheduleTypeSummary,
      totalLateMinutes,
      totalEarlyMinutes,
      totalNoCheckin,
      totalNoCheckout,
      totalAlpha,
      formatMinutes,
      scheduleTypeStyle,
      getCategoryStyle,
      handleFilterChange,
      generalOptions,
    };
  },
});
