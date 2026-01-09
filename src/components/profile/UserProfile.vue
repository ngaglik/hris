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
          <div style="flex:1"></div>
          <n-form-item>
            <n-button @click="handleEditData" type="primary">
              Ubah
            </n-button>
          </n-form-item>
          <n-form-item>  
            <n-button type="warning" @click="confirmation" class="mb-4">
                Konfirmasi
              </n-button>   
          </n-form-item>   
    </n-form>
    <n-space vertical>
      <n-scrollbar x-scrollable style="max-width: 100%;">
        <n-grid x-gap="12" :cols="4" style="min-width: 1200px;">
          <n-gi>
            <n-card title="Personal" style="max-width: 300px; margin: 0 auto;" class="card yellow" hoverable>
                <div>
                  <p><strong>Nama</strong></p>{{ profile.name }}
                  <p><strong>JKel / Tanggal Lahir</strong></p>{{ profile.gender }} / {{ profile.birth_date }}
                  <p><strong>NIK</strong></p>{{ profile.national_id_number }}
                  <p><strong>BPJS Kesehatan</strong></p>{{ profile.health_insurance_id_number }}
                </div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card title="Kontak" style="max-width: 300px; margin: 0 auto;" class="card green" hoverable>
                <div>
                  <p><strong>Alamat</strong></p>{{ profile.address }}
                  <p><strong>Hp</strong></p>{{ profile.phone_number }}
                  <p><strong>Email</strong></p>{{ profile.email }}
                </div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card title="Kepegawaian" style="max-width: 300px; margin: 0 auto;" class="card blue" hoverable>
                <div>
                  <p><strong>NIP</strong></p>{{ profile.national_employee_id_number }}
                  <p><strong>Unit kerja</strong></p>{{ profile.organization_name }}
                  <p><strong>Jabatan</strong></p>{{ profile.professional_name }}
                  <p><strong>Lokasi</strong></p>{{ profile.location_name }}
                </div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card title="Pelatihan" style="max-width: 300px; margin: 0 auto;" class="card purple" hoverable>
                <div>
                  <p><strong>Total Pelatihan</strong></p>
                  <p><strong>Total SKP</strong></p>
                  <p><strong>Total JPL</strong></p>
                </div>
            </n-card>
          </n-gi>
          <n-gi>
            
          </n-gi>
        </n-grid>
      </n-scrollbar>
    </n-space>
    <n-space vertical>
      <n-card title="Keluarga" style="max-width: 100%; margin: 0 auto;" hoverable>
          <div>
            <Family :employeeId="empId" :personId="persId"/>
          </div>
        </n-card>
    </n-space>
    <n-space vertical>
      <n-card title="Riwayat Pendidikan" style="max-width: 100%; margin: 0 auto;" hoverable>
          <div>
            <Education :employeeId="empId" :personId="persId"/>
          </div>
        </n-card>
    </n-space>
  </div>
  <n-modal v-model:show="isModalOpen" title="Edit data" preset="dialog" :style="{ width: '500px' }">
      <n-form :model="profile" label-width="100">
        <n-form-item label="ID">
          {{profile.id}}
        </n-form-item>
        <n-form-item label="NIK">
          <n-input v-model:value="profile.national_id_number" />
        </n-form-item>
        <n-form-item label="Title Depan">
          <n-input v-model:value="profile.front_title" />
        </n-form-item>
        <n-form-item label="Name">
          <n-input v-model:value="profile.name" />
        </n-form-item>
        <n-form-item label="Title Belakang">
          <n-input v-model:value="profile.end_title" />
        </n-form-item>
        <n-form-item label="Tgl Lahir">
          <n-input v-model:value="profile.birth_date" />
        </n-form-item>
        <n-form-item label="JKel">
          <n-select
            v-model:value="profile.gender"
            :options="genderOptions"
            placeholder="Pilih Jenis Kelamin"
            clearable
          />
        </n-form-item>
        <n-form-item label="Alamat" >
          <n-input v-model:value="profile.address" 
          type="textarea"
          placeholder="Masukkan alamat lengkap"
          clearable/>
        </n-form-item>
        <n-form-item label="No HP">
          <n-input v-model:value="profile.phone_number" />
        </n-form-item>
        <n-form-item label="Email">
          <n-input v-model:value="profile.email" />
        </n-form-item>
      </n-form>
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