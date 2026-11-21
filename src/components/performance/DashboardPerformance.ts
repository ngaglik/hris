import { defineComponent, ref, computed } from "vue";
import { generalOptions } from "@/constant/config";

export interface MonthlyScoreItem {
  month: number;
  monthLabel: string;
  score: number;
}

export default defineComponent({
  name: "DashboardPerformance",
  setup() {
    const now = new Date();
    const selectedMonth = ref<number | null>(now.getMonth() + 1);
    const selectedYear = ref<number>(now.getFullYear());
    const loading = ref<boolean>(false);
    const totalIndikator = ref<number>(0);

    const monthOptions = generalOptions.month;
    const yearOptions = generalOptions.year;

    const selectedMonthLabel = computed(() => {
      const found = monthOptions.find((m) => m.value === selectedMonth.value);
      return found ? found.label : "";
    });

    const monthlyScores = ref<MonthlyScoreItem[]>([ //value dummy
      { month: 1, monthLabel: "Jan", score: 90 },
      { month: 2, monthLabel: "Feb", score: 95 },
      { month: 3, monthLabel: "Mar", score: 100 },
      { month: 4, monthLabel: "Apr", score: 85 },
      { month: 5, monthLabel: "May", score: 80 },
      { month: 6, monthLabel: "Jun", score: 70 },
      { month: 7, monthLabel: "Jul", score: 80 },
      { month: 8, monthLabel: "Aug", score: 100 },
      { month: 9, monthLabel: "Sep", score: 100 },
      { month: 10, monthLabel: "Oct", score: 100 },
      { month: 11, monthLabel: "Nov", score: 0 },
      { month: 12, monthLabel: "Dec", score: 0 },
    ]);

    const getBarColor = (score: number): string => {
      if (score >= 90) return "#22c55e";
      if (score >= 70) return "#3b82f6";
      return "#f59e0b";
    };

    const reload = async () => {
      loading.value = true;
      try {
        // TODO: fetch data kinerja individu berdasarkan bulan & tahun
      } finally {
        loading.value = false;
      }
    };

    return {
      selectedMonth,
      selectedMonthLabel,
      selectedYear,
      monthOptions,
      yearOptions,
      loading,
      totalIndikator,
      monthlyScores,
      getBarColor,
      reload,
    };
  },
});
