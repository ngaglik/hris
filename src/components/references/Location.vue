<template>
  <div>  
        <h3>Referensi Lokasi</h3>
        <n-space vertical>
          <n-space horizontal>
              <n-button type="primary" @click="openAddModal" class="mb-4">
                Tambah Data
              </n-button>
              <n-input-group>
                <n-button type="primary">
                  Search
                </n-button>
                <n-input :style="{ width: '50%' }" v-model:value="inputSearch" @keydown.enter="handleInputSearch" />
                <n-button type="primary" ghost>
                  Search
                </n-button>
              </n-input-group>
            </n-space>
          <n-data-table
  			    :columns="columns"
  			    :data="tableData"
  			    :max-height="300"
  			  />
          <n-pagination
        v-model:page="current"
        :page-count="Math.ceil(total / pageSize)"
        @update:page="handlePageChange"
      />      
    </n-space>
  </div>
  <n-modal v-model:show="isModalOpen" :title="isEditMode ? 'Edit Data' : 'Tambah Data'" preset="dialog" :style="{ width: '600px' }">
      <n-form :model="formData" label-width="100">
        <n-form-item label="Id">
          <n-input v-model:value="formData.id" />
        </n-form-item>  
        <n-form-item label="Name">
          <n-input v-model:value="formData.name" />
        </n-form-item>  
        </n-form>      
      <n-space horizontal>
        <n-button @click="closeModal">Batal</n-button>
        <n-button type="primary" @click="submitForm">
          {{ isEditMode ? 'Simpan Perubahan' : 'Tambah' }}
        </n-button>
      </n-space>
    </n-modal>
</template>
<script src="./Location.ts"/>