<template>
    <n-tabs class="card-tabs" size="large" animated>
      <n-tab-pane name="user" tab="Anda">
        <UserProfile :employeeId="employeeId"/>
      </n-tab-pane>
      <n-tab-pane name="unit kerja" tab="Unit kerja">
        <UnitProfile/>
      </n-tab-pane>
    </n-tabs>
</template>
<script src="./Profile.ts"/>