<template>
  <n-grid x-gap="12" :cols="3">
    <n-gi>
      <n-card title="Personal" style="max-width: 300px; margin: 20 auto;" hoverable>
          <div>
            <p><strong>Nama</strong></p>{{ profile.name }}
            <p><strong>JKel / Tanggal Lahir</strong></p>{{ profile.gender }} / {{ profile.birth_date }}
            <p><strong>NIK</strong></p>{{ profile.national_id_number }}
            <p><strong>BPJS Kesehatan</strong></p>{{ profile.health_insurance_id_number }}
          </div>
      </n-card>
    </n-gi>
    <n-gi>
      <n-card title="Kontak" style="max-width: 300px; margin: 0 auto;" hoverable>
          <div>
            <p><strong>Alamat</strong></p>{{ profile.address }}
            <p><strong>Hp</strong></p>{{ profile.phone_number }}
            <p><strong>Email</strong></p>{{ profile.email }}
          </div>
      </n-card>
    </n-gi>
    <n-gi>
      <n-card title="Kepegawaian" style="max-width: 300px; margin: 0 auto;" hoverable>
          <div>
            <p><strong>NIP</strong></p>{{ profile.national_employee_id_number }}
            <p><strong>Unit kerja</strong></p>{{ profile.organization_name }}
            <p><strong>Jabatan</strong></p>{{ profile.professional_name }}
            <p><strong>Lokasi</strong></p>{{ profile.location_name }}
          </div>
      </n-card>
    </n-gi>
    <n-gi>
      <n-card title="Pelatihan" style="max-width: 300px; margin: 0 auto;" hoverable>
          <div>
            <p><strong>Total Pelatihan</strong></p>
            <p><strong>Total SKP</strong></p>
            <p><strong>Total JPL</strong></p>
          </div>
      </n-card>
    </n-gi>
  </n-grid>
</template>
<script src="./UserProfile.ts"/>