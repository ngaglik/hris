<template>
    <div class="dashboard-root">
        <!-- ── Header ──────────────────────────────────────────────────────── -->
        <div class="dashboard-header">
            <div class="dashboard-title">
                <span class="dashboard-icon">📊</span>
                <div>
                    <h2>Dashboard Program Kerja</h2>
                    <p>Ringkasan capaian dan progres program kerja</p>
                </div>
            </div>
            <div class="dashboard-controls">
                <n-select
                    v-model:value="selectedOrg"
                    :options="orgOptions"
                    :loading="orgLoading"
                    filterable
                    clearable
                    style="width: 220px"
                    placeholder="Semua unit / organisasi"
                />
                <n-select
                    v-model:value="selectedYear"
                    :options="yearOptions"
                    style="width: 110px"
                    placeholder="Tahun"
                />
                <n-button type="primary" :loading="loading" @click="reload">
                    <template #icon>
                        <span>🔄</span>
                    </template>
                    Refresh
                </n-button>
            </div>
        </div>

        <!-- ── Loading Skeleton ───────────────────────────────────────────── -->
        <div v-if="loading" class="skeleton-grid">
            <n-skeleton v-for="i in 4" :key="i" height="120px" :sharp="false" />
            <n-skeleton
                height="340px"
                :sharp="false"
                style="grid-column: span 2"
            />
            <n-skeleton height="340px" :sharp="false" />
            <n-skeleton
                height="320px"
                :sharp="false"
                style="grid-column: span 3"
            />
        </div>

        <template v-else-if="dashboard">
            <!-- ── Stat Cards ──────────────────────────────────────────────── -->
            <div class="stat-grid">
                <div class="stat-card stat-card--blue">
                    <div class="stat-card__icon">📋</div>
                    <div class="stat-card__body">
                        <div class="stat-card__value">
                            {{ dashboard.totalPrograms }}
                        </div>
                        <div class="stat-card__label">Total Program</div>
                    </div>
                    <div class="stat-card__bg">📋</div>
                </div>

                <div class="stat-card stat-card--purple">
                    <div class="stat-card__icon">✅</div>
                    <div class="stat-card__body">
                        <div class="stat-card__value">
                            {{ dashboard.totalTasks }}
                        </div>
                        <div class="stat-card__label">Total Kegiatan</div>
                    </div>
                    <div class="stat-card__bg">✅</div>
                </div>

                <div class="stat-card stat-card--green">
                    <div class="stat-card__icon">🎯</div>
                    <div class="stat-card__body">
                        <div class="stat-card__value">
                            {{ dashboard.avgProgress }}%
                        </div>
                        <div class="stat-card__label">Rata-rata Progres</div>
                        <n-progress
                            type="line"
                            :percentage="dashboard.avgProgress"
                            :status="
                                dashboard.avgProgress >= 75
                                    ? 'success'
                                    : dashboard.avgProgress >= 40
                                      ? 'info'
                                      : 'default'
                            "
                            :height="6"
                            :show-indicator="false"
                            style="margin-top: 8px"
                        />
                    </div>
                    <div class="stat-card__bg">🎯</div>
                </div>

                <div class="stat-card stat-card--teal">
                    <div class="stat-card__icon">🏆</div>
                    <div class="stat-card__body">
                        <div class="stat-card__value">
                            {{ completionRate }}%
                        </div>
                        <div class="stat-card__label">Tingkat Penyelesaian</div>
                        <div class="stat-card__sub">
                            {{ dashboard.taskDone }} /
                            {{ dashboard.totalTasks }} selesai
                        </div>
                    </div>
                    <div class="stat-card__bg">🏆</div>
                </div>
            </div>

            <!-- ── Charts Row ──────────────────────────────────────────────── -->
            <div class="charts-grid">
                <!-- Donut Chart -->
                <n-card class="chart-card" title="Distribusi Status Kegiatan">
                    <div class="donut-wrapper">
                        <svg viewBox="0 0 180 180" class="donut-svg">
                            <!-- Background ring -->
                            <circle
                                cx="90"
                                cy="90"
                                r="70"
                                fill="none"
                                stroke="#e5e7eb"
                                stroke-width="22"
                            />
                            <!-- Segments -->
                            <circle
                                v-for="(seg, i) in donutSegments"
                                :key="i"
                                cx="90"
                                cy="90"
                                r="70"
                                fill="none"
                                :stroke="seg.color"
                                stroke-width="22"
                                :stroke-dasharray="`${seg.dashLen} ${seg.dashGap}`"
                                :stroke-dashoffset="-seg.offset"
                                stroke-linecap="butt"
                                style="
                                    transform: rotate(-90deg);
                                    transform-origin: 90px 90px;
                                    transition: stroke-dasharray 0.6s ease;
                                "
                            />
                            <!-- Center text -->
                            <text
                                x="90"
                                y="85"
                                text-anchor="middle"
                                class="donut-center-value"
                            >
                                {{ dashboard.totalTasks }}
                            </text>
                            <text
                                x="90"
                                y="102"
                                text-anchor="middle"
                                class="donut-center-label"
                            >
                                Kegiatan
                            </text>
                        </svg>

                        <div class="donut-legend">
                            <div
                                v-for="item in statusChartData"
                                :key="item.label"
                                class="legend-item"
                            >
                                <span
                                    class="legend-dot"
                                    :style="{ background: item.color }"
                                ></span>
                                <span class="legend-label">{{
                                    item.label
                                }}</span>
                                <span class="legend-value">{{
                                    item.value
                                }}</span>
                                <span class="legend-pct">{{ item.pct }}%</span>
                            </div>
                        </div>
                    </div>

                    <!-- Mini breakdown bars -->
                    <div class="status-breakdown">
                        <div
                            v-for="item in statusChartData"
                            :key="item.label"
                            class="breakdown-item"
                        >
                            <div class="breakdown-bar-wrap">
                                <div
                                    class="breakdown-bar"
                                    :style="{
                                        width: item.pct + '%',
                                        background: item.color,
                                    }"
                                ></div>
                            </div>
                            <span class="breakdown-info">
                                <span>{{ item.label }}</span>
                                <strong>{{ item.value }}</strong>
                            </span>
                        </div>
                    </div>
                </n-card>

                <!-- Bar Chart -->
                <n-card
                    class="chart-card chart-card--wide"
                    title="Progres per Program Kerja"
                >
                    <div v-if="barChartData.length === 0" class="chart-empty">
                        <n-empty description="Belum ada data program kerja" />
                    </div>
                    <div v-else class="bar-chart">
                        <div
                            v-for="(item, i) in barChartData"
                            :key="i"
                            class="bar-row"
                        >
                            <n-tooltip placement="top">
                                <template #trigger>
                                    <div class="bar-label">{{ item.name }}</div>
                                </template>
                                <div style="max-width: 260px">
                                    <div>
                                        <strong>{{ item.fullName }}</strong>
                                    </div>
                                    <div>
                                        Penanggung Jawab: {{ item.responsible }}
                                    </div>
                                    <div>
                                        Selesai: {{ item.doneTasks }} /
                                        {{ item.totalTasks }} tugas
                                    </div>
                                </div>
                            </n-tooltip>
                            <div class="bar-track">
                                <div
                                    class="bar-fill"
                                    :style="{
                                        width: item.progress + '%',
                                        background: item.color,
                                    }"
                                >
                                    <span
                                        v-if="item.progress >= 15"
                                        class="bar-pct-inside"
                                    >
                                        {{ item.progress }}%
                                    </span>
                                </div>
                                <span
                                    v-if="item.progress < 15"
                                    class="bar-pct-outside"
                                >
                                    {{ item.progress }}%
                                </span>
                            </div>
                            <div class="bar-meta">
                                <n-tag
                                    size="tiny"
                                    :type="
                                        item.doneTasks === item.totalTasks &&
                                        item.totalTasks > 0
                                            ? 'success'
                                            : 'default'
                                    "
                                >
                                    {{ item.doneTasks }}/{{ item.totalTasks }}
                                </n-tag>
                            </div>
                        </div>
                    </div>
                </n-card>
            </div>

            <!-- ── Deadline Warning ────────────────────────────────────────── -->
            <n-card
                v-if="dashboard.upcomingTasks.length > 0"
                class="section-card"
            >
                <template #header>
                    <div class="card-header-custom">
                        <span class="card-header-icon">⏰</span>
                        <span>Kegiatan Mendekati / Melewati Deadline</span>
                        <n-badge
                            :value="dashboard.upcomingTasks.length"
                            type="error"
                            style="margin-left: 8px"
                        />
                    </div>
                </template>

                <!-- Overdue Alert -->
                <n-alert
                    v-if="dashboard.upcomingTasks.some((t) => t.daysLeft < 0)"
                    type="error"
                    :bordered="false"
                    style="margin-bottom: 12px"
                >
                    Terdapat
                    <strong>{{
                        dashboard.upcomingTasks.filter((t) => t.daysLeft < 0)
                            .length
                    }}</strong>
                    kegiatan yang telah melewati batas waktu!
                </n-alert>

                <n-data-table
                    :columns="upcomingColumns"
                    :data="dashboard.upcomingTasks"
                    :scroll-x="900"
                    size="small"
                    striped
                    :row-class-name="
                        (row) =>
                            row.daysLeft < 0
                                ? 'row-overdue'
                                : row.daysLeft <= 3
                                  ? 'row-urgent'
                                  : ''
                    "
                />
            </n-card>

            <!-- ── No upcoming tasks ───────────────────────────────────────── -->
            <n-alert
                v-else
                type="success"
                :bordered="false"
                class="section-card"
            >
                🎉 Tidak ada kegiatan yang mendekati atau melewati deadline
                dalam 30 hari ke depan.
            </n-alert>

            <!-- ── Program Status Summary ──────────────────────────────────── -->
            <n-card class="section-card">
                <template #header>
                    <div class="card-header-custom">
                        <span class="card-header-icon">📈</span>
                        <span>Rekapitulasi Status per Program</span>
                    </div>
                </template>

                <div v-if="dashboard.programStatusSummary.length === 0">
                    <n-empty description="Belum ada data kegiatan" />
                </div>
                <div v-else>
                    <!-- Visual summary cards -->
                    <div class="summary-cards">
                        <div
                            v-for="prog in dashboard.programStatusSummary"
                            :key="prog.programId"
                            class="prog-summary-card"
                        >
                            <div class="prog-summary-name">
                                {{ prog.programName ?? "–" }}
                            </div>
                            <div class="prog-summary-bar-group">
                                <template v-if="prog.done > 0">
                                    <n-tooltip content="Selesai" placement="top">
                                        <template #trigger>
                                            <div
                                                class="prog-seg"
                                                :style="{
                                                    flex: prog.done || 0,
                                                    background: STATUS_COLOR.done,
                                                }"
                                            >
                                                {{ prog.done }}
                                            </div>
                                        </template>
                                        Selesai: {{ prog.done }}
                                    </n-tooltip>
                                </template>
                                <template v-if="prog.onProgress > 0">
                                    <n-tooltip content="Berjalan" placement="top">
                                        <template #trigger>
                                            <div
                                                class="prog-seg"
                                                :style="{
                                                    flex: prog.onProgress || 0,
                                                    background: STATUS_COLOR.on_progress,
                                                }"
                                            >
                                                {{ prog.onProgress }}
                                            </div>
                                        </template>
                                        Berjalan: {{ prog.onProgress }}
                                    </n-tooltip>
                                </template>
                                <template v-if="prog.planned > 0">
                                    <n-tooltip content="Direncanakan" placement="top">
                                        <template #trigger>
                                            <div
                                                class="prog-seg"
                                                :style="{
                                                    flex: prog.planned || 0,
                                                    background: STATUS_COLOR.planned,
                                                }"
                                            >
                                                {{ prog.planned }}
                                            </div>
                                        </template>
                                        Direncanakan: {{ prog.planned }}
                                    </n-tooltip>
                                </template>
                                <template v-if="prog.postponed > 0">
                                    <n-tooltip content="Ditunda" placement="top">
                                        <template #trigger>
                                            <div
                                                class="prog-seg"
                                                :style="{
                                                    flex: prog.postponed || 0,
                                                    background: STATUS_COLOR.postponed,
                                                }"
                                            >
                                                {{ prog.postponed }}
                                            </div>
                                        </template>
                                        Ditunda: {{ prog.postponed }}
                                    </n-tooltip>
                                </template>
                            </div>
                            <div class="prog-summary-footer">
                                <span>{{ prog.total }} kegiatan</span>
                                <n-tag
                                    size="tiny"
                                    :type="
                                        prog.total > 0 &&
                                        prog.done === prog.total
                                            ? 'success'
                                            : 'default'
                                    "
                                >
                                    {{
                                        prog.total > 0
                                            ? Math.round(
                                                  (prog.done / prog.total) *
                                                      100,
                                              )
                                            : 0
                                    }}% selesai
                                </n-tag>
                            </div>
                        </div>
                    </div>

                    <!-- Detail table -->
                    <n-divider style="margin: 20px 0 14px">
                        <n-text depth="3" style="font-size: 12px"
                            >Detail Tabel</n-text
                        >
                    </n-divider>
                    <n-data-table
                        :columns="summaryColumns"
                        :data="dashboard.programStatusSummary"
                        :scroll-x="900"
                        size="small"
                        striped
                    />
                </div>
            </n-card>
        </template>

        <!-- ── Empty State ─────────────────────────────────────────────────── -->
        <div v-else-if="!loading" class="empty-state">
            <n-empty
                description="Tidak ada data program kerja untuk tahun yang dipilih"
            >
                <template #extra>
                    <n-button @click="reload">Coba Lagi</n-button>
                </template>
            </n-empty>
        </div>
    </div>
</template>

<script src="./WorkProgramDashboard.ts" />

<style scoped>
/* ── Root ──────────────────────────────────────────────────────────────────── */
.dashboard-root {
    padding: 0 0 32px;
    display: flex;
    flex-direction: column;
    gap: 20px;
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

/* ── Skeleton ──────────────────────────────────────────────────────────────── */
.skeleton-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

/* ── Stat Cards ────────────────────────────────────────────────────────────── */
.stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

.stat-card {
    position: relative;
    border-radius: 14px;
    padding: 20px 20px 16px;
    color: #fff;
    overflow: hidden;
    display: flex;
    align-items: flex-start;
    gap: 14px;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12);
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
}
.stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
}

.stat-card--blue {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}
.stat-card--purple {
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
}
.stat-card--green {
    background: linear-gradient(135deg, #22c55e, #15803d);
}
.stat-card--teal {
    background: linear-gradient(135deg, #06b6d4, #0e7490);
}

.stat-card__icon {
    font-size: 1.7rem;
    flex-shrink: 0;
    padding-top: 2px;
}

.stat-card__body {
    flex: 1;
    z-index: 1;
}

.stat-card__value {
    font-size: 2rem;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.5px;
}

.stat-card__label {
    font-size: 0.78rem;
    margin-top: 4px;
    opacity: 0.88;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.stat-card__sub {
    font-size: 0.72rem;
    margin-top: 5px;
    opacity: 0.75;
}

.stat-card__bg {
    position: absolute;
    right: -8px;
    bottom: -12px;
    font-size: 5rem;
    opacity: 0.1;
    pointer-events: none;
    user-select: none;
}

/* ── Charts Row ────────────────────────────────────────────────────────────── */
.charts-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 16px;
    align-items: start;
}

.chart-card {
    border-radius: 12px;
}

.chart-card--wide {
    min-width: 0;
}

/* Donut */
.donut-wrapper {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
}

.donut-svg {
    width: 180px;
    height: 180px;
    flex-shrink: 0;
}

.donut-center-value {
    font-size: 26px;
    font-weight: 800;
    fill: currentColor;
}

.donut-center-label {
    font-size: 11px;
    fill: currentColor;
    opacity: 0.6;
}

.donut-legend {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 140px;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.82rem;
}

.legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
}

.legend-label {
    flex: 1;
    opacity: 0.85;
}

.legend-value {
    font-weight: 700;
    font-size: 0.88rem;
}

.legend-pct {
    opacity: 0.55;
    font-size: 0.78rem;
    min-width: 32px;
    text-align: right;
}

.status-breakdown {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.breakdown-item {
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.breakdown-bar-wrap {
    height: 8px;
    background: var(--n-border-color, #e5e7eb);
    border-radius: 4px;
    overflow: hidden;
}

.breakdown-bar {
    height: 100%;
    border-radius: 4px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 2px;
}

.breakdown-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    opacity: 0.75;
}

/* Bar chart */
.bar-chart {
    display: flex;
    flex-direction: column;
    gap: 13px;
    padding: 4px 0;
}

.bar-row {
    display: grid;
    grid-template-columns: 200px 1fr 52px;
    align-items: center;
    gap: 10px;
}

.bar-label {
    font-size: 0.8rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: 0.85;
    cursor: default;
}

.bar-track {
    position: relative;
    height: 24px;
    background: var(--n-border-color, #e5e7eb);
    border-radius: 6px;
    overflow: visible;
    display: flex;
    align-items: center;
}

.bar-fill {
    height: 100%;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 6px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 0;
    position: relative;
}

.bar-pct-inside {
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    white-space: nowrap;
}

.bar-pct-outside {
    position: absolute;
    left: calc(100% + 6px);
    font-size: 0.72rem;
    font-weight: 700;
    white-space: nowrap;
    opacity: 0.75;
}

.bar-meta {
    display: flex;
    justify-content: flex-end;
}

.chart-empty {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 180px;
}

/* ── Section Cards ─────────────────────────────────────────────────────────── */
.section-card {
    border-radius: 12px;
}

.card-header-custom {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 0.95rem;
}

.card-header-icon {
    font-size: 1.1rem;
}

/* ── Program Summary Cards ─────────────────────────────────────────────────── */
.summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px;
    margin-bottom: 4px;
}

.prog-summary-card {
    border: 1px solid var(--n-border-color, #e5e7eb);
    border-radius: 10px;
    padding: 14px;
    transition: box-shadow 0.2s ease;
}

.prog-summary-card:hover {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

.prog-summary-name {
    font-size: 0.82rem;
    font-weight: 600;
    margin-bottom: 10px;
    line-height: 1.3;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    min-height: 2.2em;
}

.prog-summary-bar-group {
    display: flex;
    height: 22px;
    border-radius: 6px;
    overflow: hidden;
    gap: 2px;
}

.prog-seg {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65rem;
    font-weight: 700;
    color: #fff;
    border-radius: 4px;
    transition: flex 0.6s ease;
    min-width: 20px;
}

.prog-summary-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
    font-size: 0.72rem;
    opacity: 0.65;
}

/* ── Empty State ───────────────────────────────────────────────────────────── */
.empty-state {
    display: flex;
    justify-content: center;
    padding: 60px 0;
}

/* ── Row Overdue / Urgent ──────────────────────────────────────────────────── */
:deep(.row-overdue td) {
    background: rgba(239, 68, 68, 0.06) !important;
}

:deep(.row-urgent td) {
    background: rgba(245, 158, 11, 0.06) !important;
}

/* ── Responsive ────────────────────────────────────────────────────────────── */
@media (max-width: 1100px) {
    .charts-grid {
        grid-template-columns: 1fr;
    }
    .bar-row {
        grid-template-columns: 160px 1fr 48px;
    }
}

@media (max-width: 768px) {
    .stat-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .skeleton-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .bar-row {
        grid-template-columns: 120px 1fr 40px;
    }
    .bar-label {
        font-size: 0.72rem;
    }
    .stat-card__value {
        font-size: 1.6rem;
    }
}

@media (max-width: 480px) {
    .stat-grid {
        grid-template-columns: 1fr 1fr;
    }
    .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
    }
    .donut-wrapper {
        flex-direction: column;
        align-items: center;
    }
}
</style>
