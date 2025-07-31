<template>
  <n-tree-select
    :options="options"
    @update:value="handleUpdateValue"
  />
</template>

<script src="./Table.ts"/>