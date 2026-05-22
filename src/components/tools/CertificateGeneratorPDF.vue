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

                <!-- Setting -->
                <n-grid :cols="4" :x-gap="12">
                    <n-grid-item>
                        <n-input-number
                            v-model:value="config.x"
                            placeholder="Posisi X"
                            style="width: 100%"
                        />
                    </n-grid-item>

                    <n-grid-item>
                        <n-input-number
                            v-model:value="config.y"
                            placeholder="Posisi Y"
                            style="width: 100%"
                        />
                    </n-grid-item>

                    <n-grid-item>
                        <n-input-number
                            v-model:value="config.size"
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

                <!-- Preview -->
                <div class="preview">
                    <div class="pdf-wrapper">
                        <canvas ref="pdfCanvas"></canvas>

                        <!-- LIVE PREVIEW -->
                        <div
                            class="preview-text"
                            :style="{
                                left: `${config.x}px`,
                                top: `${config.y}px`,
                                fontSize: `${config.size}px`,
                            }"
                        >
                            {{ previewName }}
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

const pdfScale = ref(1);

const config = reactive({
    x: 420,
    y: 200,
    size: 28,
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
        previewName.value = participants.value[0].nama || "Nama Peserta";
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

    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // -------------------------------------------
    // TEXT
    // -------------------------------------------

    const text = participant.nama || "";

    const textWidth = font.widthOfTextAtSize(text, config.size);

    // ----------------------------------
    // CENTER POINT
    // config.x = titik tengah horizontal
    // config.y = titik tengah vertical
    // ----------------------------------
    // config.x += 120;
    // config.y += 70;
    const pdfX = config.x / pdfScale.value;

    const pdfY = page.getHeight() - config.y / pdfScale.value;

    // ----------------------------------
    // CENTER ALIGN
    // ----------------------------------

    page.drawText(text, {
        x: pdfX - textWidth / 2,

        // vertical center correction
        y: pdfY - config.size / 2,

        size: config.size,

        font,

        color: rgb(0, 0, 0),
    });

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

            zip.file(`${participant.nama}.pdf`, pdfBytes);
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

canvas {
    display: block;
    max-width: 100%;
}
</style>
