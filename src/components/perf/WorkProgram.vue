<template>
    <div>
        <h3>Program Kerja</h3>

        <n-space vertical>
            <n-space align="center" justify="space-between">
                <n-space align="center">
                    <n-button type="primary" @click="openAddModal"
                        >Tambah Program</n-button
                    >

                    <n-form inline :model="filter" :show-feedback="false">
                        <n-form-item label="Tahun">
                            <n-select
                                v-model:value="filter.year"
                                style="width: 120px"
                                :options="yearOptions"
                                clearable
                                placeholder="Semua"
                            />
                        </n-form-item>
                        <n-form-item label="Unit / Organisasi">
                            <n-select
                                v-model:value="filter.organizationId"
                                :options="orgOptions"
                                :loading="orgLoading"
                                filterable
                                clearable
                                style="width: 240px"
                                placeholder="Semua unit..."
                            />
                        </n-form-item>
                        <n-form-item label="Cari">
                            <n-input
                                v-model:value="filter.q"
                                placeholder="Nama / definisi operasional"
                                style="width: 280px"
                                @keydown.enter="reload"
                            />
                        </n-form-item>
                        <n-form-item>
                            <n-button @click="reload" :loading="loading"
                                >Tampilkan</n-button
                            >
                        </n-form-item>
                    </n-form>
                </n-space>
            </n-space>

            <n-data-table
                :columns="columns"
                :data="tableData"
                :loading="loading"
                :scroll-x="1400"
                :max-height="650"
                :row-key="(row: any) => row.id"
                v-model:expanded-row-keys="expandedRowKeys"
                class="wp-table"
            />
        </n-space>

        <n-modal
            v-model:show="isModalOpen"
            :title="isEditMode ? 'Edit Program Kerja' : 'Tambah Program Kerja'"
            preset="dialog"
            :style="{ width: '720px' }"
        >
            <n-form :model="formData" label-width="170">
                <n-form-item label="Tahun">
                    <n-input-number
                        v-model:value="formData.year"
                        :min="2000"
                        :max="2100"
                    />
                </n-form-item>
                <n-form-item label="Nama">
                    <n-input
                        v-model:value="formData.name"
                        placeholder="Nama program"
                    />
                </n-form-item>
                <n-form-item label="Definisi Operasional">
                    <n-input
                        v-model:value="formData.operational_definition"
                        type="textarea"
                        :autosize="{ minRows: 3, maxRows: 8 }"
                        placeholder="Definisi operasional"
                    />
                </n-form-item>
                <n-form-item label="Penanggung Jawab">
                    <n-select
                        v-model:value="formData.person_responsible"
                        :options="employeeOptions"
                        :loading="employeeSearchLoading"
                        filterable
                        remote
                        clearable
                        placeholder="Cari nama pegawai (min. 2 karakter)"
                        @search="searchEmployees"
                    />
                </n-form-item>
            </n-form>

            <n-space justify="end">
                <n-button @click="closeModal">Batal</n-button>
                <n-button type="primary" @click="submitForm" :loading="saving">
                    {{ isEditMode ? "Simpan" : "Tambah" }}
                </n-button>
            </n-space>
        </n-modal>
    </div>
</template>

<script src="./WorkProgram.ts" />

<style scoped>
/* Sembunyikan tombol expand panah bawaan Naive UI */
:deep(.wp-table .n-data-table-expand-trigger) {
    display: none !important;
}
:deep(.wp-table td.n-data-table-td--expand) {
    width: 0 !important;
    padding: 0 !important;
    overflow: hidden;
}
</style>
