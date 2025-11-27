<template>
  <div>  
        <h3>Jadwal</h3>
            <n-form
              ref="formRef"
              inline
              :label-width="200"
              :model="formFilter"
              :rules="rules"
              :size="size"
            >
              <n-form-item label="Tahun" path="formFilter.year">
                <n-select
                  v-model:value="formFilter.year"
                  style="width: 120px"
                  placeholder="Select"
                  :options="generalOptions.year"
                  @update:value="handleShowData"
                />
              </n-form-item>
              
              <n-form-item label="Bulan" path="formFilter.month">
                <n-select
                  v-model:value="formFilter.month"
                  style="width: 180px"
                  placeholder="Select"
                  :options="generalOptions.month"
                  @update:value="handleShowData"
                />
              </n-form-item>

              <div style="flex:1"></div>

              <n-form-item>
                <n-button @click="handleEditData" type="primary">
                  Ubah
                </n-button>
              </n-form-item>

            </n-form>

              <n-data-table
                :columns="columns"
                :data="tableData"
                :scroll-x="1000"
                :max-height="1200"
              />
        <n-pagination
          v-model:page="current"
          :page-count="Math.ceil(total / pageSize)"
          @update:page="handlePageChange"
        />      
  </div>

  <n-modal v-model:show="isModalOpen" title="Pengaturan Jadwal" preset="dialog" :style="{ width: '500px' }">
      <n-data-table
                :columns="columnsEdit"
                :data="tableData"
                :scroll-x="500"
                :max-height="1500"
      />
  </n-modal>

</template>
<script src="./Schedule.ts"/>