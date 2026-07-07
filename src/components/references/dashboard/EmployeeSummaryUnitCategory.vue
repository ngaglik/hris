<template>
    <n-space vertical size="large">
        <!-- HEADER -->

        <n-page-header
            title="Dashboard SDM"
            subtitle="Struktur Organisasi dan Komposisi Pegawai"
        />

        <!-- KPI -->

        <div class="kpi-grid">
            <n-card
                v-for="item in kpiCards"
                :key="item.name"
                hoverable
                embedded
                :style="{
                    borderLeft: '6px solid ' + item.color,
                }"
            >
                <n-statistic :label="item.name" :value="item.total" />
            </n-card>
        </div>

        <!-- RINGKASAN KEHADIRAN -->
        <n-card title="Ringkasan Kehadiran">
            <n-space align="center" wrap style="margin-bottom: 12px">
                <n-select
                    v-model:value="attendanceFilter.year"
                    :options="attendanceYearOptions"
                    style="width: 100px"
                    @update:value="loadAttendanceSummary"
                />
                <n-select
                    v-model:value="attendanceFilter.month"
                    :options="monthOptions"
                    style="width: 130px"
                    @update:value="loadAttendanceSummary"
                />
            </n-space>

            <n-spin :show="attendanceLoading">
                <div class="score-grid">
                    <n-card
                        embedded
                        hoverable
                        :style="{ borderLeft: '6px solid #1565c0' }"
                    >
                        <n-statistic
                            label="Total Pegawai Terlapor"
                            :value="totalAttendanceReported"
                        />
                    </n-card>

                    <n-card
                        embedded
                        hoverable
                        :style="{ borderLeft: '6px solid #4caf50' }"
                    >
                        <n-statistic
                            label="Score Sempurna (100)"
                            :value="scoreHundredCount"
                        />
                    </n-card>

                    <n-card
                        embedded
                        hoverable
                        :style="{ borderLeft: '6px solid #f59e0b' }"
                    >
                        <n-statistic label="Persentase Score 100">
                            <template #default>
                                <span
                                    style="font-size: 1.6rem; font-weight: 700"
                                >
                                    {{ scoreHundredPercent }}%
                                </span>
                            </template>
                        </n-statistic>
                    </n-card>
                </div>

                <n-progress
                    type="line"
                    :percentage="scoreHundredPercent"
                    indicator-placement="inside"
                    :height="22"
                    :border-radius="4"
                    style="margin-top: 12px"
                    :status="
                        scoreHundredPercent >= 80
                            ? 'success'
                            : scoreHundredPercent >= 50
                              ? 'warning'
                              : 'error'
                    "
                />

                <div style="margin-top: 6px; font-size: 12px; color: #888">
                    {{ scoreHundredCount }} dari
                    {{ totalAttendanceReported }} pegawai memiliki disiplin
                    score = 100
                </div>
            </n-spin>
        </n-card>

        <!-- ORGANIZATION TREE -->

        <n-card title="Struktur Organisasi dan SDM">
            <n-spin :show="loading">
                <n-data-table
                    striped
                    size="small"
                    :columns="columns"
                    :data="treeData"
                    :row-key="rowKey"
                    default-expand-all
                />
            </n-spin>
        </n-card>
    </n-space>
</template>

<script lang="ts" src="./EmployeeSummaryUnitCategory.ts"></script>
<style scoped>
:deep(.n-data-table-thead th) {
    background-color: #00897b !important;
    color: white !important;
}

:deep(.n-data-table-th__title) {
    color: white !important;
}

:deep(.n-data-table-thead th) {
    background: #0d47a1 !important;
    color: white !important;
}

:deep(.n-data-table-th__title) {
    color: white !important;
    font-weight: 700;
}

:deep(.n-data-table-tr:hover td) {
    background: #f5f9ff !important;
}

.kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
}

.score-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
}
</style>
