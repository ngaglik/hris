<template>
  <h4>Profile</h4>
    <n-tabs class="card-tabs" size="large" animated>
      <n-tab-pane name="user" tab="Anda">
        <UserProfile :employeeId="employeeId"/>
      </n-tab-pane>
      <n-tab-pane name="unit kerja" tab="Unit kerja" v-if="showUnitTab">
        <UnitProfile/>
      </n-tab-pane>
    </n-tabs>
</template>
<script src="./Profile.ts"/>