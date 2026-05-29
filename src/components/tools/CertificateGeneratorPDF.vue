<template>
    <div class="container">
        <n-card title="Generator Sertifikat PDF">
            <n-space vertical size="large">
                <!-- Upload PDF -->
                <div>
                    <div class="label">Template PDF</div>

                    <n-upload
                        :max="1"
                        accept=".pdf"
                        :show-file-list="true"
                        @change="handlePdfUpload"
                    >
                        <n-button type="primary"> Upload PDF </n-button>
                    </n-upload>
                </div>

                <!-- Upload Excel -->
                <div>
                    <div class="label">Data Peserta Excel</div>

                    <n-upload
                        :max="1"
                        accept=".xlsx,.xls"
                        :show-file-list="true"
                        @change="handleExcelUpload"
                    >
                        <n-button type="info"> Upload Excel </n-button>
                    </n-upload>
                </div>

                <!-- Setting untuk Nama -->
                <n-divider>Pengaturan Nama Peserta</n-divider>
                <n-grid :cols="4" :x-gap="12">
                    <n-grid-item>
                        <n-input-number
                            v-model:value="config.name.x"
                            placeholder="Posisi X"
                            style="width: 100%"
                        />
                    </n-grid-item>

                    <n-grid-item>
                        <n-input-number
                            v-model:value="config.name.y"
                            placeholder="Posisi Y"
                            style="width: 100%"
                        />
                    </n-grid-item>

                    <n-grid-item>
                        <n-input-number
                            v-model:value="config.name.size"
                            placeholder="Font Size"
                            style="width: 100%"
                        />
                    </n-grid-item>

                    <n-grid-item>
                        <n-input
                            v-model:value="previewName"
                            placeholder="Preview Nama"
                        />
                    </n-grid-item>
                </n-grid>

                <!-- Setting untuk Nomor Sertifikat -->
                <n-divider>Pengaturan Nomor Sertifikat</n-divider>
                <n-grid :cols="4" :x-gap="12">
                    <n-grid-item>
                        <n-input-number
                            v-model:value="config.certNumber.x"
                            placeholder="Posisi X"
                            style="width: 100%"
                        />
                    </n-grid-item>

                    <n-grid-item>
                        <n-input-number
                            v-model:value="config.certNumber.y"
                            placeholder="Posisi Y"
                            style="width: 100%"
                        />
                    </n-grid-item>

                    <n-grid-item>
                        <n-input-number
                            v-model:value="config.certNumber.size"
                            placeholder="Font Size"
                            style="width: 100%"
                        />
                    </n-grid-item>

                    <n-grid-item>
                        <n-input
                            v-model:value="previewCertNumber"
                            placeholder="Preview No Sertifikat"
                        />
                    </n-grid-item>
                </n-grid>

                <!-- Preview -->
                <div class="preview">
                    <div class="pdf-wrapper">
                        <canvas ref="pdfCanvas"></canvas>

                        <!-- LIVE PREVIEW NAMA -->
                        <div
                            class="preview-text name-text"
                            :style="{
                                left: `${config.name.x}px`,
                                top: `${config.name.y}px`,
                                fontSize: `${config.name.size}px`,
                            }"
                        >
                            {{ previewName }}
                        </div>

                        <!-- LIVE PREVIEW NOMOR SERTIFIKAT -->
                        <div
                            class="preview-text cert-text"
                            :style="{
                                left: `${config.certNumber.x}px`,
                                top: `${config.certNumber.y}px`,
                                fontSize: `${config.certNumber.size}px`,
                            }"
                        >
                            {{ previewCertNumber }}
                        </div>
                    </div>
                </div>

                <!-- Info -->
                <n-alert v-if="participants.length" type="success">
                    {{ participants.length }}
                    peserta berhasil dimuat
                </n-alert>

                <!-- Generate -->
                <n-button
                    type="success"
                    size="large"
                    block
                    :loading="loading"
                    :disabled="!pdfFile || participants.length === 0"
                    @click="generateAllCertificates"
                >
                    Generate Sertifikat ZIP
                </n-button>
            </n-space>
        </n-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from "vue";

import * as XLSX from "xlsx";

import JSZip from "jszip";

import { saveAs } from "file-saver";

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// -----------------------------------------------------
// STATE
// -----------------------------------------------------

const pdfFile = ref<File | null>(null);

const participants = ref<any[]>([]);

const loading = ref(false);

const pdfCanvas = ref<HTMLCanvasElement | null>(null);

const previewName = ref("Nama Peserta");

const previewCertNumber = ref("No. Sertifikat");

const pdfScale = ref(1);

// Update konfigurasi untuk mendukung nama dan nomor sertifikat
const config = reactive({
    name: {
        x: 420,
        y: 210,
        size: 18,
    },
    certNumber: {
        x: 420,
        y: 125,
        size: 16,
    },
});

// -----------------------------------------------------
// PDF UPLOAD
// -----------------------------------------------------

const handlePdfUpload = async ({ file }: any) => {
    pdfFile.value = file.file;

    await nextTick();

    renderPdfPreview();
};

// -----------------------------------------------------
// EXCEL UPLOAD
// -----------------------------------------------------

const handleExcelUpload = async ({ file }: any) => {
    const buffer = await file.file.arrayBuffer();

    const workbook = XLSX.read(buffer);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    participants.value = XLSX.utils.sheet_to_json(sheet);

    if (participants.value.length > 0) {
        // Mendukung berbagai kemungkinan nama kolom
        const namaColumn =
            participants.value[0].nama ||
            participants.value[0].Nama ||
            participants.value[0].NAME ||
            participants.value[0].NamaLengkap ||
            "";

        const certNumberColumn =
            participants.value[0].no_sertifikat ||
            participants.value[0].NoSertifikat ||
            participants.value[0].CERT_NUMBER ||
            participants.value[0].noSertifikat ||
            participants.value[0]["No Sertifikat"] ||
            "";

        previewName.value = namaColumn || "Nama Peserta";
        previewCertNumber.value = certNumberColumn || "No. Sertifikat";
    }
};

// -----------------------------------------------------
// PDF PREVIEW
// -----------------------------------------------------

const renderPdfPreview = async () => {
    if (!pdfFile.value || !pdfCanvas.value) return;

    const bytes = await pdfFile.value.arrayBuffer();

    const loadingTask = pdfjsLib.getDocument({
        data: bytes,
    });

    const pdf = await loadingTask.promise;

    const page = await pdf.getPage(1);

    const viewport = page.getViewport({
        scale: 1.0,
    });

    pdfScale.value = viewport.scale;

    const canvas = pdfCanvas.value;

    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = viewport.width;

    canvas.height = viewport.height;

    await page.render({
        canvasContext: context,
        viewport,
    }).promise;
};

// -----------------------------------------------------
// GENERATE SINGLE PDF
// -----------------------------------------------------

const generatePdf = async (participant: any) => {
    if (!pdfFile.value) return null;

    const templateBytes = await pdfFile.value.arrayBuffer();

    const pdfDoc = await PDFDocument.load(templateBytes);

    const page = pdfDoc.getPages()[0];

    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // -------------------------------------------
    // SANITIZE NAMA
    // -------------------------------------------
    const namaText = String(
        participant.nama ||
            participant.Nama ||
            participant.NAME ||
            participant.NamaLengkap ||
            "",
    )
        .replace(/[\r\n]+/g, " ")
        .trim();

    const namaWidth = boldFont.widthOfTextAtSize(namaText, config.name.size);

    // ----------------------------------
    // CENTER POINT UNTUK NAMA
    // ----------------------------------
    const namaX = config.name.x / pdfScale.value;
    const namaY = page.getHeight() - config.name.y / pdfScale.value;

    // ----------------------------------
    // DRAW NAMA TEXT
    // ----------------------------------
    if (namaText) {
        page.drawText(namaText, {
            x: namaX - namaWidth / 2,
            y: namaY - config.name.size / 2,
            size: config.name.size,
            font: boldFont,
            color: rgb(0, 0, 0),
        });
    }

    // -------------------------------------------
    // SANITIZE NOMOR SERTIFIKAT
    // -------------------------------------------
    const certNumberText = String(
        participant.no_sertifikat ||
            participant.NoSertifikat ||
            participant.CERT_NUMBER ||
            participant.noSertifikat ||
            participant["No Sertifikat"] ||
            "",
    )
        .replace(/[\r\n]+/g, " ")
        .trim();

    const certNumberWidth = normalFont.widthOfTextAtSize(
        certNumberText,
        config.certNumber.size,
    );

    // ----------------------------------
    // CENTER POINT UNTUK NOMOR SERTIFIKAT
    // ----------------------------------
    const certNumberX = config.certNumber.x / pdfScale.value;
    const certNumberY = page.getHeight() - config.certNumber.y / pdfScale.value;

    // ----------------------------------
    // DRAW NOMOR SERTIFIKAT TEXT
    // ----------------------------------
    if (certNumberText) {
        page.drawText(certNumberText, {
            x: certNumberX - certNumberWidth / 2,
            y: certNumberY - config.certNumber.size / 2,
            size: config.certNumber.size,
            font: normalFont,
            color: rgb(0, 0, 0),
        });
    }

    return await pdfDoc.save();
};

// -----------------------------------------------------
// GENERATE ALL PDF
// -----------------------------------------------------

const generateAllCertificates = async () => {
    loading.value = true;

    try {
        const zip = new JSZip();

        for (const participant of participants.value) {
            const pdfBytes = await generatePdf(participant);

            if (!pdfBytes) continue;

            // Menggunakan nama file yang aman (menghindari karakter ilegal)
            const namaFile = (
                participant.nama ||
                participant.Nama ||
                participant.NAME ||
                "peserta"
            )
                .replace(/[/\\?%*:|"<>]/g, "-")
                .trim();

            zip.file(`${namaFile}.pdf`, pdfBytes);
        }

        const blob = await zip.generateAsync({
            type: "blob",
        });

        saveAs(blob, "sertifikat.zip");
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.container {
    max-width: 1000px;
    margin: 40px auto;
    padding: 16px;
}

.label {
    font-weight: 600;
    margin-bottom: 8px;
}

.preview {
    border: 1px solid #ddd;
    border-radius: 12px;
    overflow: auto;
    background: #fafafa;
    padding: 16px;
}

.pdf-wrapper {
    position: relative;
    display: inline-block;
}

.preview-text {
    position: absolute;
    transform: translate(-50%, -50%);
    font-weight: bold;
    color: black;
    white-space: nowrap;
    pointer-events: none;
    text-align: center;
    line-height: 1;
}

/* Gaya khusus untuk nomor sertifikat di preview */
.preview-text.cert-text {
    font-weight: normal;
}

canvas {
    display: block;
    max-width: 100%;
}
</style>
