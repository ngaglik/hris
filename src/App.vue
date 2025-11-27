<template>
  <n-config-provider :locale="idID" :date-locale="dateId">
    <Login v-if="!isLoggedIn" @login-success="isLoggedIn = true" />

    <template v-else>
      <n-layout class="app-layout">

        <!-- MOBILE TOP BAR -->
        <div class="mobile-header">
          <n-button text @click="collapsed = !collapsed">
            <i class="ri-menu-line"></i>
          </n-button>

          <span>
            <n-h4 prefix="bar">
              <n-text type="primary">HRIS</n-text>
            </n-h4>
          </span>
          <div style="flex:1"></div>
          <div class="right">
            <n-button text size="small" @click="changeTheme">{{ theme === null ? 'Dark' : 'Light' }}</n-button> 
            <n-button text size="small" @click="changeLang">{{ showLang }}</n-button> 
            <ProfileBar @logout="handleLogout"/>
          </div>
        </div>

        <!-- DESKTOP TOP BAR -->
        <div class="desktop-header">
          <div class="left">
            <span>
              <n-h4 prefix="bar">
                <n-text type="primary">HRIS</n-text>
              </n-h4>
            </span>
          </div>
          <div class="right">
            <n-button text size="small" @click="changeTheme">{{ theme === null ? 'Dark' : 'Light' }}</n-button> 
            <n-button text size="small" @click="changeLang">{{ showLang }}</n-button> 
            <ProfileBar @logout="handleLogout"/>
          </div>
        </div>

        <!-- SIDEBAR -->
        <n-layout-sider
          collapse-mode="transform"
          :collapsed="collapsed"
          :collapsed-width="0"
          :width="260"
          show-trigger="arrow-circle"
          class="app-layout-sider"
          @collapse="collapsed = true"
          @expand="collapsed = false"
        >
          <div class="app-layout-sider__title">
            Menu
          </div>

          <n-menu
            :value="activeName"
            :options="layoutOptions"
            :collapsed="collapsed"
            :collapsed-icon-size="20"
            @update:value="handleMenuSelect"
          />
        </n-layout-sider>

        <!-- MAIN CONTENT -->
        <n-layout class="right-layout" :style="{ marginLeft: collapsed ? '0' : '260px' }">
          <n-layout-content class="layout-content">
            <router-view v-slot="{ Component }">
              <component :is="Component" :key="$route.path" />
            </router-view>
          </n-layout-content>
        </n-layout>

      </n-layout>
    </template>
  </n-config-provider>
</template>


<script src="./App.ts"/>
<style scoped>
.app-layout {
  height: 100vh;
  overflow: hidden;
}

/* Desktop Header */
.desktop-header {
  display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    border-bottom: 1px solid #ddd;
    position: sticky;
    top: 0;
    background: var(--n-color);
    z-index: 10;
}

.right-layout {
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-content {
  padding: 12px;
}

/* Sidebar sejajar dengan Main Content pada desktop */
.app-layout-sider {
  position: fixed !important;
    z-index: 99;
    height: 100vh;
    margin-top: 0 !important;
  padding-top: 56px; /* supaya isi menu tidak nabrak HEADER */
}

/* Mobile Top Bar */
.mobile-header {
  display: none;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .desktop-header {
    display: none;
  }

  .mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 3px;
    border-bottom: 1px solid #ddd;
    position: sticky;
    top: 0;
    background: var(--n-color);
    z-index: 10;
  }

  .right-layout {
    margin-left: 0 !important;
    padding-top: 0 !important;
  }
  
  .app-layout-sider {
    position: fixed !important;
    z-index: 99;
    height: 100vh;
    margin-top: 0 !important;
  }

  .layout-content {
    padding: 10px;
  }
}


</style>
