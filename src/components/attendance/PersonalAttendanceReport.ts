import { defineComponent, ref, onMounted, computed } from "vue";
import { useMessage, DataTableColumns } from "naive-ui";
import { Config, generalOptions } from "@/constant/config";
import { apiFetch } from "@/services/apiClient";
import { getAuthData, logout } from "@/services/authService";
import { can, setPermissions } from "@/services/authPermission";

/* ======================================================
   TYPES
====================================================== */

interface AttendanceRow {
  employee_id: number;
  employee_name: string;
  schedule_date: string;

  schedule_type_id: number;
  schedule_type_name: string;

  schedule_time_start: string | null;
  schedule_time_end: string | null;

  check_in: string | null;
  check_out: string | null;

  attendance_flag: string;

  is_present: boolean;
  is_late: boolean;
  late_duration: number | null;

  early_leave: boolean;
  early_leave_duration: number | null;
}

interface AttendanceResponse {
  data: AttendanceRow[];
  total: number;
  page: number;
  pageSize: number;
}

/* ======================================================
   COMPONENT
====================================================== */

export default defineComponent({
  name: "PersonalAttendanceReport",

  setup() {
    const message = useMessage();

    /* ===============================
       STATE
    =============================== */

    const tableData = ref<AttendanceRow[]>([]);
    const loading = ref(false);

    const current = ref(1);
    const pageSize = ref(100);
    const total = ref(0);

    const formFilter = ref({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      employee_id: "",
    });

    /* ===============================
       AUTH SAFE EMPLOYEE
    =============================== */

    //const employeeId = computed(() => {
    const auth = getAuthData();

    if (!auth?.employee?.id) {
      logout();
      message.error("Session expired");
      return null;
    }
    var employeeId = auth.employee.id;
    //  return auth.employee.id;
    //});
    setPermissions(auth.employee?.privilege ?? []);

    const employeeOptions = ref<any[]>([]);
    const employeeLoading = ref(false);

    const handleInputSearchEmployee = async (keyword?: string) => {
      // reset list setiap karakter diketik
      employeeOptions.value = [];

      // validasi minimal 2 karakter
      if (!keyword || keyword.length < 2) {
        return;
      }
      employeeLoading.value = true;
      try {
        const response = await apiFetch(
          `${Config.UrlBackend}/api/option/employee?q=${keyword}`,
          {
            method: "GET",
          },
        );

        const result = await response.json();

        employeeOptions.value = (result.data || []).map((item: any) => ({
          label: `${item.name} `,
          value: item.id,
        }));
      } catch (error) {
        console.error(error);
        message.error("Gagal memuat data employee");
      } finally {
        employeeLoading.value = false;
      }
    };

    const handleEmployeeSelect = (value: any, option: any) => {
      employeeId = value;
      // formFilter.value.employee_id = label;
      // message.success(employeeId);
    };

    /* ===============================
       FETCH DATA
    =============================== */

    const fetchData = async (page = 1) => {
      if (loading.value || !employeeId) return;

      try {
        loading.value = true;

        const url =
          `${Config.UrlBackend}/api/attendance/getpersonalattendancereport?` +
          `employeeId=${employeeId}&` +
          `year=${formFilter.value.year}&` +
          `month=${formFilter.value.month}&` +
          `page=${page}&` +
          `pageSize=${pageSize.value}`;

        const response = await apiFetch(url, { method: "GET" });

        if (!response?.ok) throw new Error(await response?.text());

        const result = (await response.json()) as AttendanceResponse;

        tableData.value = result.data ?? [];
        current.value = result.page ?? 1;
        total.value = result.total ?? 0;

        if (!tableData.value.length)
          message.warning("Tidak ada data kehadiran");
      } catch (err: any) {
        console.error(err);
        message.error(err?.message ?? "Gagal memuat data");
      } finally {
        loading.value = false;
      }
    };

    /* ===============================
       ACTIONS
    =============================== */

    const handleShowData = async () => {
      current.value = 1;
      await fetchData(1);
    };

    const handlePageChange = async (page: number) => {
      current.value = page;
      await fetchData(page);
    };

    /* ===============================
       HR ROW STYLE ENGINE
    =============================== */

    const rowProps = (row: AttendanceRow) => {
      if (row.schedule_type_id !== 1) return { class: "row-not-workday" };

      if (row.attendance_flag === "Alpha") return { class: "row-alpha" };

      if (row.is_late) return { class: "row-late" };

      if (row.early_leave) return { class: "row-early" };

      return {};
    };

    /* ===============================
       TABLE COLUMNS
    =============================== */

    const columns: DataTableColumns<AttendanceRow> = [
      {
        title: "Tanggal",
        key: "schedule_date",
        align: "center",
        width: 120,
      },
      {
        title: "Jadwal Masuk",
        key: "schedule_time_start",
        align: "center",
        width: 120,
      },
      {
        title: "Check In",
        key: "check_in",
        align: "center",
        width: 120,
      },
      {
        title: "Jadwal Pulang",
        key: "schedule_time_end",
        align: "center",
        width: 120,
      },
      {
        title: "Check Out",
        key: "check_out",
        align: "center",
        width: 120,
      },

      //----------------------------------
      // STATUS
      //----------------------------------
      {
        title: "Hadir",
        key: "is_present",
        align: "center",
        width: 120,
        render(row) {
          return row.is_present ? "✅ Hadir" : "❌ Tidak Hadir";
        },
      },
      {
        title: "Keterangan",
        key: "attendance_flag",
        align: "center",
        width: 120,
      },

      //----------------------------------
      // LATE
      //----------------------------------
      {
        title: "Terlambat",
        key: "is_late",
        align: "center",
        width: 120,
        render(row) {
          return row.is_late ? "⏰ Ya" : "-";
        },
      },
      {
        title: "Durasi Terlambat",
        key: "late_duration",
        align: "center",
        width: 150,
        render(row) {
          return row.late_duration ? `${row.late_duration} menit` : "-";
        },
      },

      //----------------------------------
      // EARLY LEAVE
      //----------------------------------
      {
        title: "Pulang Cepat",
        key: "early_leave",
        align: "center",
        width: 120,
        render(row) {
          return row.early_leave ? "⚠️ Ya" : "-";
        },
      },
      {
        title: "Durasi Pulang Cepat",
        key: "early_leave_duration",
        align: "center",
        width: 170,
        render(row) {
          return row.early_leave_duration
            ? `${row.early_leave_duration} menit`
            : "-";
        },
      },
    ];

    /* ===============================
       LIFECYCLE
    =============================== */

    onMounted(() => {
      fetchData(current.value);
    });

    /* ===============================
       EXPORT
    =============================== */

    return {
      columns,
      tableData,
      loading,
      current,
      pageSize,
      total,
      formFilter,
      generalOptions,
      handleShowData,
      handlePageChange,
      rowProps,

      handleEmployeeSelect,
      handleInputSearchEmployee,
      employeeOptions,
      employeeLoading,
      can,
    };
  },
});
