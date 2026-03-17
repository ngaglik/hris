import { defineComponent, ref, h, onMounted } from "vue";
import { useMessage, NButton, NTag, NProgress } from "naive-ui";
import { apiFetch } from "@/services/apiClient";
import { Config } from "@/constant/config";

type TaskItem = {
  id: number;
  program_id: number | null;
  name: string | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  achievement: string | null;
  interpretation: string | null;
  analysis: string | null;
  followup_plan: string | null;
  priority: string | null; // 'high' | 'medium' | 'low'
  status: string | null; // 'planned' | 'on_progress' | 'done' | 'postponed'
  progress: number | null; // 0–100
  notes: string | null;
  sort_order: number | null;
};

type Attachment = {
  id: number;
  taskId: number;
  fileName: string;
  url: string;
  uploadedAt: string | null;
};

export const PRIORITY_OPTIONS = [
  { label: "🔴 Tinggi", value: "high" },
  { label: "🟡 Sedang", value: "medium" },
  { label: "🟢 Rendah", value: "low" },
];

export const STATUS_OPTIONS = [
  { label: "Direncanakan", value: "planned" },
  { label: "Sedang Berjalan", value: "on_progress" },
  { label: "Selesai", value: "done" },
  { label: "Ditunda", value: "postponed" },
];

const PRIORITY_TYPE: Record<
  string,
  "error" | "warning" | "success" | "default"
> = {
  high: "error",
  medium: "warning",
  low: "success",
};

const PRIORITY_LABEL: Record<string, string> = {
  high: "Tinggi",
  medium: "Sedang",
  low: "Rendah",
};

const STATUS_TYPE: Record<string, "default" | "info" | "success" | "warning"> =
  {
    planned: "default",
    on_progress: "info",
    done: "success",
    postponed: "warning",
  };

const STATUS_LABEL: Record<string, string> = {
  planned: "Direncanakan",
  on_progress: "Berjalan",
  done: "Selesai",
  postponed: "Ditunda",
};

export default defineComponent({
  name: "TaskPanel",
  props: {
    programId: { type: Number, required: true },
  },
  setup(props) {
    const message = useMessage();

    const loading = ref(false);
    const saving = ref(false);
    const tableData = ref<TaskItem[]>([]);

    const isModalOpen = ref(false);
    const isEditMode = ref(false);

    // Attachments state
    const currentEditingTaskId = ref<number | null>(null);
    // Map taskId -> attachments
    const attachmentsMap = ref<Record<number, Attachment[]>>({});
    const uploading = ref(false);

    // ── Empty form factory ────────────────────────────────────────────────────
    const emptyForm = (): TaskItem => ({
      id: 0,
      program_id: props.programId,
      name: "",
      tanggal_mulai: null,
      tanggal_selesai: null,
      achievement: "",
      interpretation: "",
      analysis: "",
      followup_plan: "",
      priority: null,
      status: "planned",
      progress: 0,
      notes: null,
      sort_order: null,
    });

    const formData = ref<TaskItem>(emptyForm());

    // ── Load ──────────────────────────────────────────────────────────────────
    const reload = async () => {
      loading.value = true;
      try {
        const res = (await apiFetch(
          `${Config.UrlBackend}/api/perf/work-program/${props.programId}/tasks`,
          { method: "GET" },
        )) as Response | void;
        if (!res) throw new Error("Unauthorized");
        if (!res.ok) throw new Error(`Server error (${res.status})`);
        const json: any = await res.json();
        tableData.value = json.data ?? json.Data ?? [];

        // fetch attachments for each task in parallel (non-blocking)
        const fetches = tableData.value.map(async (t) => {
          try {
            const attRes = (await apiFetch(
              `${Config.UrlBackend}/api/perf/work-program/task/${t.id}/attachments`,
              { method: "GET" },
            )) as Response | void;
            if (!attRes || !attRes.ok) {
              attachmentsMap.value[t.id] = [];
              return;
            }
            const ajson: any = await attRes.json();
            attachmentsMap.value[t.id] = ajson.data ?? ajson.Data ?? [];
          } catch {
            attachmentsMap.value[t.id] = [];
          }
        });
        await Promise.all(fetches);
      } catch (e: any) {
        message.error(e?.message || "Gagal memuat tugas");
      } finally {
        loading.value = false;
      }
    };

    // ── Attachments API helpers ───────────────────────────────────────────────
    const loadAttachments = async (taskId: number) => {
      try {
        const res = (await apiFetch(
          `${Config.UrlBackend}/api/perf/work-program/task/${taskId}/attachments`,
          { method: "GET" },
        )) as Response | void;
        if (!res) throw new Error("Unauthorized");
        if (!res.ok) throw new Error(`Server error (${res.status})`);
        const json: any = await res.json();
        attachmentsMap.value[taskId] = json.data ?? json.Data ?? [];
      } catch (e: any) {
        attachmentsMap.value[taskId] = [];
        message.error(e?.message || "Gagal memuat lampiran");
      }
    };

    const uploadFiles = async (files: FileList | null) => {
      if (!files || !currentEditingTaskId.value) return;
      uploading.value = true;
      try {
        // Support multiple files in one request if backend supports it
        const fd = new FormData();
        for (let i = 0; i < files.length; i++) {
          fd.append("files", files[i], files[i].name);
        }

        const res = (await apiFetch(
          `${Config.UrlBackend}/api/perf/work-program/task/${currentEditingTaskId.value}/attachment`,
          {
            method: "POST",
            body: fd,
          },
        )) as Response | void;

        if (!res) throw new Error("Unauthorized");
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.message || `Upload failed (${res.status})`);
        }

        const json: any = await res.json();
        const added = json.data ?? json.Data ?? null;
        // after upload, refresh list for this task
        await loadAttachments(currentEditingTaskId.value);
        message.success("Lampiran berhasil diunggah");
      } catch (e: any) {
        message.error(e?.message || "Gagal mengunggah lampiran");
      } finally {
        uploading.value = false;
      }
    };

    const deleteAttachment = async (attId: number) => {
      if (!confirm("Hapus lampiran?")) return;
      try {
        const res = (await apiFetch(
          `${Config.UrlBackend}/api/perf/work-program/task/attachment/${attId}`,
          { method: "DELETE" },
        )) as Response | void;
        if (!res) throw new Error("Unauthorized");
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.message || `Server error (${res.status})`);
        }
        // remove from map
        Object.keys(attachmentsMap.value).forEach((k) => {
          const key = Number(k);
          attachmentsMap.value[key] = (attachmentsMap.value[key] ?? []).filter(
            (a) => a.id !== attId,
          );
        });
        message.success("Lampiran dihapus");
      } catch (e: any) {
        message.error(e?.message || "Gagal menghapus lampiran");
      }
    };

    // ── Modal open / close ────────────────────────────────────────────────────
    const openAddModal = () => {
      isEditMode.value = false;
      formData.value = emptyForm();
      currentEditingTaskId.value = null;
      isModalOpen.value = true;
    };

    const openEditModal = (row: TaskItem) => {
      isEditMode.value = true;
      formData.value = { ...row };
      currentEditingTaskId.value = row.id;
      // load attachments for this task
      void loadAttachments(row.id);
      isModalOpen.value = true;
    };

    const closeModal = () => {
      isModalOpen.value = false;
      currentEditingTaskId.value = null;
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const submitForm = async () => {
      if (!formData.value.name?.trim()) {
        message.warning("Nama tugas wajib diisi");
        return;
      }
      saving.value = true;
      try {
        const payload = {
          name: formData.value.name?.trim(),
          tanggal_mulai: formData.value.tanggal_mulai || null,
          tanggal_selesai: formData.value.tanggal_selesai || null,
          achievement: formData.value.achievement || null,
          interpretation: formData.value.interpretation || null,
          analysis: formData.value.analysis || null,
          followup_plan: formData.value.followup_plan || null,
          priority: formData.value.priority || null,
          status: formData.value.status || "planned",
          progress: formData.value.progress ?? 0,
          notes: formData.value.notes || null,
        };

        const url = isEditMode.value
          ? `${Config.UrlBackend}/api/perf/work-program/task/${formData.value.id}`
          : `${Config.UrlBackend}/api/perf/work-program/${props.programId}/task`;

        const method = isEditMode.value ? "PUT" : "POST";

        const res = (await apiFetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })) as Response | void;

        if (!res) throw new Error("Unauthorized");
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.message || `Server error (${res.status})`);
        }

        const json: any = await res.json();
        const savedTask = json.data ?? json.Data ?? null;

        message.success(
          isEditMode.value ? "Tugas diperbarui" : "Tugas ditambahkan",
        );

        // After saving, reload table and attachments map
        await reload();
        if (isEditMode.value && savedTask && savedTask.id) {
          await loadAttachments(savedTask.id);
        }

        closeModal();
      } catch (e: any) {
        message.error(e?.message || "Gagal menyimpan tugas");
      } finally {
        saving.value = false;
      }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const deleteRow = async (row: TaskItem) => {
      if (!confirm(`Hapus tugas "${row.name ?? "-"}"?`)) return;
      try {
        const res = (await apiFetch(
          `${Config.UrlBackend}/api/perf/work-program/task/${row.id}`,
          { method: "DELETE" },
        )) as Response | void;
        if (!res) throw new Error("Unauthorized");
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.message || `Server error (${res.status})`);
        }
        // cleanup attachments map entry
        delete attachmentsMap.value[row.id];
        message.success("Tugas dihapus");
        await reload();
      } catch (e: any) {
        message.error(e?.message || "Gagal menghapus tugas");
      }
    };

    // ── Columns ───────────────────────────────────────────────────────────────
    const columns = [
      {
        title: "Nama Tugas",
        key: "name",
        minWidth: 200,
        ellipsis: { tooltip: true },
      },
      { title: "Tgl Mulai", key: "tanggal_mulai", width: 110 },
      { title: "Tgl Selesai", key: "tanggal_selesai", width: 110 },
      {
        title: "Prioritas",
        key: "priority",
        width: 110,
        render: (row: TaskItem) =>
          row.priority
            ? h(
                NTag,
                {
                  type: PRIORITY_TYPE[row.priority] ?? "default",
                  size: "small",
                  round: true,
                },
                {
                  default: () => PRIORITY_LABEL[row.priority!] ?? row.priority,
                },
              )
            : "—",
      },
      {
        title: "Status",
        key: "status",
        width: 130,
        render: (row: TaskItem) =>
          row.status
            ? h(
                NTag,
                {
                  type: STATUS_TYPE[row.status] ?? "default",
                  size: "small",
                  round: true,
                },
                { default: () => STATUS_LABEL[row.status!] ?? row.status },
              )
            : "—",
      },
      {
        title: "Progress",
        key: "progress",
        width: 120,
        render: (row: TaskItem) => {
          const pct = row.progress ?? 0;
          const type = pct >= 100 ? "success" : pct >= 50 ? "info" : "default";
          return h(NProgress, {
            type: "line",
            percentage: pct,
            status: type,
            height: 10,
            borderRadius: 4,
            showIndicator: true,
            style: "min-width: 90px",
          });
        },
      },
      {
        title: "Capaian",
        key: "achievement",
        minWidth: 160,
        ellipsis: { tooltip: true },
      },
      {
        title: "Analisis",
        key: "analysis",
        minWidth: 160,
        ellipsis: { tooltip: true },
      },
      // New attachments column: show download links
      {
        title: "Lampiran",
        key: "attachments",
        width: 220,
        render: (row: TaskItem) => {
          const atts = attachmentsMap.value[row.id] ?? [];
          if (!atts || atts.length === 0) return "—";
          // render list of links separated by comma / line breaks
          return h(
            "div",
            {
              style:
                "display:flex; flex-wrap:wrap; gap:8px; align-items:center",
            },
            atts.map((a) =>
              h(
                "a",
                {
                  href: a.url,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  style: "font-size:0.9rem; color: var(--n-text-color)",
                },
                a.fileName,
              ),
            ),
          );
        },
      },
      {
        title: "Aksi",
        key: "actions",
        width: 200,
        fixed: "right" as const,
        render: (row: TaskItem) =>
          h("div", { style: "display:flex; gap:6px;" }, [
            h(
              NButton,
              { size: "small", onClick: () => openEditModal(row) },
              { default: () => "Edit" },
            ),
            h(
              NButton,
              { size: "small", type: "error", onClick: () => deleteRow(row) },
              { default: () => "Hapus" },
            ),
          ]),
      },
    ];

    onMounted(() => {
      void reload();
    });

    return {
      loading,
      saving,
      tableData,
      columns,
      isModalOpen,
      isEditMode,
      formData,
      PRIORITY_OPTIONS,
      STATUS_OPTIONS,
      openAddModal,
      closeModal,
      submitForm,
      // attachments helpers & state
      attachmentsMap,
      loadAttachments,
      uploadFiles,
      deleteAttachment,
      uploading,
      currentEditingTaskId,
    };
  },
});
