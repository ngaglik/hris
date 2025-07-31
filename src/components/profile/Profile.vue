<template>
  <n-card title="Profile" style="margin-bottom: 16px">
    <n-tabs class="card-tabs" size="large" animated>
      <n-tab-pane name="user" tab="Anda">
        <UserProfile/>
      </n-tab-pane>
      <n-tab-pane name="unit kerja" tab="Unit kerja">
        <UnitProfile/>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>
<script src="./Profile.ts"/>