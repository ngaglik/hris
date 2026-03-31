<template>
    <div>
        <h3>Rincian Kehadiran Harian</h3>

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
            :columns="columns"
            :data="tableData"
            :scroll-x="1400"
            :loading="loading"
            :max-height="450"
            striped
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

<script src="./DailyAttendance.ts" />
``` Sekarang saya perlu update backend endpoint untuk menampilkan data satu
bulan penuh:
