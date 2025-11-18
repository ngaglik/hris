<template>
  <div class="login-wrapper">
    <n-card title="Sudahkah Anda klik hari ini?" style="max-width: 400px; margin: 0 auto;">
      <n-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-placement="top"
      >      
        <n-space >
          <n-button
            type="primary"
            :loading="loading"
            @click="CheckIn"
          >
            Check In
          </n-button>

          <n-button
            type="warning"
            :loading="loading"
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
<script src="./Attendance.ts"/>