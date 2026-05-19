<template>
    <div class="center-text">
        <n-card title="Sudahkah Anda klik hari ini?" class="card-container">
            <n-form
                :model="form"
                :rules="rules"
                ref="formRef"
                label-placement="top"
            >
                <n-space horizontal class="btn-group">
                    <n-button
                        type="primary"
                        :loading="loadingCheckIn"
                        block
                        @click="CheckIn"
                    >
                        <template #icon>
                            <n-icon>
                                <LogInOutline />
                            </n-icon>
                        </template>
                        Check In
                    </n-button>

                    <n-button
                        type="warning"
                        :loading="loadingCheckout"
                        block
                        @click="CheckOut"
                    >
                        Check Out
                        <template #icon>
                            <n-icon>
                                <LogOutOutline />
                            </n-icon>
                        </template>
                    </n-button>
                </n-space>
            </n-form>
        </n-card>
    </div>

    <!-- ========================= -->
    <!-- FACE NOT REGISTERED -->
    <!-- ========================= -->
    <n-alert
        v-if="!hasFaceRegistered"
        type="warning"
        style="margin-bottom: 16px"
    >
        Wajah Anda belum terdaftar. Silakan register wajah terlebih dahulu.
    </n-alert>

    <n-button
        v-if="!hasFaceRegistered"
        type="success"
        block
        style="margin-bottom: 16px"
        @click="openRegisterFaceModal"
    >
        Register Wajah
    </n-button>

    <!-- ========================= -->
    <!-- REGISTER FACE MODAL -->
    <!-- ========================= -->
    <n-modal
        v-model:show="showRegisterFaceModal"
        preset="card"
        title="Register Wajah"
        style="width: 400px"
    >
        <div class="camera-wrapper">
            <video
                ref="registerVideoRef"
                autoplay
                muted
                playsinline
                width="100%"
            />
        </div>
        <!-- Assist Portrait -->
        <div class="face-guide">
            <div class="face-oval"></div>
        </div>

        <n-alert type="info" style="margin-top: 16px">
            Pastikan wajah terlihat jelas dan pencahayaan cukup.
            <p>
                <small style="color: #ff0000"
                    >Sistem tidak menyimpan foto Anda, hanya algoritma yang bisa
                    berbeda di setiap aplikasi pengenal wajah.
                </small>
            </p>
        </n-alert>

        <n-space justify="end" style="margin-top: 16px">
            <n-button @click="closeRegisterFaceModal"> Batal </n-button>

            <n-button
                type="primary"
                :loading="registerFaceLoading"
                @click="registerFace"
            >
                Simpan Wajah
            </n-button>
        </n-space>
    </n-modal>

    <!-- ========================= -->
    <!-- VERIFY FACE MODAL -->
    <!-- ========================= -->
    <n-modal
        v-model:show="showFaceModal"
        preset="card"
        title="Verifikasi Wajah"
        style="width: 400px"
    >
        <div class="camera-wrapper">
            <video ref="videoRef" autoplay muted playsinline width="100%" />
        </div>
        <!-- Assist Portrait -->
        <div class="face-guide">
            <div class="face-oval"></div>
        </div>
        <n-alert type="info" style="margin-top: 16px">
            Pastikan wajah terlihat jelas dan pencahayaan cukup.
        </n-alert>

        <n-space justify="end" style="margin-top: 16px">
            <n-button @click="closeFaceModal"> Batal </n-button>

            <n-button type="primary" :loading="faceLoading" @click="verifyFace">
                Verifikasi Wajah
            </n-button>
        </n-space>
    </n-modal>

    <AttendanceSummary :key="attendanceSummaryKey" />

    <n-tabs type="card" animated>
        <n-tab-pane name="schedule">
            <template #tab>
                <n-space align="center">
                    <n-icon><CalendarOutline /></n-icon>
                    Jadwal
                </n-space>
            </template>

            <Schedule :employeeId="employeeId" />
        </n-tab-pane>

        <n-tab-pane name="checklog">
            <template #tab>
                <n-space align="center">
                    <n-icon><TimeOutline /></n-icon>
                    Checklog
                </n-space>
            </template>

            <Checklog />
        </n-tab-pane>

        <n-tab-pane name="report">
            <template #tab>
                <n-space align="center">
                    <n-icon><BarChartOutline /></n-icon>
                    Report Kehadiran
                </n-space>
            </template>

            <PersonalAttendanceReport />
        </n-tab-pane>
    </n-tabs>
</template>

<style>
.camera-wrapper {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #ddd;
    background: #000;
}

.camera-wrapper video {
    display: block;
}

/* overlay */
.face-guide {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
}

/* frame wajah */
.face-oval {
    width: 180px;
    height: 240px;
    border: 3px solid #18a058;
    border-radius: 50% / 60%;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.35);
}

/* text assist */
.guide-text {
    position: absolute;
    bottom: 10px;
    color: white;
    font-size: 14px;
    background: rgba(0, 0, 0, 0.5);
    padding: 4px 10px;
    border-radius: 6px;
}
.center-text {
    text-align: center;
}

.login-wrapper {
    display: flex;
    justify-content: center;
    padding: 16px;
}

.card-container {
    width: 100%;
    max-width: 420px;
    margin-bottom: 16px;
    text-align: center; /* pusatkan teks di dalam card */
    display: flex;
    flex-direction: column;
    align-items: center; /* ratakan isi horizontal */
}

.btn-group {
    width: 100%;
    display: flex;
    gap: 8px;
    justify-content: center; /* pusatkan tombol */
}

.btn-group > .n-button {
    width: 100%; /* tetap full width */
}

/* Tabs responsive */
.card-tabs {
    margin-top: 12px;
    padding: 0 8px;
}

/* Optional: layout lebih rapat di mobile */
@media (max-width: 480px) {
    .card-container {
        padding: 8px;
    }

    .card-tabs {
        font-size: 14px;
    }
}
</style>
<script src="./Attendance.ts" />
