<template>
    <n-card :bordered="true" size="small" style="margin-bottom: 16px">
        <!-- HEADER -->
        <n-space
            align="center"
            justify="space-between"
            style="margin-bottom: 14px; flex-wrap: wrap; gap: 8px"
        >
            <span style="font-weight: 700; font-size: 15px">
                📊 Ringkasan Kehadiran
            </span>

            <n-space :size="8">
                <n-select
                    v-model:value="filter.year"
                    :options="generalOptions.year"
                    style="width: 90px"
                    size="small"
                    @update:value="handleFilterChange"
                />

                <n-select
                    v-model:value="filter.month"
                    :options="generalOptions.month"
                    style="width: 130px"
                    size="small"
                    @update:value="handleFilterChange"
                />

                <n-button
                    size="small"
                    :loading="loading"
                    @click="handleFilterChange"
                >
                    Tampilkan
                </n-button>
            </n-space>
        </n-space>

        <!-- LOADING -->
        <template v-if="loading">
            <n-skeleton height="70px" />
            <n-skeleton height="120px" />
        </template>

        <!-- DATA -->
        <template v-else-if="summary">
            <!-- KPI CARD -->
            <div style="margin-bottom: 16px">
                <div style="display: flex; flex-wrap: wrap; gap: 8px">
                    <!-- Hari Kerja -->
                    <div
                        :style="{
                            flex: '1 1 90px',
                            minWidth: '80px',
                            background: '#f6ffed',
                            borderLeft: '4px solid #52c41a',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            textAlign: 'center',
                        }"
                    >
                        <div
                            style="
                                font-size: 24px;
                                font-weight: 800;
                                color: #389e0d;
                            "
                        >
                            {{ summary?.total_workday ?? 0 }}
                        </div>
                        <div style="font-size: 11px; margin-top: 4px">
                            Hari Kerja
                        </div>
                    </div>

                    <!-- Hadir -->
                    <div
                        :style="{
                            flex: '1 1 90px',
                            minWidth: '80px',
                            background: '#e6f7ff',
                            borderLeft: '4px solid #1890ff',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            textAlign: 'center',
                        }"
                    >
                        <div
                            style="
                                font-size: 24px;
                                font-weight: 800;
                                color: #096dd9;
                            "
                        >
                            {{ summary?.total_present ?? 0 }}
                        </div>
                        <div style="font-size: 11px; margin-top: 4px">
                            Hadir
                        </div>
                    </div>
                </div>
            </div>

            <!-- ── Ringkasan Pelanggaran ─────────────────────────────── -->
            <div style="margin-bottom: 16px">
                <div
                    style="
                        font-size: 12px;
                        font-weight: 600;
                        color: #888;
                        letter-spacing: 0.5px;
                        margin-bottom: 8px;
                        text-transform: uppercase;
                    "
                >
                    ⚠️ Pelanggaran Kehadiran
                </div>

                <div style="display: flex; gap: 10px; flex-wrap: wrap">
                    <!-- Tidak Check-in -->
                    <div :style="cardStyle(summary?.total_no_checkin)">
                        <div :style="numberStyle(summary?.total_no_checkin)">
                            {{ summary?.total_no_checkin ?? 0 }}
                        </div>
                        <div>
                            <div style="font-size: 11px; margin-top: 4px">
                                Tidak Check-in
                            </div>
                        </div>
                    </div>

                    <!-- Tidak Check-out -->
                    <div :style="cardStyle(summary?.total_no_checkout)">
                        <div :style="numberStyle(summary?.total_no_checkout)">
                            {{ summary?.total_no_checkout ?? 0 }}
                        </div>
                        <div>
                            <div style="font-size: 11px; margin-top: 4px">
                                Tidak Check-out
                            </div>
                        </div>
                    </div>

                    <!-- Total Keterlambatan -->
                    <div
                        :style="warningCardStyle(summary?.total_late_duration)"
                    >
                        <div
                            :style="
                                warningNumberStyle(summary?.total_late_duration)
                            "
                        >
                            {{
                                formatMinutes(summary?.total_late_duration ?? 0)
                            }}
                        </div>
                        <div>
                            <div style="font-size: 11px; margin-top: 4px">
                                ⏰ Total Keterlambatan
                            </div>
                        </div>
                    </div>

                    <!-- Total Pulang Awal -->
                    <div
                        :style="
                            earlyCardStyle(summary?.total_early_leave_duration)
                        "
                    >
                        <div
                            :style="
                                earlyNumberStyle(
                                    summary?.total_early_leave_duration,
                                )
                            "
                        >
                            {{
                                formatMinutes(
                                    summary?.total_early_leave_duration ?? 0,
                                )
                            }}
                        </div>
                        <div>
                            <div style="font-size: 11px; margin-top: 4px">
                                🏃 Total Pulang Awal
                            </div>
                        </div>
                    </div>

                    <!-- Alpha -->
                    <div :style="alphaCardStyle(summary?.total_alpha)">
                        <div :style="alphaNumberStyle(summary?.total_alpha)">
                            {{ summary?.total_alpha ?? 0 }}
                        </div>
                        <div>
                            <div
                                style="
                                    color: #ffff;
                                    font-size: 11px;
                                    margin-top: 4px;
                                "
                            >
                                Alpha
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SCORE -->
            <n-divider />

            <div style="display: flex; justify-content: space-between">
                <div>
                    Attendance Rate :
                    <b>{{ summary.attendance_rate }}%</b>
                </div>

                <div>
                    Discipline Score :
                    <b>{{ summary.discipline_score }}</b>
                </div>
            </div>
        </template>

        <!-- EMPTY -->
        <template v-else>
            <n-empty description="Tidak ada data kehadiran" />
        </template>
    </n-card>
</template>

<script src="./AttendanceSummary.ts" />
