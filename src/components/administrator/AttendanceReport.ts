import { defineComponent, ref, onMounted, computed } from "vue";
import { useMessage, DataTableColumns } from "naive-ui";
import { Config, generalOptions } from "@/constant/config";
import { apiFetch } from "@/services/apiClient";
import { getAuthData, logout } from "@/services/authService";
import { can, setPermissions } from "@/services/authPermission";
import * as XLSX from "xlsx";

/* ======================================================
   TYPES
====================================================== */

interface AttendanceSummaryRow {
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

  total_verification_value: number;

  total_violation: number;
  attendance_rate: number;
  discipline_score: number;
}

interface AttendanceResponse {
  data: AttendanceSummaryRow[];
  total: number;
  page: number;
  pageSize: number;
}

/* ======================================================
   COMPONENT
====================================================== */

export default defineComponent({
  name: "AttendanceReport",

  setup() {
    const message = useMessage();

    /* ===============================
       STATE
    =============================== */

    const tableData = ref<AttendanceSummaryRow[]>([]);
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
    var employeeId = "";
    var orgId = auth.employee.organizationId;
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
          `${Config.UrlBackend}/api/option/employee?orgId=${orgId}&q=${keyword}`,
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

    const employeeCategoryFilter = ref<number | null>(null);
    const employeeCategoryOptions = ref<any[]>([]);
    const fetchEmployeeCategoryOptions = async () => {
      try {
        const response = await apiFetch(
          `${Config.UrlBackend}/api/option/employee_category`,
          { method: "GET" },
        );

        const result = await response.json();

        // asumsi response:
        // [{ id: 1, name: 'Suami' }, { id: 2, name: 'Istri' }]
        employeeCategoryOptions.value = (result.data || result).map(
          (item: any) => ({
            label: item.name,
            value: item.id,
          }),
        );
      } catch (error) {
        console.error(error);
        message.error("Gagal memuat employee_category");
      }
    };
    const getEmployeeCategoryLabel = (
      value: string | number | null | undefined,
    ) => {
      if (value == null) return "-";
      const option = employeeCategoryOptions.value.find(
        (o) => String(o.value) === String(value),
      );
      return option?.label ?? "-";
    };
    const handleCategoryFilter = async () => {
      current.value = 1;
      await fetchData(1);
    };
    /* ===============================
       FETCH DATA
    =============================== */

    const fetchData = async (page = 1) => {
      if (loading.value) return;

      try {
        loading.value = true;

        let url =
          `${Config.UrlBackend}/api/attendance/getattendancereport?` +
          `employeeId=${employeeId}&` +
          `year=${formFilter.value.year}&` +
          `month=${formFilter.value.month}&` +
          `page=${page}&` +
          `pageSize=${pageSize.value}`;

        if (employeeCategoryFilter.value) {
          url += `&employeeCategoryId=${employeeCategoryFilter.value}`;
        }

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

    const rowProps = () => {
      return {};
    };

    /* ===============================
       TABLE COLUMNS
    =============================== */

    const columns: DataTableColumns<AttendanceSummaryRow> = [
      {
        title: "Id Pegawai",
        key: "employee_id",
        align: "center",
        width: 20,
      },
      {
        title: "Nama",
        key: "employee_name",
        align: "center",
        width: 120,
      },
      {
        title: "Total hari kerja",
        key: "total_workday",
        align: "center",
        width: 40,
      },
      {
        title: "Total kehadiran",
        key: "total_present",
        align: "center",
        width: 40,
      },
      {
        title: "Total alpha",
        key: "total_alpha",
        align: "center",
        width: 40,
      },
      {
        title: "Total tidak checkin",
        key: "total_no_checkin",
        align: "center",
        width: 40,
      },
      {
        title: "Total tidak checkout",
        key: "total_no_checkout",
        align: "center",
        width: 40,
      },
      {
        title: "Total terlambat",
        key: "total_late",
        align: "center",
        width: 40,
      },
      {
        title: "Total durasi terlambat",
        key: "total_late_duration",
        align: "center",
        width: 40,
      },
      {
        title: "Total pulang awal",
        key: "total_early_leave",
        align: "center",
        width: 40,
      },
      {
        title: "Total durasi pulang awal",
        key: "total_early_leave_duration",
        align: "center",
        width: 40,
      },
      {
        title: "Total Verifikasi",
        key: "total_verification_value",
        align: "center",
        width: 40,
        render(row) {
          return row.total_verification_value ?? 0;
        },
      },
      {
        title: "Total pelanggaran",
        key: "total_violation",
        align: "center",
        width: 40,
      },
      {
        title: "Rata kehadiran",
        key: "attendance_rate",
        align: "center",
        width: 40,
      },
      {
        title: "Kedisiplinan",
        key: "discipline_score",
        align: "center",
        width: 40,
      },
    ];

    /* ===============================
       LIFECYCLE
    =============================== */

    onMounted(() => {
      fetchEmployeeCategoryOptions();
      //fetchData(current.value);
    });

    /* ===============================
       DOWNLOAD EXCEL
    =============================== */

    const handleDownloadExcel = () => {
      if (!tableData.value.length) {
        message.warning("Tidak ada data untuk di-download");
        return;
      }

      const rows = tableData.value.map((row) => ({
        "Id Pegawai": row.employee_id,
        Nama: row.employee_name,
        "Total Hari Kerja": row.total_workday ?? 0,
        "Total Kehadiran": row.total_present ?? 0,
        "Total Alpha": row.total_alpha ?? 0,
        "Total Tidak Checkin": row.total_no_checkin ?? 0,
        "Total Tidak Checkout": row.total_no_checkout ?? 0,
        "Total Terlambat": row.total_late ?? 0,
        "Total Durasi Terlambat (menit)": row.total_late_duration ?? 0,
        "Total Pulang Awal": row.total_early_leave ?? 0,
        "Total Durasi Pulang Awal (menit)": row.total_early_leave_duration ?? 0,
        "Total Verifikasi": row.total_verification_value ?? 0,
        "Total Pelanggaran": row.total_violation ?? 0,
        "Rata-rata Kehadiran (%)": row.attendance_rate ?? 0,
        "Skor Kedisiplinan": row.discipline_score ?? 0,
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "AttendanceReport");

      // Auto-fit column widths
      const colWidths = Object.keys(rows[0]).map((key) => ({
        wch: Math.max(key.length, 15),
      }));
      worksheet["!cols"] = colWidths;

      const fileName = `Attendance_Report_${formFilter.value.year}_${String(formFilter.value.month).padStart(2, "0")}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      message.success(`Data berhasil di-download sebagai ${fileName}`);
    };

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
      employeeCategoryFilter,
      employeeCategoryOptions,
      fetchEmployeeCategoryOptions,
      handleCategoryFilter,
      handleDownloadExcel,
    };
  },
});
