<template>
  <n-data-table
    :columns="columns"
    :data="data"
    :row-key="rowKey"
    default-expand-all
  />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import type { DataTableColumns } from 'naive-ui'
import { Config } from '@/constant/config'

interface RowData {
  name: string
  index: string
  children?: RowData[]
}

export default defineComponent({
  setup() {
    const data = ref<RowData[]>([])
    
    //{ type: 'selection' },

    const columns: DataTableColumns<RowData> = [      
      { title: 'Name', key: 'name' }
    ]

    const rowKey = (row: RowData) => row.index

    const token = localStorage.getItem(Config.TokenName)
      const session = localStorage.getItem(Config.SessionName)
      if (!token) {
        console.error('No token found!')
        return false
      }

    onMounted(async () => {
      const response = await fetch(Config.UrlBackend+`/api/organization/treetable`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          uSession: `${session}`,
        },
      });
      data.value = await response.json()
    })

    return {
      data,
      columns,
      rowKey
    }
  }
})

</script>