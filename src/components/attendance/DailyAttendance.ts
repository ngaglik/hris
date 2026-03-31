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

        let employeeId = auth?.employee?.[0].id;
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
          `${Config.UrlBackend}/api/attendance/getmonthlyattendance?` +
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
        title: "Tanggal",
        key: "schedule_date",
        width: 100,
        align: "center",
      },
      {
        title: "Jam Masuk (Jadwal)",
        key: "schedule_time_start",
        width: 140,
        align: "center",
        render(row: any) {
          if (!row.schedule_time_start) return "-";
          // Backend mengembalikan format "HH:mm:ss", extract HH:mm
          return row.schedule_time_start.substring(0, 5);
        },
      },
      {
        title: "Jam Masuk (Actual)",
        key: "checkin_time",
        width: 140,
        align: "center",
        render(row: any) {
          if (!row.checkin_time) return "-";
          // Backend mengembalikan format "yyyy-MM-dd HH:mm:ss"
          // Extract hanya waktu (HH:mm)
          const timePart = row.checkin_time.split(" ")[1];
          if (!timePart) return row.checkin_time;
          return timePart.substring(0, 5);
        },
      },
      {
        title: "Jam Pulang (Jadwal)",
        key: "schedule_time_end",
        width: 140,
        align: "center",
        render(row: any) {
          if (!row.schedule_time_end) return "-";
          // Backend mengembalikan format "HH:mm:ss", extract HH:mm
          return row.schedule_time_end.substring(0, 5);
        },
      },
      {
        title: "Jam Pulang (Actual)",
        key: "checkout_time",
        width: 140,
        align: "center",
        render(row: any) {
          if (!row.checkout_time) return "-";
          // Backend mengembalikan format "yyyy-MM-dd HH:mm:ss"
          // Extract hanya waktu (HH:mm)
          const timePart = row.checkout_time.split(" ")[1];
          if (!timePart) return row.checkout_time;
          return timePart.substring(0, 5);
        },
      },
      {
        title: "Status",
        key: "attendance_category_name",
        width: 150,
        align: "center",
        render(row: any) {
          // Pemetaan warna berdasarkan attendance_category_id sesuai master data:
          // 1=Masuk, 2=Terlambat masuk, 3=Pulang awal,
          // 4=Tidak Check In, 5=Tidak Check Out, 6=Alpha
          const styleMap: Record<number, { bg: string; color: string }> = {
            1: { bg: "#52c41a", color: "#fff" }, // Masuk          → hijau
            2: { bg: "#fa8c16", color: "#fff" }, // Terlambat masuk → oranye
            3: { bg: "#faad14", color: "#fff" }, // Pulang awal    → kuning
            4: { bg: "#f5222d", color: "#fff" }, // Tidak Check In  → merah
            5: { bg: "#f5222d", color: "#fff" }, // Tidak Check Out → merah
            6: { bg: "#820014", color: "#fff" }, // Alpha           → merah gelap
          };

          const id: number | null = row.attendance_category_id ?? null;
          const style =
            id !== null
              ? (styleMap[id] ?? { bg: "#d9d9d9", color: "#595959" })
              : { bg: "#d9d9d9", color: "#595959" };

          return h(
            "div",
            {
              style: {
                backgroundColor: style.bg,
                color: style.color,
                padding: "4px 8px",
                borderRadius: "4px",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "12px",
              },
            },
            row.attendance_category_name || "-",
          );
        },
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
