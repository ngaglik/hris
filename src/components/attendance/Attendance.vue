<template>
  <div class="center-text">
    <n-card
      title="Sudahkah Anda klik hari ini?"
      class="card-container"
    >
      <n-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-placement="top"
      >
        <n-space
          horizontal
          class="btn-group"
        >
          <n-button
            type="primary"
            :loading="loading"
            block
            @click="CheckIn"
          >
            Check In
          </n-button>

          <n-button
            type="warning"
            :loading="loading"
            block
            @click="CheckOut"
          >
            Check Out
          </n-button>

        </n-space>
      </n-form>
    </n-card>
  </div>

  <n-tabs class="card-tabs" size="large" animated>
    <n-tab-pane name="user" tab="Jadwal">
      <Schedule :employeeId="employeeId"/>
    </n-tab-pane>
    <n-tab-pane name="unit kerja" tab="Checklog">
      <Checklog/>
    </n-tab-pane>
  </n-tabs>
</template>

<style>

.center-text {
  text-align: center;
}

.login-wrapper {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.card-container {
  width: 100%;
  max-width: 420px;
  margin-bottom: 16px;
  text-align: center; /* pusatkan teks di dalam card */
  display: flex;
  flex-direction: column;
  align-items: center; /* ratakan isi horizontal */
}

.btn-group {
  width: 100%;
  display: flex;
  gap: 8px;
  justify-content: center; /* pusatkan tombol */
}

.btn-group > .n-button {
  width: 100%; /* tetap full width */
}

/* Tabs responsive */
.card-tabs {
  margin-top: 12px;
  padding: 0 8px;
}

/* Optional: layout lebih rapat di mobile */
@media (max-width: 480px) {
  .card-container {
    padding: 8px;
  }

  .card-tabs {
    font-size: 14px;
  }
}
</style>
<script src="./Attendance.ts"/>