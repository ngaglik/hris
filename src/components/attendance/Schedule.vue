<template>
  <div>  
        <h3>Jadwal</h3>
        <n-space vertical>
          <n-space horizontal>           
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
                :scroll-x="1000"
                :max-height="300"
              />
        <n-pagination
          v-model:page="current"
          :page-count="Math.ceil(total / pageSize)"
          @update:page="handlePageChange"
        />      
        </n-space>
  </div>
</template>
<script src="./Schedule.ts"/>