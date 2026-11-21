<template>
  <div class="dashboard-root">
    <!-- ── Header ──────────────────────────────────────────────────────── -->
    <div class="dashboard-header">
      <div class="dashboard-title">
        <span class="dashboard-icon">📚</span>
        <div>
          <h2>Dashboard E-Performance Individu</h2>
        </div>
      </div>
      <div class="dashboard-controls">
        <n-select
          v-model:value="selectedMonth"
          :options="monthOptions"
          clearable
          style="width: 120px"
          placeholder="Pilih Bulan"
        />
        <n-select
          v-model:value="selectedYear"
          :options="yearOptions"
          style="width: 110px"
          placeholder="Tahun"
        />
        <n-button type="primary" :loading="loading" @click="reload">
          <template #icon>
            <span>⚙️</span>
          </template>
          Refresh
        </n-button>
      </div>
    </div>

    <!-- ── Main Content (Left: Stat Cards, Right: Monthly Chart) ───────── -->
    <div class="dashboard-main">
      <!-- Kolom Kiri: Stat Cards -->
      <div class="stat-column">
        <div class="stat-card stat-card--green">
          <div class="stat-card__icon">🏆</div>
          <div class="stat-card__body">
            <div class="stat-card__value">
              100
              <!--{{ totalIndikator }}-->
            </div>
            <div class="stat-card__label">Nilai Kinerja {{ selectedMonthLabel }}</div>
          </div>
          <div class="stat-card__bg">🏆</div>
        </div>

        <div class="stat-card stat-card--yellow">
          <div class="stat-card__icon">🎯</div>
          <div class="stat-card__body">
            <div class="stat-card__value">
              90
              <!--{{ totalIndikator }}-->
            </div>
            <div class="stat-card__label">Rata-Rata Nilai</div>
          </div>
          <div class="stat-card__bg">🎯</div>
        </div>

        <div class="stat-card stat-card--blue">
          <div class="stat-card__icon">📋</div>
          <div class="stat-card__body">
            <div class="stat-card__value">
              8
              <!--{{ totalIndikator }}-->
            </div>
            <div class="stat-card__label">Total Indikator</div>
          </div>
          <div class="stat-card__bg">📋</div>
        </div>
      </div>

      <!-- Kolom Kanan: Grafik Rekap Nilai per Bulan -->
      <n-card class="chart-card" title="Nilai Kinerja Per Bulan">
        <div class="bar-chart">
          <div
            v-for="item in monthlyScores"
            :key="item.month"
            class="bar-row"
          >
            <div class="bar-label">{{ item.monthLabel }}</div>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{
                  width: Math.min(Math.max(item.score, 0), 100) + '%',
                  background: getBarColor(item.score),
                }"
              >
                <span v-if="item.score >= 15" class="bar-pct-inside">
                  {{ item.score }}%
                </span>
              </div>
            </div>
            <div class="bar-pct-right">{{ item.score }}%</div>
          </div>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script lang="ts" src="./DashboardPerformance.ts"></script>

<style scoped>
/* ── Root ──────────────────────────────────────────────────────────────────── */
.dashboard-root {
  padding: 0 0 24px;
  min-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
}

/* ── Header ────────────────────────────────────────────────────────────────── */
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding-bottom: 4px;
  border-bottom: 2px solid var(--n-border-color, #e5e7eb);
}

.dashboard-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.dashboard-icon {
  font-size: 2.2rem;
  line-height: 1;
}

.dashboard-title h2 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.dashboard-title p {
  margin: 2px 0 0;
  font-size: 0.82rem;
  opacity: 0.6;
}

.dashboard-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ── Main Layout (Kiri Card, Kanan Grafik) ─────────────────────────────────── */
.dashboard-main {
  flex: 1;
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 24px;
  align-items: stretch;
}

/* ── Stat Cards (Kolom Kiri) ───────────────────────────────────────────────── */
.stat-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-card {
  position: relative;
  border-radius: 16px;
  padding: 28px 28px 24px;
  min-height: 140px;
  color: #fff;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 18px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
}

.stat-card--green {
  background: linear-gradient(135deg, #3dfe61, #218433);
}
.stat-card--yellow {
  background: linear-gradient(135deg, #f69c3b, #d8711d);
}
.stat-card--blue {
  background: linear-gradient(135deg, #3da4fe, #215c84);
}

.stat-card__icon {
  font-size: 2.5rem;
  flex-shrink: 0;
  padding-top: 2px;
}

.stat-card__body {
  flex: 1;
  z-index: 1;
}

.stat-card__value {
  font-size: 2.75rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.5px;
}

.stat-card__label {
  font-size: 0.95rem;
  margin-top: 8px;
  opacity: 0.9;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-card__bg {
  position: absolute;
  right: -6px;
  bottom: -14px;
  font-size: 6.5rem;
  opacity: 0.12;
  pointer-events: none;
  user-select: none;
}

/* ── Chart Card (Kolom Kanan) ──────────────────────────────────────────────── */
.chart-card {
  border-radius: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-card :deep(.n-card__content) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.bar-chart {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
  padding: 6px 0;
}

.bar-row {
  display: grid;
  grid-template-columns: 160px 1fr 48px;
  align-items: center;
  gap: 14px;
}

.bar-label {
  font-size: 0.9rem;
  opacity: 0.85;
  white-space: nowrap;
}

.bar-track {
  position: relative;
  height: 26px;
  background: var(--n-border-color, #eef0f4);
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.bar-fill {
  height: 100%;
  min-width: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 6px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.bar-pct-inside {
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
}

.bar-pct-right {
  font-size: 0.8rem;
  font-weight: 700;
  text-align: right;
  opacity: 0.75;
}

/* ── Responsive ────────────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .dashboard-main {
    grid-template-columns: 1fr;
  }
  .bar-row {
    grid-template-columns: 80px 1fr 44px;
  }
}

@media (max-width: 768px) {
  .stat-card__value {
    font-size: 2.1rem;
  }
}
</style>
