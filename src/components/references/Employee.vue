<template>
    <div>
        <h3>Referensi Pegawai</h3>
        <n-layout>
            <n-layout-content content-style="padding: 24px;">
                <selectTree @update="onOrgSelected" />
            </n-layout-content>
        </n-layout>

        <n-space vertical>
            <n-space horizontal> </n-space>
            <n-space horizontal>
                <n-button type="primary" @click="openAddModal" class="mb-4">
                    Tambah Data
                </n-button>
                <n-input-group>
                    <n-button type="primary"> Search </n-button>
                    <n-input
                        :style="{ width: '50%' }"
                        v-model:value="inputSearch"
                        @keydown.enter="handleInputSearch"
                    />
                    <n-button type="primary" ghost> Search </n-button>
                </n-input-group>
                <!-- ✅ FILTER KATEGORI -->
                <n-input-group>
                    <n-button type="primary"> Pilih </n-button>
                    <n-select
                        v-model:value="employeeCategoryFilter"
                        :options="employeeCategoryOptions"
                        placeholder="Filter kategori pegawai"
                        clearable
                        style="width: 220px"
                        @update:value="handleCategoryFilter"
                    />
                </n-input-group>
                <n-input-group>
                    <n-button type="primary">Status</n-button>

                    <n-select
                        v-model:value="isActiveFilter"
                        :options="statusOptions"
                        placeholder="Filter status"
                        clearable
                        style="width: 180px"
                        @update:value="handleStatusFilter"
                    />
                </n-input-group>
            </n-space>
            <n-space horizontal> </n-space>
            <n-data-table
                :columns="columns"
                :data="tableData"
                :max-height="1000"
                :scroll-x="1800"
            />
            <n-pagination
                v-model:page="current"
                :page-count="Math.ceil(total / pageSize)"
                @update:page="handlePageChange"
            />
        </n-space>
    </div>
    <n-modal
        v-model:show="isPreviewOpen"
        :title="formData.name"
        :style="{ width: '90%' }"
        preset="dialog"
    >
        <n-card title="Profile" style="margin-bottom: 16px">
            <UserProfile
                :personId="formData.person_id"
                :familyId="formData.family_id"
            />
        </n-card>
    </n-modal>
    <n-modal
        v-model:show="isModalOpen"
        :title="isEditMode ? 'Edit Data' : 'Tambah Data'"
        preset="dialog"
        :style="{ width: '600px' }"
    >
        <n-form :model="formData" label-width="100">
            <n-form-item label="Person">
                <n-input-group>
                    <n-button type="primary"> Search </n-button>
                    <n-select
                        :style="{ width: '50%' }"
                        v-model:value="formData.person_id"
                        :options="personOptions"
                        :loading="personLoading"
                        filterable
                        remote
                        clearable
                        placeholder="Cari person..."
                        @search="handleInputSearchPerson"
                        @update:value="handlePersonSelect"
                    />
                    <n-button type="primary" ghost> Search </n-button>
                </n-input-group>
            </n-form-item>
            <n-form-item label="Nama">
                {{ formData.name }}
            </n-form-item>
            <n-form-item label="NIP">
                {{ formData.national_employee_id_number }}
            </n-form-item>
            <n-form-item label="Status">
                <n-switch v-model:value="formData.is_active">
                    <template #checked>Aktif</template>
                    <template #unchecked>Nonaktif</template>
                </n-switch>
            </n-form-item>
            <n-form-item label="Kategori Pegawai">
                <n-select
                    v-model:value="formData.employee_category_id"
                    :options="employeeCategoryOptions"
                    placeholder=""
                    clearable
                />
            </n-form-item>

            <n-form-item label="Profesi">
                <n-select
                    v-model:value="formData.professional_id"
                    :options="professionalOptions"
                    placeholder=""
                    clearable
                />
            </n-form-item>

            <n-form-item label="Unit kerja">
                <n-select
                    v-model:value="formData.organization_id"
                    :options="organizationOptions"
                    @update:value="onOrganizationChange"
                    placeholder=""
                    clearable
                />
            </n-form-item>

            <n-form-item label="Jabatan">
                <n-select
                    v-model:value="formData.position_id"
                    :options="positionOptions"
                    placeholder=""
                    clearable
                />
            </n-form-item>
            <n-form-item label="Tags">
                <n-select
                    v-model:value="formData.tags"
                    :options="tagOptions"
                    multiple
                    filterable
                    clearable
                    tag
                    placeholder="Pilih atau ketik tags..."
                />
            </n-form-item>
        </n-form>
        <n-space horizontal>
            <n-button @click="closeModal">Batal</n-button>
            <n-button type="primary" @click="submitForm">
                {{ isEditMode ? "Simpan Perubahan" : "Tambah" }}
            </n-button>
        </n-space>
    </n-modal>
</template>
<script src="./Employee.ts" />
