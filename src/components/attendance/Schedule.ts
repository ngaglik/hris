import { defineComponent, ref, h } from "vue";
import { useMessage, NSelect } from "naive-ui";
import {
  Config,
  generalOptions,
  dictHari,
  scheduleTypeStyle,
} from "@/constant/config";
import { apiFetch } from "@/services/apiClient";
import { getAuthData, logout } from "@/services/authService";

export default defineComponent({
  setup() {
    const message = useMessage();

    const tableData = ref<any[]>([]);
    const current = ref(1);
    const pageSize = ref(100);
    const total = ref(0);
    const loading = ref(false);
    const formFilter = ref({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    });

    const scheduleTypeOptions = ref<any[]>([]);
    const scheduleGroupOptions = ref<any[]>([]);

    // ─── Fetch Options ────────────────────────────────────────────────────────

    const fetchScheduleType = async () => {
      try {
        const res = await apiFetch(
          `${Config.UrlBackend}/api/option/schedule_type`,
        );
        if (!res || !res.ok) return;
        const result = await res.json();
        scheduleTypeOptions.value = (result.data ?? result.Data ?? []).map(
          (x: any) => ({
            label: x.name,
            value: x.id,
          }),
        );
      } catch (err) {
        console.error("Error loading schedule type", err);
      }
    };

    const fetchScheduleGroup = async () => {
      try {
        const auth = getAuthData();
        if (!auth) {
          logout();
          return;
        }
        const tags = auth?.employee?.[0]?.tags;
        const res = await apiFetch(
          `${Config.UrlBackend}/api/option/schedule_group/${tags}/true`,
        );
        if (!res || !res.ok) return;
        const result = await res.json();
        scheduleGroupOptions.value = [
          //{ label: "Libur", value: 0 },
          ...(result.data ?? result.Data ?? []).map((x: any) => ({
            label: x.name,
            value: x.id,
          })),
        ];
      } catch (err) {
        console.error("Error loading schedule group", err);
      }
    };

    // ─── Fetch Data ───────────────────────────────────────────────────────────

    const fetchData = async (page = 1) => {
      const auth = getAuthData();
      if (!auth) {
        logout();
        return;
      }
      const employeeId = auth?.employee?.[0]?.id;

      loading.value = true;
      try {
        const response = await apiFetch(
          `${Config.UrlBackend}/api/attendance/getschedule` +
            `?employeeId=${employeeId}` +
            `&year=${formFilter.value.year}` +
            `&month=${formFilter.value.month}` +
            `&page=${page}` +
            `&pageSize=${pageSize.value}`,
          { method: "GET" },
        );

        if (!response || !response.ok) {
          message.error(
            `Gagal memuat data jadwal (${response?.status ?? "error"})`,
          );
          return;
        }

        const result = await response.json();
        tableData.value = result.data ?? result.Data ?? [];
        current.value = result.page ?? result.Page ?? page;
        total.value = result.total ?? result.Total ?? 0;
      } catch (err: any) {
        message.error(`Gagal memuat data jadwal: ${err?.message ?? err}`);
      } finally {
        loading.value = false;
      }
    };

    // ─── Handlers ─────────────────────────────────────────────────────────────

    /** Tampilkan — selalu mulai dari halaman 1 agar filter langsung berlaku */
    const handleShowData = () => {
      current.value = 1;
      fetchData(1);
    };

    const handlePageChange = (page: number) => {
      current.value = page;
      fetchData(page);
    };

    const updateScheduleField = async (row: any, field: string, value: any) => {
      try {
        row._updating = true;

        // ✅ auto mapping
        if (field === "schedule_group_id" && value === 0) {
          row.schedule_type_id = 5;
        }

        if (field === "schedule_type_id" && value === 5) {
          row.schedule_group_id = 0;
        }

        if (field === "schedule_type_id" && value === 1) {
          const firstGroup = scheduleGroupOptions.value?.[0];
          if (firstGroup) {
            row.schedule_group_id = firstGroup.value; // pilihan pertama
          }
        }
        // update value utama
        row[field] = value;

        const response = await apiFetch(
          `${Config.UrlBackend}/api/attendance/schedule/${row.id_seq}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              [field]: value,
              schedule_group_id: row.schedule_group_id,
              schedule_type_id: row.schedule_type_id,
            }),
          },
        );

        if (!response || !response.ok) {
          const errData = await response?.json().catch(() => null);
          throw new Error(
            errData?.message || `Server error (${response?.status})`,
          );
        }

        message.success("Berhasil diupdate");
      } catch (err: any) {
        console.error(err);
        message.error(err?.message || "Gagal update");
      } finally {
        row._updating = false;
      }
    };

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /** Kembalikan nama hari dalam Bahasa Indonesia dengan null-safe trim */
    const getDayLabel = (dayName: string | null | undefined): string => {
      const raw = dayName?.trim() ?? "";
      return dictHari.get(raw) ?? raw;
    };

    const isWeekend = (dayName: string | null | undefined): boolean => {
      const raw = dayName?.trim() ?? "";
      return raw === "Saturday" || raw === "Sunday";
    };

    // ─── Kolom tampilan normal ────────────────────────────────────────────────

    const columns = [
      {
        title: "Tanggal",
        key: "schedule_date",
        render: (row: any) => row.schedule_date ?? "-",
        cellProps: () => ({ style: { backgroundColor: "#d9fdd3" } }),
      },
      {
        title: "Hari",
        key: "day_name",
        render: (row: any) =>
          h(
            "span",
            {
              style: {
                color: isWeekend(row.day_name) ? "red" : "inherit",
                fontWeight: isWeekend(row.day_name) ? "bold" : "normal",
              },
            },
            getDayLabel(row.day_name) || "-",
          ),
      },
      {
        title: "Masuk",
        key: "schedule_time_start",
        render: (row: any) => {
          if (!row.schedule_time_start) return "-";
          const t = new Date(row.schedule_time_start);
          return isNaN(t.valueOf())
            ? row.schedule_time_start
            : t.toTimeString().slice(0, 5);
        },
      },
      {
        title: "Pulang",
        key: "schedule_time_end",
        render: (row: any) => {
          if (!row.schedule_time_end) return "-";
          const t = new Date(row.schedule_time_end);
          return isNaN(t.valueOf())
            ? row.schedule_time_end
            : t.toTimeString().slice(0, 5);
        },
      },

      {
        title: "Ket",
        key: "schedule_type_name",
        render: (row: any) =>
          h(NSelect, {
            value: row.schedule_type_id,
            options: scheduleTypeOptions.value,
            disabled: !!row._updating,
            renderLabel: (option: any) => {
              const st = scheduleTypeStyle[option.value as number];
              return h(
                "div",
                { style: "display:flex;align-items:center;gap:6px" },
                [
                  h("span", {
                    style: `width:8px;height:8px;border-radius:50%;background:${st?.dot ?? "#d9d9d9"};display:inline-block;flex-shrink:0`,
                  }),
                  h("span", option.label as string),
                ],
              );
            },
            async onUpdateValue(v: any) {
              row.schedule_type_id = v;
              row.schedule_type_name =
                scheduleTypeOptions.value.find((o) => o.value === v)?.label ??
                "-";
              await updateScheduleField(row, "schedule_type_id", v);
            },
            style: "width:130px",
          }),
        cellProps: (row: any) => ({
          style: {
            verticalAlign: "top",
            backgroundColor:
              scheduleTypeStyle[row.schedule_type_id]?.bg ?? "transparent",
          },
        }),
      },
      {
        title: "Jadwal",
        key: "schedule_group_name",
        render: (row: any) =>
          h(NSelect, {
            value: row.schedule_group_id,
            options: scheduleGroupOptions.value,
            disabled: !!row._updating,
            async onUpdateValue(v: any) {
              row.schedule_group_id = v;
              row.schedule_group_name =
                scheduleGroupOptions.value.find((o) => o.value === v)?.label ??
                "-";
              await updateScheduleField(row, "schedule_group_id", v);
            },
            style: "width:140px",
          }),
        cellProps: () => ({ style: { verticalAlign: "top" } }),
      },
    ];

    // ─── Init ─────────────────────────────────────────────────────────────────

    fetchData(current.value);
    fetchScheduleType();
    fetchScheduleGroup();

    return {
      columns,
      tableData,
      current,
      pageSize,
      total,
      loading,
      handleShowData,
      handlePageChange,
      scheduleTypeOptions,
      scheduleGroupOptions,
      generalOptions,
      formFilter,
    };
  },
});
