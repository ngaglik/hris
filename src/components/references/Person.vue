<template>
  <div>  
        <h3>Data Personal</h3>
                        
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
          :scroll-x="1200"
        />
        <n-pagination
          v-model:page="current"
          :page-count="Math.ceil(total / pageSize)"
          @update:page="handlePageChange"
        />      
        </n-space>
  </div>
  <n-modal v-model:show="isPreviewOpen" :title="formData.name" :style="{width:'90%'}" preset="dialog">
    <n-card title="Profile" style="margin-bottom: 16px">
    <UserProfile :employeeId="formData.id"/>
    </n-card>
  </n-modal>
  <n-modal v-model:show="isModalOpen" :title="isEditMode ? 'Edit Data' : 'Tambah Data'" preset="dialog" :style="{ width: '600px' }">
      <n-form :model="formData" label-width="100">          
        <n-form-item label="NIK">
          <n-input v-model:value="formData.national_id_number" />
        </n-form-item>
        <n-form-item label="Name">
          <n-input v-model:value="formData.name" />
        </n-form-item>
        <n-form-item label="Tgl Lahir">
          <n-input v-model:value="formData.birth_date" placeholder="yyyy-mm-dd"/>
        </n-form-item>

        <n-form-item label="Jenis kelamin">
          <n-select
            v-model:value="formData.gender"
            :options="genderOptions"
            placeholder="Pilih Jenis Kelamin"
            clearable
          />
        </n-form-item>   
        <n-form-item label="Status Perkawinan">
          <n-select
            v-model:value="formData.is_married"
            :options="marriedOptions"
            placeholder="Pilih"
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


        <n-divider title-placement="left">
          Perpajakan
        </n-divider>
        <n-form-item label="NPWP">
          <n-input v-model:value="formData.tax_id_number" />
        </n-form-item>        
        <n-form-item label="Status Pelaporan Suami-Istri">
          <n-select
            v-model:value="formData.is_tax_combined"
            :options="taxCombinedOptions"
            placeholder="Pilih"
            clearable
          />
        </n-form-item>
        <n-form-item label="Status Perkawinan (SPT)">
          <n-select
            v-model:value="formData.tax_marital_id"
            :options="maritalOptions"
            placeholder="Pilih"
            clearable
          />
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
<script src="./Person.ts"/>