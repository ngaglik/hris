<template>
  <div>
    <h3>Referensi Organisasi</h3>
    <n-space vertical>
      <n-space horizontal align="center">
        <n-button type="primary" @click="openAddModal">
          Tambah Data
        </n-button>
        <n-input
          :style="{ width: '280px' }"
          v-model:value="inputSearch"
          clearable
          placeholder="Cari nama organisasi"
        />
      </n-space>
      <n-data-table
        :columns="columns"
        :data="tableData"
        :row-key="rowKey"
        :loading="loading"
        default-expand-all
        :max-height="520"
      />
    </n-space>
  </div>
  <n-modal v-model:show="isModalOpen" :title="isEditMode ? 'Edit Data' : 'Tambah Data'" preset="dialog" :style="{ width: '600px' }">
      <n-form :model="formData" label-width="100">
        <n-form-item label="Id">
          <n-input v-model:value="formData.id" :disabled="isEditMode" placeholder="Kosongkan untuk dibuat otomatis" />
        </n-form-item>
        <n-form-item label="Nama">
          <n-input v-model:value="formData.name" placeholder="Nama organisasi" />
        </n-form-item>
        <n-form-item label="Induk">
          <n-tree-select
            v-model:value="formData.parentId"
            :options="parentOptions"
            default-expand-all
            filterable
            clearable
            placeholder="Pilih organisasi induk"
          />
        </n-form-item>
      </n-form>
      <n-space horizontal>
        <n-button @click="closeModal">Batal</n-button>
        <n-button type="primary" :loading="loading" @click="submitForm">
          {{ isEditMode ? 'Simpan Perubahan' : 'Tambah' }}
        </n-button>
      </n-space>
    </n-modal>
</template>
<script src="./Organization.ts"/>
