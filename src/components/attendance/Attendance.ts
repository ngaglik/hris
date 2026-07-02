import { defineComponent, ref, onMounted, onBeforeUnmount, h } from "vue";

import { useMessage, useDialog } from "naive-ui";

import * as faceapi from "@vladmandic/face-api";

import { getAuthData, logout } from "@/services/authService";

import { apiFetch } from "@/services/apiClient";

import { Config } from "@/constant/config";

import Checklog from "./Checklog.vue";
import Schedule from "./Schedule.vue";
import AttendanceSummary from "./AttendanceSummary.vue";
import PersonalAttendanceReport from "./PersonalAttendanceReport.vue";

import { can, setPermissions } from "@/services/authPermission";

import {
  CalendarOutline,
  TimeOutline,
  BarChartOutline,
  LogInOutline,
  LogOutOutline,
} from "@vicons/ionicons5";

export default defineComponent({
  components: {
    Checklog,
    Schedule,
    AttendanceSummary,
    PersonalAttendanceReport,
    CalendarOutline,
    TimeOutline,
    BarChartOutline,
    LogInOutline,
    LogOutOutline,
  },

  setup() {
    // =====================================
    // MESSAGE
    // =====================================
    const message = useMessage();

    const dialog = useDialog();

    const showFaceGuide = () => {
      dialog.info({
        title: "Panduan Register Wajah",
        positiveText: "Lanjutkan",
        closable: false,
        maskClosable: false,

        content: () =>
          h("div", [
            h(
              "p",
              {
                style: "margin-bottom: 12px",
              },
              "Pastikan wajah terlihat jelas, tunggal, posisi sesuai dan pencahayaan cukup.",
            ),

            h("img", {
              src: "/face-position.png",
              style: `
                            width: 280px;
                            display: block;
                            margin: 0 auto 12px auto;
                        `,
            }),

            h(
              "small",
              {
                style: "color: #ff0000",
              },
              "Sistem tidak menyimpan foto Anda, hanya algoritma saja yang bisa berbeda di setiap aplikasi pengenal wajah.",
            ),
          ]),

        onPositiveClick: () => {
          openRegisterFaceModal();
        },
      });
    };

    // =====================================
    // AUTH
    // =====================================
    const auth = getAuthData();

    if (!auth) {
      logout();
    }

    const employeeId = auth?.employee?.id ?? 0;
    const personId = auth?.employee?.personId ?? 0;
    const categoryId = auth?.employee?.categoryId ?? 0;
    const orgId = auth?.employee?.orgId ?? "-";
    //message.create(employeeId);
    setPermissions(auth?.employee?.privilege ?? []);

    // =====================================
    // LOADING
    // =====================================
    const loadingCheckIn = ref(false);

    const loadingCheckOut = ref(false);

    const faceLoading = ref(false);

    const registerFaceLoading = ref(false);

    // =====================================
    // FACE STATUS
    // =====================================
    const hasFaceRegistered = ref(false);

    const faceRecognition = ref(true);
    // =====================================
    // ATTENDANCE
    // =====================================
    const attendanceSummaryKey = ref(0);

    const attendanceMode = ref<number>(1);

    var msgGreeting = ref<string>("");
    // =====================================
    // VERIFY FACE MODAL
    // =====================================
    const showFaceModal = ref(false);

    const videoRef = ref<HTMLVideoElement | null>(null);

    let mediaStream: MediaStream | null = null;

    // =====================================
    // REGISTER FACE MODAL
    // =====================================
    const showRegisterFaceModal = ref(false);

    const registerVideoRef = ref<HTMLVideoElement | null>(null);

    let registerMediaStream: MediaStream | null = null;

    // =====================================
    // LOAD MODELS
    // =====================================
    const loadModels = async (): Promise<void> => {
      try {
        const MODEL_URL = "/models";

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),

          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),

          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);

        console.log("✅ Face models loaded");
      } catch (err) {
        console.error(err);

        message.error("Gagal load AI model");
      }
    };

    // =====================================
    // CHECK FACE REGISTRATION
    // =====================================
    const checkFaceRegistration = async (): Promise<void> => {
      try {
        const response = (await apiFetch(
          `${Config.UrlBackend}/api/attendance/check-face/${personId}/${categoryId}/${orgId}`,
        )) as Response;

        if (!response.ok) {
          return;
        }

        const result = await response.json();

        hasFaceRegistered.value = result.registered;
        faceRecognition.value = result.face_recognition;
      } catch (err) {
        console.error(err);
      }
    };

    // =====================================
    // START CAMERA
    // =====================================
    const startCamera = async (): Promise<void> => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
          },

          audio: false,
        });

        if (videoRef.value) {
          videoRef.value.srcObject = mediaStream;
        }
      } catch (err) {
        console.error(err);

        message.error("Tidak dapat mengakses kamera");
      }
    };

    // =====================================
    // STOP CAMERA
    // =====================================
    const stopCamera = (): void => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        mediaStream = null;
      }
    };

    // =====================================
    // START REGISTER CAMERA
    // =====================================
    const startRegisterCamera = async (): Promise<void> => {
      try {
        registerMediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (registerVideoRef.value) {
          registerVideoRef.value.srcObject = registerMediaStream;
        }
      } catch (err) {
        console.error(err);

        message.error("Tidak dapat membuka kamera");
      }
    };

    // =====================================
    // STOP REGISTER CAMERA
    // =====================================
    const stopRegisterCamera = (): void => {
      if (registerMediaStream) {
        registerMediaStream.getTracks().forEach((track) => track.stop());

        registerMediaStream = null;
      }
    };

    // =====================================
    // OPEN VERIFY MODAL
    // =====================================
    const openFaceModal = async (mode: number): Promise<void> => {
      attendanceMode.value = mode;

      showFaceModal.value = true;

      await startCamera();
    };

    // =====================================
    // CLOSE VERIFY MODAL
    // =====================================
    const closeFaceModal = (): void => {
      showFaceModal.value = false;

      stopCamera();
    };

    // =====================================
    // OPEN REGISTER MODAL
    // =====================================
    const openRegisterFaceModal = async (): Promise<void> => {
      showRegisterFaceModal.value = true;
      await startRegisterCamera();
    };

    // =====================================
    // CLOSE REGISTER MODAL
    // =====================================
    const closeRegisterFaceModal = (): void => {
      showRegisterFaceModal.value = false;

      stopRegisterCamera();
    };

    // =====================================
    // INSERT FINGERLOG
    // =====================================
    const insertFingerlog = async (mode: number): Promise<void> => {
      try {
        if (mode === 1) {
          loadingCheckIn.value = true;
        } else {
          loadingCheckOut.value = true;
        }

        const payload = {
          pin: String(employeeId),
          iomode: mode,
        };

        const response = (await apiFetch(
          `${Config.UrlBackend}/api/attendance/fingerlog`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify(payload),
          },
        )) as Response;

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);

          throw new Error(
            errorData?.message ?? `Server error (${response.status})`,
          );
        }

        const result = await response.json();

        message.create(`${result.message} — ${result.last_time_text}`, {
          type: "success",
          duration: 0,
          closable: true,
        });
        msgGreeting.value = result.greeting;
        attendanceSummaryKey.value++;
      } catch (err: any) {
        console.error(err);

        //message.error(err?.message ?? "Gagal mengirim absensi");
        message.create(err?.message ?? "Gagal mengirim absensi", {
          type: "error",
          duration: 0,
          closable: true,
        });
      } finally {
        if (mode === 1) {
          loadingCheckIn.value = false;
        } else {
          loadingCheckOut.value = false;
        }
        closeFaceModal();
      }
    };

    // =====================================
    // VERIFY FACE
    // =====================================
    const verifyFace = async (): Promise<void> => {
      try {
        faceLoading.value = true;

        if (!videoRef.value) {
          message.error("Camera belum siap");

          return;
        }

        const detection = await faceapi
          .detectSingleFace(
            videoRef.value,

            new faceapi.TinyFaceDetectorOptions(),
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection) {
          message.warning("Wajah tidak terdeteksi");

          return;
        }

        const descriptor = Array.from(detection.descriptor);

        const response = (await apiFetch(
          `${Config.UrlBackend}/api/attendance/verify-face`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              personId,
              descriptor,
            }),
          },
        )) as Response;

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);

          throw new Error(errorData?.message ?? "Verifikasi wajah gagal");
        }

        //message.success("Verifikasi wajah berhasil");

        await insertFingerlog(attendanceMode.value);

        closeFaceModal();
      } catch (err: any) {
        console.error(err);

        message.error(err?.message ?? "Face recognition gagal");
      } finally {
        faceLoading.value = false;
        closeFaceModal();
      }
    };

    // =====================================
    // REGISTER FACE
    // =====================================
    const registerFace = async (): Promise<void> => {
      try {
        registerFaceLoading.value = true;

        if (!registerVideoRef.value) {
          message.error("Camera belum siap");

          return;
        }

        const detection = await faceapi
          .detectSingleFace(
            registerVideoRef.value,

            new faceapi.TinyFaceDetectorOptions(),
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection) {
          message.warning("Wajah tidak terdeteksi");

          return;
        }

        const descriptor = Array.from(detection.descriptor);

        const response = (await apiFetch(
          `${Config.UrlBackend}/api/attendance/register-face`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              personId,
              descriptor,
            }),
          },
        )) as Response;

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);

          throw new Error(errorData?.message ?? "Register wajah gagal");
        }

        message.success("Wajah berhasil didaftarkan");

        await checkFaceRegistration();

        closeRegisterFaceModal();
      } catch (err: any) {
        console.error(err);

        message.error(err?.message ?? "Register wajah gagal");
      } finally {
        registerFaceLoading.value = false;
      }
    };

    // =====================================
    // CHECK IN / OUT
    // =====================================
    const CheckIn = (): Promise<void> => handleAttendance(1);
    const CheckOut = (): Promise<void> => handleAttendance(2);

    const handleAttendance = async (mode: number): Promise<void> => {
      if (faceRecognition.value) {
        if (!hasFaceRegistered.value) {
          message.error("Anda belum registrasi wajah");
          openRegisterFaceModal();
          return;
        }
        await openFaceModal(mode);
      } else {
        await insertFingerlog(mode);
      }
    };

    // =====================================
    // LIFECYCLE
    // =====================================
    onMounted(async () => {
      await loadModels();

      await checkFaceRegistration();
    });

    onBeforeUnmount(() => {
      stopCamera();

      stopRegisterCamera();
    });

    // =====================================
    // RETURN
    // =====================================
    return {
      // loading
      loadingCheckIn,
      loadingCheckOut,
      faceLoading,
      registerFaceLoading,

      // attendance
      attendanceSummaryKey,

      // face
      hasFaceRegistered,
      faceRecognition,

      // verify modal
      showFaceModal,
      videoRef,

      // action
      CheckIn,
      CheckOut,
      msgGreeting,
      verifyFace,
      closeFaceModal,

      // register modal
      showRegisterFaceModal,
      registerVideoRef,

      openRegisterFaceModal,
      closeRegisterFaceModal,
      registerFace,
      showFaceGuide,

      // misc
      employeeId,
      personId,
      can,
    };
  },
});
