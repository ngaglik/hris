<template>
  <n-dropdown :options="options" @select="handleSelect">
    <n-button>{{welcomeName}}</n-button>
  </n-dropdown>
  <ChangePassword v-model:show="showChangePassword" />
</template>
<script src="./ProfileBar.ts"/>