<template>
    <div class="task-panel">
        <n-data-table
            :columns="columns"
            :data="tableData"
            :loading="loading"
            :scroll-x="1300"
            size="small"
            :bordered="true"
            striped
        />

        <!-- ── Modal Tambah / Edit Tugas ──────────────────────────────────── -->
        <n-modal
            v-model:show="isModalOpen"
            preset="card"
            :style="{ width: '860px', maxHeight: '90vh' }"
            :segmented="{ content: true, footer: true }"
            :closable="false"
            :mask-closable="false"
        >
            <!-- Custom Header -->
            <template #header>
                <div class="modal-header">
                    <span class="modal-title">
                        {{ isEditMode ? "✏️ Edit Tugas" : "➕ Tambah Tugas" }}
                    </span>
                    <n-button
                        text
                        class="modal-close-btn"
                        @click="closeModal"
                        title="Tutup"
                    >
                        <span style="font-size: 20px; line-height: 1">✕</span>
                    </n-button>
                </div>
            </template>

            <n-scrollbar style="max-height: calc(90vh - 140px)">
                <div style="padding: 0 4px 8px">
                    <n-form
                        :model="formData"
                        label-width="160"
                        label-placement="left"
                    >
                        <!-- ── Informasi Tugas ────────────────────────────── -->
                        <n-divider
                            title-placement="left"
                            style="margin: 0 0 14px"
                        >
                            <n-text depth="3" style="font-size: 12px">
                                Informasi Tugas
                            </n-text>
                        </n-divider>

                        <n-form-item label="Nama Tugas" :required="true">
                            <n-input
                                v-model:value="formData.name"
                                placeholder="Nama tugas"
                            />
                        </n-form-item>

                        <n-grid :cols="2" :x-gap="16">
                            <n-form-item-gi label="Tanggal Mulai">
                                <input
                                    type="date"
                                    v-model="formData.tanggal_mulai"
                                    class="date-input"
                                />
                            </n-form-item-gi>
                            <n-form-item-gi label="Tanggal Selesai">
                                <input
                                    type="date"
                                    v-model="formData.tanggal_selesai"
                                    class="date-input"
                                />
                            </n-form-item-gi>
                        </n-grid>

                        <!-- ── Perencanaan ────────────────────────────────── -->
                        <n-divider
                            title-placement="left"
                            style="margin: 16px 0 14px"
                        >
                            <n-text depth="3" style="font-size: 12px">
                                Perencanaan
                            </n-text>
                        </n-divider>

                        <n-grid :cols="3" :x-gap="16">
                            <n-form-item-gi label="Prioritas">
                                <n-select
                                    v-model:value="formData.priority"
                                    :options="PRIORITY_OPTIONS"
                                    clearable
                                    placeholder="Pilih prioritas"
                                    style="width: 100%"
                                />
                            </n-form-item-gi>
                            <n-form-item-gi label="Status">
                                <n-select
                                    v-model:value="formData.status"
                                    :options="STATUS_OPTIONS"
                                    clearable
                                    placeholder="Pilih status"
                                    style="width: 100%"
                                />
                            </n-form-item-gi>
                            <n-form-item-gi label="Progress (%)">
                                <n-input-number
                                    v-model:value="formData.progress"
                                    :min="0"
                                    :max="100"
                                    :show-button="false"
                                    placeholder="0"
                                    style="width: 100%"
                                >
                                    <template #suffix>%</template>
                                </n-input-number>
                            </n-form-item-gi>
                        </n-grid>

                        <n-form-item label="Catatan">
                            <n-input
                                v-model:value="formData.notes"
                                type="textarea"
                                :autosize="{ minRows: 2, maxRows: 4 }"
                                placeholder="Catatan tambahan (opsional)"
                            />
                        </n-form-item>

                        <!-- ── Capaian & Evaluasi ─────────────────────────── -->
                        <n-divider
                            title-placement="left"
                            style="margin: 16px 0 14px"
                        >
                            <n-text depth="3" style="font-size: 12px">
                                Capaian &amp; Evaluasi
                            </n-text>
                        </n-divider>

                        <n-form-item label="Capaian">
                            <n-input
                                v-model:value="formData.achievement"
                                type="textarea"
                                :autosize="{ minRows: 2, maxRows: 5 }"
                                placeholder="Capaian / hasil yang diperoleh"
                            />
                        </n-form-item>

                        <n-form-item label="Interpretasi">
                            <n-input
                                v-model:value="formData.interpretation"
                                type="textarea"
                                :autosize="{ minRows: 2, maxRows: 5 }"
                                placeholder="Interpretasi dari hasil"
                            />
                        </n-form-item>

                        <n-form-item label="Analisis">
                            <n-input
                                v-model:value="formData.analysis"
                                type="textarea"
                                :autosize="{ minRows: 2, maxRows: 5 }"
                                placeholder="Analisis terhadap capaian"
                            />
                        </n-form-item>

                        <n-form-item label="Rencana Tindak Lanjut">
                            <n-input
                                v-model:value="formData.followup_plan"
                                type="textarea"
                                :autosize="{ minRows: 2, maxRows: 5 }"
                                placeholder="Rencana tindak lanjut / follow-up"
                            />
                        </n-form-item>

                        <!-- ── Data Pendukung (Lampiran) ───────────────────────────── -->
                        <n-divider
                            title-placement="left"
                            style="margin: 16px 0 14px"
                        >
                            <n-text depth="3" style="font-size: 12px">
                                Data Pendukung
                            </n-text>
                        </n-divider>

                        <n-form-item label="Lampiran">
                            <!-- file input: multiple files allowed; call uploadFiles on change -->
                            <input
                                type="file"
                                multiple
                                @change="(e) => uploadFiles(e.target.files)"
                                style="display: block; margin-bottom: 8px"
                            />

                            <!-- uploading indicator -->
                            <div
                                v-if="uploading"
                                style="
                                    margin-bottom: 8px;
                                    font-size: 0.9rem;
                                    color: var(--n-info-color, #3b82f6);
                                "
                            >
                                Mengunggah lampiran...
                            </div>

                            <!-- existing attachments list (when editing) -->
                            <div
                                v-if="
                                    attachmentsForCurrentTask &&
                                    attachmentsForCurrentTask.length > 0
                                "
                                style="
                                    display: flex;
                                    flex-direction: column;
                                    gap: 6px;
                                "
                            >
                                <div
                                    v-for="att in attachmentsForCurrentTask"
                                    :key="att.id"
                                    style="
                                        display: flex;
                                        align-items: center;
                                        gap: 8px;
                                        justify-content: space-between;
                                    "
                                >
                                    <div
                                        style="
                                            display: flex;
                                            align-items: center;
                                            gap: 8px;
                                        "
                                    >
                                        <a
                                            :href="att.url"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style="color: var(--n-text-color)"
                                            >{{ att.fileName }}</a
                                        >
                                        <span
                                            style="
                                                font-size: 0.85rem;
                                                opacity: 0.6;
                                            "
                                            >{{
                                                att.uploadedAt
                                                    ? `• ${att.uploadedAt}`
                                                    : ""
                                            }}</span
                                        >
                                    </div>
                                    <div style="display: flex; gap: 8px">
                                        <n-button
                                            size="tiny"
                                            @click="
                                                () => {
                                                    const id = att.id;
                                                    deleteAttachment(id);
                                                }
                                            "
                                            >Hapus</n-button
                                        >
                                    </div>
                                </div>
                            </div>

                            <div v-else style="opacity: 0.7; font-size: 0.9rem">
                                Belum ada lampiran
                            </div>
                        </n-form-item>
                    </n-form>
                </div>
            </n-scrollbar>

            <template #footer>
                <n-space justify="end">
                    <n-button @click="closeModal">Tutup</n-button>
                    <n-button
                        type="primary"
                        @click="submitForm"
                        :loading="saving"
                    >
                        {{ isEditMode ? "Simpan" : "Tambah" }}
                    </n-button>
                </n-space>
            </template>
        </n-modal>
    </div>
</template>

<script src="./TaskPanel.ts" />

<style scoped>
.task-panel {
    padding: 14px 24px 18px;
    background: #f7f8fa;
    border-top: 2px solid #e0e3eb;
}

/* ── Modal Header ──────────────────────────────────────────────────────────── */
.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.modal-title {
    font-size: 1rem;
    font-weight: 600;
}

.modal-close-btn {
    flex-shrink: 0;
    color: var(--n-text-color, #333);
    opacity: 0.55;
    transition: opacity 0.15s ease;
    padding: 2px 4px;
}

.modal-close-btn:hover {
    opacity: 1;
}

/* ── Native Date Input ─────────────────────────────────────────────────────── */
.date-input {
    width: 100%;
    height: 34px;
    padding: 0 10px;
    border: 1px solid var(--n-border-color, #e0e0e6);
    border-radius: 3px;
    font-size: 14px;
    color: var(--n-text-color, #333);
    background: var(--n-color, #fff);
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s ease;
}

.date-input:focus {
    border-color: var(--n-primary-color, #18a058);
    box-shadow: 0 0 0 2px rgba(24, 160, 88, 0.15);
}

.date-input::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.6;
}

.date-input::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
}
</style>
