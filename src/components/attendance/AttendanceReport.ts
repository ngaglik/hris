import { defineComponent, ref, h } from "vue";
import { useMessage } from "naive-ui";
import { Config, generalOptions } from "@/constant/config";
import { apiFetch } from "@/services/apiClient";
import { getAuthData, logout } from "@/services/authService";

export default defineComponent({
  setup() {
    const message = useMessage();

    const tableData = ref([]);
    const current = ref(1);
    const pageSize = ref(100);
    const total = ref(0);
    const loading = ref(false);

    const formFilter = ref({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    });

    const fetchData = async (page = 1) => {
      try {
        console.log("🔵 DailyAttendance: Memulai fetchData...");

        let auth = getAuthData();
        if (!auth) {
          console.warn("❌ Auth data tidak ditemukan");
          logout();
          message.error("Session expired. Silakan login kembali.");
          return false;
        }

        let employeeId = auth?.employee.id;
        console.log("👤 Employee ID:", employeeId);
        console.log("📅 Filter:", {
          year: formFilter.value.year,
          month: formFilter.value.month,
          page,
          pageSize: pageSize.value,
        });

        if (!employeeId) {
          console.error("❌ Employee ID tidak ditemukan di auth data");
          message.error("Data pegawai tidak ditemukan");
          return false;
        }

        loading.value = true;

        const apiUrl =
          `${Config.UrlBackend}/api/attendance/getattendancereport?` +
          `employeeId=${employeeId}&` +
          `year=${formFilter.value.year}&` +
          `month=${formFilter.value.month}&` +
          `page=${page}&` +
          `pageSize=${pageSize.value}`;

        console.log("🔗 API URL:", apiUrl);

        const response = (await apiFetch(apiUrl, {
          method: "GET",
        })) as Response | void;

        console.log("📡 Response object:", response);

        if (!response) {
          loading.value = false;
          console.error("❌ Response adalah null/undefined");
          message.error(
            "Gagal memuat data kehadiran (Tidak ada response dari server)",
          );
          return false;
        }

        console.log("📊 Response status:", response.status);
        console.log("✅ Response ok:", response.ok);

        if (!response.ok) {
          loading.value = false;
          let errorMessage = `Server error (${response.status})`;

          try {
            const errorData = await response.json();
            console.error("🔴 Error response data:", errorData);
            errorMessage = errorData?.message || errorMessage;
          } catch (parseErr) {
            console.warn("Tidak bisa parse error JSON:", parseErr);
          }

          message.error(`Gagal memuat data kehadiran: ${errorMessage}`);
          return false;
        }

        const result: any = await response.json();
        console.log("✨ Response data:", result);

        if (!result) {
          loading.value = false;
          console.error("❌ Result adalah null/undefined");
          message.error("Data response kosong dari server");
          return false;
        }

        tableData.value = result.data ?? [];
        current.value = result.page ?? page;
        total.value = result.total ?? 0;

        console.log("📋 Table data count:", tableData.value.length);
        console.log("📊 Total:", total.value);

        if (tableData.value.length === 0) {
          console.warn("⚠️ Tidak ada data untuk bulan/tahun ini");
          message.warning("Tidak ada data kehadiran untuk bulan ini");
        } else {
          // message.success(
          //   `Berhasil memuat ${tableData.value.length} data kehadiran`,
          // );
        }

        loading.value = false;
        return true;
      } catch (error: any) {
        loading.value = false;
        console.error("❌ Error dalam fetchData:", error);
        console.error("Error message:", error?.message);
        console.error("Error stack:", error?.stack);

        const errorMsg = error?.message || "Terjadi kesalahan tidak diketahui";
        message.error(`Error: ${errorMsg}`);
        return false;
      }
    };

    const handleShowData = () => {
      console.log("🔄 handleShowData dipanggil");
      current.value = 1;
      fetchData(1);
    };

    const handlePageChange = (page: number) => {
      console.log("📄 handlePageChange ke halaman:", page);
      current.value = page;
      fetchData(page);
    };

    const columns = [
      {
        title: "Nama",
        key: "employee_name",
        width: 200,
        align: "center",
      },
      {
        title: "Volume",
        key: "total",
        width: 100,
        align: "center",
      },
    ];

    // Fetch data once created
    console.log(
      "🚀 DailyAttendance component mounted, fetching initial data...",
    );
    fetchData(current.value);

    return {
      columns,
      tableData,
      current,
      pageSize,
      total,
      loading,
      formFilter,
      generalOptions,
      handleShowData,
      handlePageChange,
    };
  },
});
