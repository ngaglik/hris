<template>
  <div>  
        <h3>Referensi Pegawai</h3>
        <n-layout >
          <n-layout-content content-style="padding: 24px;">            
                <selectTree @update="onOrgSelected" />    
          </n-layout-content>         
          
        </n-layout>
                    
        <n-space vertical>
          <n-space horizontal>
          </n-space>
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
          <n-space horizontal>
              
          </n-space>
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
  <n-modal v-model:show="isModalOpen" :title="isEditMode ? 'Edit Data' : 'Tambah Data'" preset="dialog" :style="{ width: '600px' }">
      <n-form :model="formData" label-width="100">
        <n-form-item label="NIK">
          <n-input v-model:value="formData.national_id_number" />
        </n-form-item>
        <n-form-item label="Title Depan">
          <n-input v-model:value="formData.front_title" />
        </n-form-item>
        <n-form-item label="Name">
          <n-input v-model:value="formData.name" />
        </n-form-item>
        <n-form-item label="Title Belakang">
          <n-input v-model:value="formData.end_title" />
        </n-form-item>
        <n-form-item label="Tgl Lahir">
          <n-input v-model:value="formData.birth_date" />
        </n-form-item>
        <n-form-item label="JKel">
          <n-select
            v-model:value="formData.gender"
            :options="genderOptions"
            placeholder="Pilih Jenis Kelamin"
            clearable
          />
        </n-form-item>
        <n-form-item label="Alamat" >
          <n-input v-model:value="formData.address" 
          type="textarea"
          placeholder="Masukkan alamat lengkap"
          clearable/>
        </n-form-item>
        <n-form-item label="No HP">
          <n-input v-model:value="formData.phone_number" />
        </n-form-item>
        <n-form-item label="Email">
          <n-input v-model:value="formData.email" />
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
<script src="./Employee.ts"/>