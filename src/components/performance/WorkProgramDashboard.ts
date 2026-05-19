import { defineComponent, ref, computed, onMounted, h } from "vue";
import { useMessage, NTag, NProgress } from "naive-ui";
import { apiFetch } from "@/services/apiClient";
import { Config } from "@/constant/config";
import { getAuthData } from "@/services/authService";

type OrgOption = {
  label: string;
  value: string;
};

// ─── Types ────────────────────────────────────────────────────────────────────

type ProgramProgressDto = {
  id: number;
  name: string | null;
  year: number | null;
  totalTasks: number;
  doneTasks: number;
  avgProgress: number;
  personResponsibleName: string | null;
};

type UpcomingTaskDto = {
  id: number;
  programId: number | null;
  programName: string | null;
  name: string | null;
  tanggalSelesai: string | null;
  priority: string | null;
  status: string | null;
  progress: number | null;
  daysLeft: number;
};

type ProgramStatusSummaryDto = {
  programId: number;
  programName: string | null;
  planned: number;
  onProgress: number;
  done: number;
  postponed: number;
  total: number;
};

type DashboardData = {
  totalPrograms: number;
  totalTasks: number;
  avgProgress: number;
  taskDone: number;
  taskOnProgress: number;
  taskPlanned: number;
  taskPostponed: number;
  programProgress: ProgramProgressDto[];
  upcomingTasks: UpcomingTaskDto[];
  programStatusSummary: ProgramStatusSummaryDto[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_TYPE: Record<
  string,
  "error" | "warning" | "success" | "default"
> = {
  high: "error",
  medium: "warning",
  low: "success",
};

const PRIORITY_LABEL: Record<string, string> = {
  high: "🔴 Tinggi",
  medium: "🟡 Sedang",
  low: "🟢 Rendah",
};

const STATUS_TYPE: Record<string, "default" | "info" | "success" | "warning"> =
  {
    planned: "default",
    on_progress: "info",
    done: "success",
    postponed: "warning",
  };

const STATUS_LABEL: Record<string, string> = {
  planned: "Direncanakan",
  on_progress: "Berjalan",
  done: "Selesai",
  postponed: "Ditunda",
};

const STATUS_COLOR: Record<string, string> = {
  planned: "#94a3b8",
  on_progress: "#3b82f6",
  done: "#22c55e",
  postponed: "#f59e0b",
};

export default defineComponent({
  name: "WorkProgramDashboard",

  setup() {
    const message = useMessage();
    const loading = ref(false);

    const selectedYear = ref<number | null>(new Date().getFullYear());

    const yearOptions = computed(() => {
      const y = new Date().getFullYear();
      return [
        { label: String(y - 1), value: y - 1 },
        { label: String(y), value: y },
        { label: String(y + 1), value: y + 1 },
      ];
    });

    // ── Organization filter ───────────────────────────────────────────────────
    const sessionOrgId: string | null =
      getAuthData()?.employee?.[0]?.organizationId ?? null;
    const selectedOrg = ref<string | null>(sessionOrgId);
    const orgOptions = ref<OrgOption[]>([]);
    const orgLoading = ref(false);

    const loadOrganizations = async () => {
      orgLoading.value = true;
      try {
        const res = (await apiFetch(
          `${Config.UrlBackend}/api/option/organization`,
          { method: "GET" },
        )) as Response | void;
        if (!res?.ok) return;
        const json: any = await res.json();
        const list = json.Data ?? json.data ?? [];
        orgOptions.value = (list as { id: string; name: string }[]).map(
          (o) => ({
            label: o.name,
            value: o.id,
          }),
        );
      } catch (_) {
        orgOptions.value = [];
      } finally {
        orgLoading.value = false;
      }
    };

    const dashboard = ref<DashboardData | null>(null);

    // ── Computed helpers ──────────────────────────────────────────────────────

    const completionRate = computed(() => {
      if (!dashboard.value || dashboard.value.totalTasks === 0) return 0;
      return Math.round(
        (dashboard.value.taskDone / dashboard.value.totalTasks) * 100,
      );
    });

    const statusChartData = computed(() => {
      if (!dashboard.value) return [];
      const d = dashboard.value;
      const total = d.totalTasks || 1;
      return [
        {
          label: "Selesai",
          value: d.taskDone,
          color: STATUS_COLOR.done,
          pct: Math.round((d.taskDone / total) * 100),
        },
        {
          label: "Berjalan",
          value: d.taskOnProgress,
          color: STATUS_COLOR.on_progress,
          pct: Math.round((d.taskOnProgress / total) * 100),
        },
        {
          label: "Direncanakan",
          value: d.taskPlanned,
          color: STATUS_COLOR.planned,
          pct: Math.round((d.taskPlanned / total) * 100),
        },
        {
          label: "Ditunda",
          value: d.taskPostponed,
          color: STATUS_COLOR.postponed,
          pct: Math.round((d.taskPostponed / total) * 100),
        },
      ];
    });

    // SVG Donut chart segments
    const donutSegments = computed(() => {
      const data = statusChartData.value;
      const total = data.reduce((s, d) => s + d.value, 0);
      if (total === 0) return [];

      const radius = 70;
      const cx = 90;
      const cy = 90;
      const circumference = 2 * Math.PI * radius;

      let offset = 0;
      return data
        .map((d) => {
          const dashLen = (d.value / total) * circumference;
          const dashGap = circumference - dashLen;
          const seg = {
            ...d,
            dashLen,
            dashGap,
            offset: offset * (circumference / total),
          };
          offset += d.value;
          return seg;
        })
        .filter((s) => s.value > 0);
    });

    // Bar chart for program progress
    const barChartData = computed(() => {
      if (!dashboard.value) return [];
      return dashboard.value.programProgress.slice(0, 8).map((p) => ({
        name:
          p.name && p.name.length > 28
            ? p.name.slice(0, 28) + "…"
            : (p.name ?? "–"),
        fullName: p.name ?? "–",
        progress: Math.round(p.avgProgress),
        totalTasks: p.totalTasks,
        doneTasks: p.doneTasks,
        responsible: p.personResponsibleName ?? "–",
        color:
          p.avgProgress >= 75
            ? "#22c55e"
            : p.avgProgress >= 40
              ? "#3b82f6"
              : "#f59e0b",
      }));
    });

    // Upcoming task columns
    const upcomingColumns = [
      {
        title: "Tugas",
        key: "name",
        minWidth: 180,
        ellipsis: { tooltip: true },
      },
      {
        title: "Program",
        key: "programName",
        minWidth: 160,
        ellipsis: { tooltip: true },
        render: (row: UpcomingTaskDto) => row.programName ?? "–",
      },
      {
        title: "Tgl Selesai",
        key: "tanggalSelesai",
        width: 120,
        render: (row: UpcomingTaskDto) => row.tanggalSelesai ?? "–",
      },
      {
        title: "Sisa Hari",
        key: "daysLeft",
        width: 110,
        render: (row: UpcomingTaskDto) => {
          const days = row.daysLeft;
          const type =
            days < 0
              ? "error"
              : days <= 3
                ? "error"
                : days <= 7
                  ? "warning"
                  : "success";
          const label =
            days < 0
              ? `${Math.abs(days)} hari lalu`
              : days === 0
                ? "Hari ini"
                : `${days} hari`;
          return h(
            NTag,
            { type, size: "small", round: true },
            { default: () => label },
          );
        },
      },
      {
        title: "Prioritas",
        key: "priority",
        width: 110,
        render: (row: UpcomingTaskDto) =>
          row.priority
            ? h(
                NTag,
                {
                  type: PRIORITY_TYPE[row.priority] ?? "default",
                  size: "small",
                  round: true,
                },
                {
                  default: () => PRIORITY_LABEL[row.priority!] ?? row.priority,
                },
              )
            : h("span", {}, "–"),
      },
      {
        title: "Status",
        key: "status",
        width: 130,
        render: (row: UpcomingTaskDto) =>
          row.status
            ? h(
                NTag,
                {
                  type: STATUS_TYPE[row.status] ?? "default",
                  size: "small",
                  round: true,
                },
                { default: () => STATUS_LABEL[row.status!] ?? row.status },
              )
            : h("span", {}, "–"),
      },
      {
        title: "Progress",
        key: "progress",
        width: 130,
        render: (row: UpcomingTaskDto) => {
          const pct = row.progress ?? 0;
          const status =
            pct >= 100 ? "success" : pct >= 50 ? "info" : "default";
          return h(NProgress, {
            type: "line",
            percentage: pct,
            status,
            height: 10,
            borderRadius: 4,
            showIndicator: true,
            style: "min-width: 100px",
          });
        },
      },
    ];

    // Program status summary columns
    const summaryColumns = [
      {
        title: "Program Kerja",
        key: "programName",
        minWidth: 200,
        ellipsis: { tooltip: true },
        render: (row: ProgramStatusSummaryDto) => row.programName ?? "–",
      },
      {
        title: "Total",
        key: "total",
        width: 80,
        render: (row: ProgramStatusSummaryDto) =>
          h(NTag, { size: "small" }, { default: () => String(row.total) }),
      },
      {
        title: "Selesai",
        key: "done",
        width: 90,
        render: (row: ProgramStatusSummaryDto) =>
          h(
            NTag,
            { type: "success", size: "small" },
            { default: () => String(row.done) },
          ),
      },
      {
        title: "Berjalan",
        key: "onProgress",
        width: 90,
        render: (row: ProgramStatusSummaryDto) =>
          h(
            NTag,
            { type: "info", size: "small" },
            { default: () => String(row.onProgress) },
          ),
      },
      {
        title: "Direncanakan",
        key: "planned",
        width: 110,
        render: (row: ProgramStatusSummaryDto) =>
          h(NTag, { size: "small" }, { default: () => String(row.planned) }),
      },
      {
        title: "Ditunda",
        key: "postponed",
        width: 90,
        render: (row: ProgramStatusSummaryDto) =>
          h(
            NTag,
            { type: "warning", size: "small" },
            { default: () => String(row.postponed) },
          ),
      },
      {
        title: "Completion",
        key: "completion",
        width: 150,
        render: (row: ProgramStatusSummaryDto) => {
          const pct =
            row.total > 0 ? Math.round((row.done / row.total) * 100) : 0;
          return h(NProgress, {
            type: "line",
            percentage: pct,
            status: pct >= 100 ? "success" : pct >= 50 ? "info" : "default",
            height: 10,
            borderRadius: 4,
            showIndicator: true,
            style: "min-width: 110px",
          });
        },
      },
    ];

    // ── Load ──────────────────────────────────────────────────────────────────

    const reload = async () => {
      loading.value = true;
      try {
        const params = new URLSearchParams();
        if (selectedYear.value) params.set("year", String(selectedYear.value));
        if (selectedOrg.value) params.set("orgId", selectedOrg.value);

        const res = (await apiFetch(
          `${Config.UrlBackend}/api/perf/dashboard?${params.toString()}`,
          { method: "GET" },
        )) as Response | void;

        if (!res) throw new Error("Unauthorized");
        if (!res.ok) throw new Error(`Server error (${res.status})`);

        const json: any = await res.json();
        dashboard.value = json.data ?? json.Data ?? null;
      } catch (e: any) {
        message.error(e?.message || "Gagal memuat data dashboard");
      } finally {
        loading.value = false;
      }
    };

    onMounted(async () => {
      await loadOrganizations();
      void reload();
    });

    return {
      loading,
      selectedYear,
      yearOptions,
      selectedOrg,
      orgOptions,
      orgLoading,
      dashboard,
      completionRate,
      statusChartData,
      donutSegments,
      barChartData,
      upcomingColumns,
      summaryColumns,
      STATUS_COLOR,
      reload,
    };
  },
});
