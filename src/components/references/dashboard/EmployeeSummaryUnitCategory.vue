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
</style>
