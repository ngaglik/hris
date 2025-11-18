<template>
  <div>  
        <h3>Checklog</h3>
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
                  style="width: 100px"
                  placeholder="Select"
                  :options="generalOptions.year"
                />
              </n-form-item>
              
              <n-form-item label="Bulan" path="formFilter.month">
                <n-select
                  v-model:value="formFilter.month"
                  style="width: 200px"
                  placeholder="Select"
                  :options="generalOptions.month"
                />
              </n-form-item>

              <n-form-item>
                <n-button @click="handleValidateClick">
                  Tampilkan
                </n-button>
              </n-form-item>
            </n-form>

              <n-data-table
                :columns="columns"
                :data="tableData"
                :scroll-x="1000"
                :max-height="300"
              />
        <n-pagination
          v-model:page="current"
          :page-count="Math.ceil(total / pageSize)"
          @update:page="handlePageChange"
        />      
  </div>
</template>
<script src="./Checklog.ts"/>