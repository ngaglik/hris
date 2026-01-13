<template>
  <div>
    <n-form
              ref="formRef"
              inline
              :label-width="200"
              :model="formFilter"
              :rules="rules"
              :size="size"
            >
          <n-form-item>
            <n-button @click="handleEditData" type="primary">
              Ubah data
            </n-button>
          </n-form-item>
          <div style="flex:1"></div>
    </n-form>
    <n-space vertical>
      <n-scrollbar x-scrollable style="max-width: 100%;">
        <n-grid x-gap="12" :cols="4" style="min-width: 1200px;">
          <n-gi>
            <n-card title="Personal" style="max-width: 300px; margin: 0 auto;" class="card yellow" hoverable>
                <div>
                  <p><strong>Nama</strong></p>{{ profilePerson.name }}
                  <p><strong>Kelamin / Tanggal Lahir</strong></p>{{ getGenderLabel(profilePerson.gender)}} / {{ profilePerson.birth_date }}
                  <p><strong>Status Perkawinan (KTP)</strong></p>{{ getMarriedLabel(profilePerson.is_married) }} 
                  <p><strong>NIK</strong></p>{{ profilePerson.national_id_number }}
                  <p><strong>BPJS Kesehatan</strong></p>{{ profilePerson.health_insurance_id_number }}
                </div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card title="Kontak" style="max-width: 300px; margin: 0 auto;" class="card green" hoverable>
                <div>
                  <p><strong>Alamat</strong></p>{{ profilePerson.address }}
                  <p><strong>Hp</strong></p>{{ profilePerson.phone_number }}
                  <p><strong>Email</strong></p>{{ profilePerson.email }}
                </div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card title="Perpajakan" style="max-width: 300px; margin: 0 auto;" class="card green" hoverable>
                <div>
                  <p><strong>NPWP</strong></p>{{ profilePerson.tax_id_number }}
                  <p><strong>Status Pelaporan Suami-Istri</strong></p>{{ getTaxCombinedLabel(profilePerson.is_tax_combined) }}
                  <p><strong>Status Perkawinan (SPT)</strong></p>{{ getMaritalOptionsLabel(profilePerson.tax_marital_id) }} 
                </div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card title="Kepegawaian" style="max-width: 300px; margin: 0 auto;" class="card blue" hoverable>
                <div>
                  <p><strong>NIP</strong></p>{{ profileEmployee.national_employee_id_number }}
                  <p><strong>Unit kerja</strong></p>{{ profileEmployee.organization_name }}
                  <p><strong>Jabatan</strong></p>{{ profileEmployee.professional_name }}
                  <p><strong>Lokasi</strong></p>{{ profileEmployee.location_name }}
                </div>
            </n-card>
          </n-gi>
          
        </n-grid>
      </n-scrollbar>
    </n-space>
    <n-divider/>
    <n-space vertical>
      <n-card title="" style="max-width: 100%; margin: 0 auto;" hoverable>
          <div>
            <Family :employeeId="empId" :personId="persId"/>
          </div>
        </n-card>
    </n-space>
    <!--<n-space vertical>
      <n-card title="" style="max-width: 100%; margin: 0 auto;" hoverable>
          <div>
            <Education :employeeId="empId" :personId="persId"/>
          </div>
        </n-card>
    </n-space>-->
  </div>
  <n-modal v-model:show="isModalOpen" title="Edit data" preset="dialog" :style="{ width: '500px' }">
      <n-form :model="profilePerson" label-width="100">
        <n-divider title-placement="left">
          Personal
        </n-divider>
        <n-form-item label="NIK">
          <n-input v-model:value="profilePerson.national_id_number" />
        </n-form-item>
        <n-form-item label="Name">
          <n-input v-model:value="profilePerson.name" />
        </n-form-item>
        <n-form-item label="Tgl Lahir">
          <n-input v-model:value="profilePerson.birth_date" />
        </n-form-item>
        <n-form-item label="Jenis kelamin">
          <n-select
            v-model:value="profilePerson.gender"
            :options="genderOptions"
            placeholder="Pilih Jenis Kelamin"
            clearable
          />
        </n-form-item>
        <n-form-item label="Status Perkawinan  (KTP)">
          <n-select
            v-model:value="profilePerson.is_married"
            :options="marriedOptions"
            placeholder="Pilih"
            clearable
          />
        </n-form-item>
        <n-form-item label="Alamat" >
          <n-input v-model:value="profilePerson.address" 
          type="textarea"
          placeholder="Masukkan alamat lengkap"
          clearable/>
        </n-form-item>
        <n-form-item label="No HP">
          <n-input v-model:value="profilePerson.phone_number" />
        </n-form-item>
        <n-form-item label="Email">
          <n-input v-model:value="profilePerson.email" />
        </n-form-item>

        <n-divider title-placement="left">
          Perpajakan
        </n-divider>
        <n-form-item label="NPWP">
          <n-input v-model:value="profilePerson.tax_id_number" />
        </n-form-item>        
        <n-form-item label="Status Pelaporan Suami-Istri">
          <n-select
            v-model:value="profilePerson.is_tax_combined"
            :options="taxCombinedOptions"
            placeholder="Pilih"
            clearable
          />
        </n-form-item>
        <n-form-item label="Status Perkawinan (SPT)">
          <n-select
            v-model:value="profilePerson.tax_marital_id"
            :options="maritalOptions"
            placeholder="Pilih"
            clearable
          />
        </n-form-item> 
      </n-form>
      <n-space horizontal>
        <n-button @click="closeModal">Batal</n-button>
        <n-button type="primary" @click="submitForm">
          Simpan
        </n-button>
      </n-space>
  </n-modal>

</template>
<style scoped>
  .card {
    max-width: 300px;
    margin: 0 auto;
    background-color: var(--n-card-color);
    transition: all 0.25s ease;
  }

  /* Variasi aksen warna (tanpa rusak dark mode) */
  .blue {
    border-left: 4px solid #3b82f6;
  }
  .green {
    border-left: 4px solid #22c55e;
  }
  .yellow {
    border-left: 4px solid #eab308;
  }
  .purple {
    border-left: 4px solid #8b5cf6;
  }

  /* ===== CARD TITLE UNDERLINE ===== */
.card :deep(.n-card-header) {
  padding-bottom: 6px;
  border-bottom: none; /* hilangkan default */
}

.card :deep(.n-card-header__main) {
  position: relative;
  font-weight: 700;
  padding-bottom: 6px;
}

/* underline */
.card :deep(.n-card-header__main)::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 36px;
  height: 2px;
  background-color: currentColor; /* ikut warna title */
  border-radius: 2px;
}
  </style>
<script src="./UserProfile.ts"/>