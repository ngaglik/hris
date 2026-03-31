<template>
    <n-card :bordered="true" size="small" style="margin-bottom: 16px">
        <!-- ── Header + Filter ──────────────────────────────────────── -->
        <n-space
            align="center"
            justify="space-between"
            style="margin-bottom: 14px; flex-wrap: wrap; gap: 8px"
        >
            <span style="font-weight: 700; font-size: 15px; color: #333"
                >📊 Ringkasan Kehadiran</span
            >
            <n-space align="center" :size="8">
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

        <!-- ── Skeleton saat loading ────────────────────────────────── -->
        <template v-if="loading">
            <n-skeleton height="70px" :repeat="1" style="margin-bottom: 12px" />
            <n-skeleton height="120px" :repeat="1" />
        </template>

        <template v-else>
            <!-- ── Pengelompokan Tipe Jadwal ─────────────────────────── -->
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
                ></div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px">
                    <div
                        v-for="st in scheduleTypeSummary"
                        :key="st.schedule_type_id"
                        :style="{
                            flex: '1 1 90px',
                            minWidth: '80px',
                            background:
                                scheduleTypeStyle[st.schedule_type_id]?.bg ??
                                '#fafafa',
                            borderLeft: `4px solid ${scheduleTypeStyle[st.schedule_type_id]?.border ?? '#d9d9d9'}`,
                            borderRadius: '6px',
                            padding: '8px 12px',
                            textAlign: 'center',
                            opacity: st.count === 0 ? 0.45 : 1,
                        }"
                    >
                        <div
                            :style="{
                                fontSize: '24px',
                                fontWeight: 800,
                                lineHeight: 1,
                                color:
                                    scheduleTypeStyle[st.schedule_type_id]
                                        ?.color ?? '#595959',
                            }"
                        >
                            {{ st.count }}
                        </div>
                        <div
                            style="
                                font-size: 11px;
                                color: #555;
                                margin-top: 4px;
                                line-height: 1.3;
                                word-break: break-word;
                            "
                        >
                            {{ st.schedule_type_name }}
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
                    <div
                        :style="{
                            flex: '1 1 120px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background:
                                totalNoCheckin > 0 ? '#fff1f0' : '#fafafa',
                            border: `1.5px solid ${totalNoCheckin > 0 ? '#f5222d' : '#e8e8e8'}`,
                            borderRadius: '8px',
                            padding: '10px 16px',
                        }"
                    >
                        <div
                            :style="{
                                fontSize: '26px',
                                fontWeight: 800,
                                color: totalNoCheckin > 0 ? '#cf1322' : '#bbb',
                                minWidth: '36px',
                                textAlign: 'center',
                                lineHeight: 1,
                            }"
                        >
                            {{ totalNoCheckin }}
                        </div>
                        <div>
                            <div
                                style="
                                    font-size: 12px;
                                    font-weight: 600;
                                    color: #333;
                                "
                            >
                                Tidak Check-in
                            </div>
                            <div
                                style="
                                    font-size: 11px;
                                    color: #888;
                                    margin-top: 2px;
                                "
                            >
                                hari tanpa absen masuk
                            </div>
                        </div>
                    </div>

                    <!-- Tidak Check-out -->
                    <div
                        :style="{
                            flex: '1 1 120px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background:
                                totalNoCheckout > 0 ? '#fff1f0' : '#fafafa',
                            border: `1.5px solid ${totalNoCheckout > 0 ? '#f5222d' : '#e8e8e8'}`,
                            borderRadius: '8px',
                            padding: '10px 16px',
                        }"
                    >
                        <div
                            :style="{
                                fontSize: '26px',
                                fontWeight: 800,
                                color: totalNoCheckout > 0 ? '#cf1322' : '#bbb',
                                minWidth: '36px',
                                textAlign: 'center',
                                lineHeight: 1,
                            }"
                        >
                            {{ totalNoCheckout }}
                        </div>
                        <div>
                            <div
                                style="
                                    font-size: 12px;
                                    font-weight: 600;
                                    color: #333;
                                "
                            >
                                Tidak Check-out
                            </div>
                            <div
                                style="
                                    font-size: 11px;
                                    color: #888;
                                    margin-top: 2px;
                                "
                            >
                                hari tanpa absen pulang
                            </div>
                        </div>
                    </div>

                    <!-- Total Keterlambatan -->
                    <div
                        :style="{
                            flex: '1 1 120px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background:
                                totalLateMinutes > 0 ? '#fff7e6' : '#fafafa',
                            border: `1.5px solid ${totalLateMinutes > 0 ? '#fa8c16' : '#e8e8e8'}`,
                            borderRadius: '8px',
                            padding: '10px 16px',
                        }"
                    >
                        <div
                            :style="{
                                fontSize: '22px',
                                fontWeight: 800,
                                color:
                                    totalLateMinutes > 0 ? '#d46b08' : '#bbb',
                                minWidth: '36px',
                                textAlign: 'center',
                                lineHeight: 1,
                            }"
                        >
                            {{ formatMinutes(totalLateMinutes) }}
                        </div>
                        <div>
                            <div
                                style="
                                    font-size: 12px;
                                    font-weight: 600;
                                    color: #333;
                                "
                            >
                                ⏰ Total Keterlambatan
                            </div>
                            <div
                                style="
                                    font-size: 11px;
                                    color: #888;
                                    margin-top: 2px;
                                "
                            >
                                akumulasi menit terlambat masuk
                            </div>
                        </div>
                    </div>

                    <!-- Total Pulang Awal -->
                    <div
                        :style="{
                            flex: '1 1 120px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background:
                                totalEarlyMinutes > 0 ? '#fffbe6' : '#fafafa',
                            border: `1.5px solid ${totalEarlyMinutes > 0 ? '#faad14' : '#e8e8e8'}`,
                            borderRadius: '8px',
                            padding: '10px 16px',
                        }"
                    >
                        <div
                            :style="{
                                fontSize: '22px',
                                fontWeight: 800,
                                color:
                                    totalEarlyMinutes > 0 ? '#d48806' : '#bbb',
                                minWidth: '36px',
                                textAlign: 'center',
                                lineHeight: 1,
                            }"
                        >
                            {{ formatMinutes(totalEarlyMinutes) }}
                        </div>
                        <div>
                            <div
                                style="
                                    font-size: 12px;
                                    font-weight: 600;
                                    color: #333;
                                "
                            >
                                🏃 Total Pulang Awal
                            </div>
                            <div
                                style="
                                    font-size: 11px;
                                    color: #888;
                                    margin-top: 2px;
                                "
                            >
                                akumulasi menit pulang sebelum waktunya
                            </div>
                        </div>
                    </div>

                    <!-- Alpha -->
                    <div
                        :style="{
                            flex: '1 1 120px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: totalAlpha > 0 ? '#2a0000' : '#fafafa',
                            border: `1.5px solid ${totalAlpha > 0 ? '#820014' : '#e8e8e8'}`,
                            borderRadius: '8px',
                            padding: '10px 16px',
                        }"
                    >
                        <div
                            :style="{
                                fontSize: '26px',
                                fontWeight: 800,
                                color: totalAlpha > 0 ? '#fff' : '#bbb',
                                minWidth: '36px',
                                textAlign: 'center',
                                lineHeight: 1,
                            }"
                        >
                            {{ totalAlpha }}
                        </div>
                        <div>
                            <div
                                :style="{
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: totalAlpha > 0 ? '#ffccc7' : '#333',
                                }"
                            >
                                Alpha
                            </div>
                            <div
                                :style="{
                                    fontSize: '11px',
                                    marginTop: '2px',
                                    color: totalAlpha > 0 ? '#ff7875' : '#888',
                                }"
                            >
                                tidak hadir tanpa keterangan
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </n-card>
</template>

<script src="./AttendanceSummary.ts" />
