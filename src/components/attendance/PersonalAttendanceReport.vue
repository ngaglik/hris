<template>
    <div>
        <h3>Report Kehadiran</h3>

        <n-form
            ref="formRef"
            inline
            :label-width="120"
            :model="formFilter"
            :size="size"
        >
            <n-form-item label="Tahun" path="formFilter.year">
                <n-select
                    v-model:value="formFilter.year"
                    style="width: 100px"
                    placeholder="Pilih Tahun"
                    :options="generalOptions.year"
                />
            </n-form-item>

            <n-form-item label="Bulan" path="formFilter.month">
                <n-select
                    v-model:value="formFilter.month"
                    style="width: 100px"
                    placeholder="Pilih Bulan"
                    :options="generalOptions.month"
                />
            </n-form-item>
            <n-form-item label="Pegawai" v-if="can('attendance.report.find')">
                <n-input-group>
                    <n-button type="primary"> Search </n-button>
                    <n-select
                        :style="{ width: '100%' }"
                        v-model:value="formFilter.employee_id"
                        :options="employeeOptions"
                        :loading="employeeLoading"
                        filterable
                        remote
                        clearable
                        placeholder="Cari nama..."
                        @search="handleInputSearchEmployee"
                        @update:value="handleEmployeeSelect"
                    />
                    <!-- <n-button type="primary" ghost> Search </n-button> -->
                </n-input-group>
            </n-form-item>
            <n-form-item>
                <n-button
                    type="primary"
                    @click="handleShowData"
                    :loading="loading"
                >
                    Tampilkan
                </n-button>
            </n-form-item>
        </n-form>

        <n-divider style="margin: 12px 0" />

        <div
            v-if="tableData.length === 0 && !loading"
            style="text-align: center; padding: 20px; color: #999"
        >
            <n-empty description="Tidak ada data kehadiran untuk bulan ini" />
        </div>

        <n-data-table
            v-if="tableData.length > 0"
            :row-props="rowProps"
            :columns="columns"
            :data="tableData"
            :scroll-x="1400"
            :loading="loading"
            :max-height="450"
            :single-line="false"
        />

        <div v-if="tableData.length > 0" style="margin-top: 12px">
            <n-pagination
                v-model:page="current"
                :page-count="Math.ceil(total / pageSize)"
                :page-size="pageSize"
                show-size-picker
                :page-sizes="[10, 20, 50, 100]"
                @update:page="handlePageChange"
            />
        </div>
    </div>
</template>

<script src="./PersonalAttendanceReport.ts" />
<style scoped>
:deep(.row-not-workday td) {
    color: #ff0000 !important;
}

:deep(.row-alpha td) {
    font-weight: bold;
}

:deep(.row-late td) {
    font-weight: bold;
}

:deep(.row-early td) {
    font-weight: bold;
}
</style>
