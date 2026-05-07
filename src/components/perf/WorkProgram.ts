import { defineComponent, ref, h, computed, nextTick, onMounted } from "vue";
import { useMessage, NButton } from "naive-ui";
import { apiFetch } from "@/services/apiClient";
import { Config } from "@/constant/config";
import { getAuthData } from "@/services/authService";
import TaskPanel from "./TaskPanel.vue";

type WorkProgram = {
  id: number;
  year: number | null;
  name: string | null;
  operational_definition: string | null;
  person_responsible: number | null;
  person_responsible_name?: string | null;
};

type OrgOption = {
  label: string;
  value: string;
};

export default defineComponent({
  setup() {
    const message = useMessage();

    const loading = ref(false);
    const saving = ref(false);

    const sessionOrgId: string | null =
      getAuthData()?.employee?.[0]?.organizationId ?? null;

    const filter = ref<{
      year: number | null;
      q: string;
      organizationId: string | null;
    }>({
      year: new Date().getFullYear(),
      q: "",
      organizationId: sessionOrgId,
    });

    const tableData = ref<WorkProgram[]>([]);

    const isModalOpen = ref(false);
    const isEditMode = ref(false);

    const emptyForm = (): WorkProgram => ({
      id: 0,
      year: new Date().getFullYear(),
      name: "",
      operational_definition: "",
      person_responsible: null,
    });

    const formData = ref<WorkProgram>(emptyForm());

    // ── Organization options (filter bar) ────────────────────────────────────
    const orgOptions = ref<OrgOption[]>([]);
    const orgLoading = ref(false);

    const loadOrganizations = async () => {
      orgLoading.value = true;
      try {
        const res = (await apiFetch(
          `${Config.UrlBackend}/api/option/organization`,
          { method: "GET" },
        )) as Response | void;
        if (!res?.ok) return;
        const json: any = await res.json();
        const list = json.Data ?? json.data ?? [];
        orgOptions.value = (list as { id: string; name: string }[]).map(
          (o) => ({
            label: o.name,
            value: o.id,
          }),
        );
      } catch (_) {
        orgOptions.value = [];
      } finally {
        orgLoading.value = false;
      }
    };

    // ── Employee options for modal form (Penanggung Jawab) ───────────────────
    const employeeOptions = ref<{ label: string; value: number }[]>([]);
    const employeeSearchLoading = ref(false);

    const searchEmployees = async (query: string) => {
      if (!query || query.trim().length < 2) {
        employeeOptions.value = [];
        return;
      }
      employeeSearchLoading.value = true;
      try {
        const res = (await apiFetch(
          `${Config.UrlBackend}/api/option/employee?q=${encodeURIComponent(query.trim())}`,
          { method: "GET" },
        )) as Response | void;
        if (!res?.ok) return;
        const json: any = await res.json();
        const list = json.data ?? json.Data ?? [];
        employeeOptions.value = (list as { id: number; name?: string }[]).map(
          (e: any) => ({
            label: e.name ?? `#${e.id}`,
            value: e.id,
          }),
        );
      } catch (_) {
        employeeOptions.value = [];
      } finally {
        employeeSearchLoading.value = false;
      }
    };

    // ── Expand rows ──────────────────────────────────────────────────────────
    const expandedRowKeys = ref<(string | number)[]>([]);

    // Map programId -> TaskPanel component proxy
    const taskPanelRefs = new Map<number, any>();

    // ── Year options ─────────────────────────────────────────────────────────
    const yearOptions = computed(() => {
      const y = new Date().getFullYear();
      return [
        { label: String(y - 1), value: y - 1 },
        { label: String(y), value: y },
        { label: String(y + 1), value: y + 1 },
      ];
    });

    // ── Data load ────────────────────────────────────────────────────────────
    const reload = async () => {
      try {
        loading.value = true;
        const params = new URLSearchParams();
        if (filter.value.year) params.set("year", String(filter.value.year));
        if (filter.value.q) params.set("q", filter.value.q);
        if (filter.value.organizationId)
          params.set("orgId", filter.value.organizationId);

        const res = (await apiFetch(
          `${Config.UrlBackend}/api/perf/work-program?${params.toString()}`,
          { method: "GET" },
        )) as Response | void;

        if (!res) throw new Error("Unauthorized");
        if (!res.ok) throw new Error(`Server error (${res.status})`);

        const json: any = await res.json();
        tableData.value = json.data ?? json.Data ?? [];
      } catch (e: any) {
        message.error(e?.message || "Gagal memuat program kerja");
      } finally {
        loading.value = false;
      }
    };

    // ── Work program modal ───────────────────────────────────────────────────
    const openAddModal = () => {
      isEditMode.value = false;
      formData.value = emptyForm();
      employeeOptions.value = [];
      isModalOpen.value = true;
    };

    const openEditModal = (row: WorkProgram) => {
      isEditMode.value = true;
      formData.value = { ...row };
      employeeOptions.value =
        row.person_responsible != null && row.person_responsible_name
          ? [
              {
                label: row.person_responsible_name,
                value: row.person_responsible,
              },
            ]
          : [];
      isModalOpen.value = true;
    };

    const closeModal = () => {
      isModalOpen.value = false;
    };

    const submitForm = async () => {
      try {
        saving.value = true;

        const payload = {
          year: formData.value.year,
          name: formData.value.name,
          operational_definition: formData.value.operational_definition,
          person_responsible: formData.value.person_responsible,
        };

        const url = isEditMode.value
          ? `${Config.UrlBackend}/api/perf/work-program/${formData.value.id}`
          : `${Config.UrlBackend}/api/perf/work-program`;

        const method = isEditMode.value ? "PUT" : "POST";

        const res = (await apiFetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })) as Response | void;

        if (!res) throw new Error("Unauthorized");
        if (!res.ok) {
          const errJson = await res.json().catch(() => null);
          throw new Error(errJson?.message || `Server error (${res.status})`);
        }

        message.success(
          isEditMode.value ? "Program diperbarui" : "Program ditambahkan",
        );
        closeModal();
        await reload();
      } catch (e: any) {
        message.error(e?.message || "Gagal menyimpan program kerja");
      } finally {
        saving.value = false;
      }
    };

    const deleteRow = async (row: WorkProgram) => {
      try {
        const confirmText = `Hapus program "${row.name ?? "-"}"?\Tugas di dalamnya juga akan terhapus.`;
        if (!confirm(confirmText)) return;

        const res = (await apiFetch(
          `${Config.UrlBackend}/api/perf/work-program/${row.id}`,
          { method: "DELETE" },
        )) as Response | void;

        if (!res) throw new Error("Unauthorized");
        if (!res.ok) {
          const errJson = await res.json().catch(() => null);
          throw new Error(errJson?.message || `Server error (${res.status})`);
        }

        message.success("Program dihapus");
        await reload();
      } catch (e: any) {
        message.error(e?.message || "Gagal menghapus program");
      }
    };

    // ── Columns ──────────────────────────────────────────────────────────────
    const columns = [
      {
        type: "expand" as const,
        expandable: () => true,
        renderExpand: (row: WorkProgram) => {
          const id = Number(row.id);
          return h(TaskPanel, {
            programId: id,
            onVnodeMounted: (vnode: any) => {
              taskPanelRefs.set(id, vnode.component?.proxy);
            },
            onVnodeBeforeUnmount: () => {
              taskPanelRefs.delete(id);
            },
          });
        },
      },
      { title: "Tahun", key: "year", width: 90 },
      { title: "Nama", key: "name", minWidth: 240 },
      {
        title: "Definisi Operasional",
        key: "operational_definition",
        minWidth: 380,
      },
      {
        title: "Penanggung Jawab",
        key: "person_responsible_name",
        width: 200,
        render: (row: WorkProgram) =>
          row.person_responsible_name ??
          (row.person_responsible != null
            ? String(row.person_responsible)
            : "–"),
      },
      {
        title: "Aksi",
        key: "actions",
        width: 350,
        //fixed: "right" as const,
        render: (row: WorkProgram) => {
          const id = Number(row.id);
          const isExpanded = expandedRowKeys.value.includes(id);
          return h(
            "div",
            {
              style:
                "display:flex; gap:6px; flex-wrap:wrap; align-items:center;",
            },
            [
              h(
                NButton,
                {
                  size: "small",
                  type: "primary",
                  title: isExpanded ? "Sembunyikan tugas" : "Tampilkan tugas",
                  onClick: () => {
                    if (isExpanded) {
                      expandedRowKeys.value = expandedRowKeys.value.filter(
                        (k) => k !== id,
                      );
                    } else {
                      expandedRowKeys.value = [...expandedRowKeys.value, id];
                    }
                  },
                },
                {
                  default: () =>
                    isExpanded ? "▲ Sembunyikan tugas" : "▼ Tampilkan tugas",
                },
              ),
              h(
                NButton,
                { size: "small", onClick: () => openEditModal(row) },
                { default: () => "Edit" },
              ),
              h(
                NButton,
                {
                  size: "small",
                  type: "error",
                  onClick: () => deleteRow(row),
                },
                { default: () => "Hapus" },
              ),
            ],
          );
        },
      },
    ];

    // ── Lifecycle ────────────────────────────────────────────────────────────
    onMounted(async () => {
      await loadOrganizations();
      await reload();
    });

    return {
      loading,
      saving,
      filter,
      yearOptions,
      tableData,
      columns,
      expandedRowKeys,
      isModalOpen,
      isEditMode,
      formData,
      // organization filter
      orgOptions,
      orgLoading,
      // modal employee search
      employeeOptions,
      employeeSearchLoading,
      searchEmployees,
      // actions
      reload,
      openAddModal,
      openEditModal,
      closeModal,
      submitForm,
    };
  },
});
