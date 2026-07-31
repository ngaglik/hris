import { defineComponent, ref, computed, onMounted, h } from "vue";

import {
  NTag,
  NDescriptions,
  NDescriptionsItem,
  NTable,
  type DataTableColumns,
} from "naive-ui";

import { Config } from "@/constant/config";
import { apiFetch } from "@/services/apiClient";

interface CategorySummary {
  categoryId: number;
  categoryName: string;
  count: number;
}

interface ProfessionalSummary {
  professionalId: string;
  professionalName: string;
  total: number;
  categories: CategorySummary[];
}

interface UnitSummary {
  unitId: string;
  unitKerja: string;
  total: number;
  professional: ProfessionalSummary[];
}

interface OrganizationTree {
  index: string;
  name: string;
  children?: OrganizationTree[];
}

interface DashboardTreeRow {
  index: string;
  name: string;

  totalEmployee: number;
  professionalCount: number;

  professional: ProfessionalSummary[];

  children?: DashboardTreeRow[];
}
interface KpiCard {
  name: string;
  total: number;
  color: string;
}
type TagType = "default" | "primary" | "info" | "success" | "warning" | "error";

export default defineComponent({
  name: "EmployeeSummaryUnitCategory",

  setup() {
    const loading = ref(false);

    const treeData = ref<DashboardTreeRow[]>([]);

    const summaryData = ref<UnitSummary[]>([]);

    const rowKey = (row: DashboardTreeRow) => row.index;

    const getCategoryCardColor = (categoryName: string): string => {
      const name = categoryName.toLowerCase();

      if (name.includes("pns")) return "#4caf50";

      if (name.includes("pppk")) return "#2196f3";

      if (name.includes("kontrak")) return "#ff9800";

      if (name.includes("mitra")) return "#9c27b0";

      return "#607d8b";
    };

    const kpiCards = computed<KpiCard[]>(() => {
      const categories = new Map<string, number>();

      summaryData.value.forEach((unit) => {
        unit.professional.forEach((prof) => {
          prof.categories.forEach((cat) => {
            const current = categories.get(cat.categoryName) ?? 0;

            categories.set(cat.categoryName, current + cat.count);
          });
        });
      });

      const result: KpiCard[] = [
        {
          name: "Total Pegawai",
          total: totalEmployee.value,
          color: "#1565c0",
        },
      ];

      Array.from(categories.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([name, total]) => {
          result.push({
            name,
            total,
            color: getCategoryCardColor(name),
          });
        });

      return result;
    });

    const getProfessionColor = (professionName?: string): TagType => {
      if (!professionName) return "default";

      const name = professionName.toLowerCase();

      const mappings: {
        keywords: string[];
        type: TagType;
      }[] = [
        {
          keywords: ["dokter", "spesialis"],
          type: "error",
        },
        {
          keywords: ["perawat", "bidan"],
          type: "success",
        },
        {
          keywords: ["apoteker", "farmasi"],
          type: "warning",
        },
        {
          keywords: [
            "radiografer",
            "laboratorium",
            "analis",
            "nutrisionis",
            "fisioterapis",
            "terapis",
          ],
          type: "info",
        },
        {
          keywords: ["administrasi", "manajemen", "keuangan", "sdm"],
          type: "primary",
        },
      ];

      const match = mappings.find((group) =>
        group.keywords.some((keyword) => name.includes(keyword)),
      );

      return match?.type ?? "default";
    };
    const getCategoryColor = (categoryName?: string): TagType => {
      if (!categoryName) return "default";

      const name = categoryName.toLowerCase();

      if (name.includes("pns")) return "success";

      if (name.includes("pppk")) return "info";

      if (name.includes("kontrak")) return "warning";

      if (name.includes("mitra")) return "primary";

      return "default";
    };

    const renderProfessionalTable = (row: DashboardTreeRow) => {
      return h(
        "div",
        {
          style: {
            background: "#f8fafc",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          },
        },

        [
          h(
            NTable,
            {
              striped: true,
              bordered: true,
              size: "small",
            },

            {
              default: () => [
                h("thead", [
                  h(
                    "tr",
                    {
                      style: {
                        background: "#1565c0",
                        color: "white",
                      },
                    },

                    [
                      h("th", "Profesi"),
                      h("th", "Jumlah"),
                      h("th", "Kategori"),
                    ],
                  ),
                ]),

                h(
                  "tbody",

                  row.professional.map((prof) =>
                    h(
                      "tr",

                      [
                        h(
                          "td",

                          [
                            h(
                              NTag,
                              {
                                type: getProfessionColor(prof.professionalName),
                                round: true,
                              },

                              {
                                default: () => prof.professionalName,
                              },
                            ),
                          ],
                        ),

                        h(
                          "td",

                          [
                            h(
                              NTag,
                              {
                                type: "success",
                              },

                              {
                                default: () => prof.total,
                              },
                            ),
                          ],
                        ),

                        h(
                          "td",

                          prof.categories.map((cat) =>
                            h(
                              NTag,
                              {
                                size: "small",

                                type: getCategoryColor(cat.categoryName),

                                style: {
                                  marginRight: "6px",
                                  marginBottom: "4px",
                                },
                              },

                              {
                                default: () =>
                                  `${cat.categoryName} (${cat.count})`,
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            },
          ),
        ],
      );
    };

    const totalEmployee = computed(() =>
      summaryData.value.reduce((sum, item) => sum + item.total, 0),
    );

    const totalUnit = computed(() => summaryData.value.length);

    const totalProfessional = computed(() => {
      const set = new Set<string>();

      summaryData.value.forEach((unit) => {
        unit.professional.forEach((prof) => {
          set.add(prof.professionalId);
        });
      });

      return set.size;
    });

    const aggregateTree = (node: DashboardTreeRow): DashboardTreeRow => {
      if (!node.children || node.children.length === 0) {
        return node;
      }

      node.children = node.children.map(aggregateTree);

      node.totalEmployee = node.children.reduce(
        (sum, child) => sum + child.totalEmployee,
        node.totalEmployee,
      );

      return node;
    };

    const mergeTree = (
      organizations: OrganizationTree[],
      summaries: UnitSummary[],
    ): DashboardTreeRow[] => {
      const summaryMap = new Map(summaries.map((x) => [String(x.unitId), x]));

      const buildNode = (node: OrganizationTree): DashboardTreeRow => {
        const summary = summaryMap.get(String(node.index));

        return {
          index: node.index,

          name: node.name,

          totalEmployee: summary?.total ?? 0,

          professionalCount: summary?.professional?.length ?? 0,

          professional: summary?.professional ?? [],

          children: node.children?.map(buildNode) ?? [],
        };
      };

      return organizations.map(buildNode).map(aggregateTree);
    };

    const loadData = async (): Promise<void> => {
      loading.value = true;

      try {
        const orgResponse = (await apiFetch(
          `${Config.UrlBackend}/api/organization/treetable`,
          { method: "GET" },
        )) as Response | void;

        const summaryResponse = (await apiFetch(
          `${Config.UrlBackend}/api/employee/summary/unit-category`,
          { method: "GET" },
        )) as Response | void;

        if (!orgResponse || !summaryResponse) return;

        const organizations = (await orgResponse.json()) as OrganizationTree[];

        const summaries = (await summaryResponse.json()) as UnitSummary[];

        summaryData.value = summaries;

        treeData.value = mergeTree(organizations, summaries);
      } catch (error) {
        console.error(error);
      } finally {
        loading.value = false;
      }
    };

    // ── Ringkasan Kehadiran ─────────────────────────────────────────────

    const now = new Date();
    const attendanceFilter = ref({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    });
    const attendanceSummary = ref<any[]>([]);
    const attendanceLoading = ref(false);

    const monthOptions = [
      { label: "Januari", value: 1 },
      { label: "Februari", value: 2 },
      { label: "Maret", value: 3 },
      { label: "April", value: 4 },
      { label: "Mei", value: 5 },
      { label: "Juni", value: 6 },
      { label: "Juli", value: 7 },
      { label: "Agustus", value: 8 },
      { label: "September", value: 9 },
      { label: "Oktober", value: 10 },
      { label: "November", value: 11 },
      { label: "Desember", value: 12 },
    ];

    const attendanceYearOptions = computed(() => {
      const y = now.getFullYear();
      return [y - 2, y - 1, y, y + 1].map((v) => ({
        label: String(v),
        value: v,
      }));
    });

    const loadAttendanceSummary = async () => {
      attendanceLoading.value = true;
      try {
        const res = (await apiFetch(
          `${Config.UrlBackend}/api/attendance/getattendancereport` +
            `?year=${attendanceFilter.value.year}&month=${attendanceFilter.value.month}`,
          { method: "GET" },
        )) as Response | void;
        if (!res || !res.ok) {
          attendanceSummary.value = [];
          return;
        }
        const json = await res.json();
        attendanceSummary.value = json.data || [];
      } catch (error) {
        console.error(error);
        attendanceSummary.value = [];
      } finally {
        attendanceLoading.value = false;
      }
    };

    const totalAttendanceReported = computed(
      () => attendanceSummary.value.length,
    );

    const scoreHundredCount = computed(
      () =>
        attendanceSummary.value.filter((x: any) => x.discipline_score >= 100)
          .length,
    );

    const scoreHundredPercent = computed(() =>
      totalAttendanceReported.value > 0
        ? Math.round(
            (scoreHundredCount.value / totalAttendanceReported.value) * 100,
          )
        : 0,
    );

    onMounted(() => {
      loadData();
      loadAttendanceSummary();
    });

    const columns: DataTableColumns<DashboardTreeRow> = [
      {
        title: "Unit Kerja",
        key: "name",
        width: 350,
      },

      {
        title: "Jumlah Pegawai",

        key: "totalEmployee",

        render(row) {
          const type: TagType =
            row.totalEmployee >= 100
              ? "success"
              : row.totalEmployee >= 25
                ? "warning"
                : row.totalEmployee > 0
                  ? "info"
                  : "error";

          return h(
            NTag,
            {
              type,
              round: true,
            },
            {
              default: () => row.totalEmployee,
            },
          );
        },
      },

      {
        title: "Jumlah Profesi",
        key: "professionalCount",
      },

      {
        type: "expand",

        expandable: (row) => row.professional.length > 0,

        renderExpand: (row) => renderProfessionalTable(row),
      },
    ];

    return {
      loading,
      treeData,
      rowKey,
      columns,
      totalEmployee,
      totalUnit,
      totalProfessional,
      kpiCards,
      // ringkasan kehadiran
      attendanceFilter,
      attendanceLoading,
      attendanceSummary,
      monthOptions,
      attendanceYearOptions,
      loadAttendanceSummary,
      totalAttendanceReported,
      scoreHundredCount,
      scoreHundredPercent,
    };
  },
});
