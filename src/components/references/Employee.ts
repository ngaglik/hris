import { onMounted, defineComponent, ref, computed, h } from "vue";
import { useMessage, useDialog, NButton } from "naive-ui";
import { Config } from "@/constant/config";
import { apiFetch } from "@/services/apiClient";
import { getAuthData, saveAuthData, logout } from "@/services/authService";
import selectTree from "@/container/selectTree/selectTree.vue";
import UserProfile from "../profile/UserProfile.vue";
import { isWithFaceDetection } from "@vladmandic/face-api";

export default defineComponent({
  components: {
    selectTree,
    UserProfile,
  },
  setup() {
    const dialog = useDialog();
    const message = useMessage();

    // state
    const inputSearch = ref("");
    const selectedOrgId = ref<string | number | null>(null);
    const tableData = ref<any[]>([]);
    const current = ref(1);
    const pageSize = ref(50);
    const total = ref(0);
    const loading = ref(false);
    let auth = getAuthData();
    if (!auth) {
      logout();
      return null;
    }
    let token = auth?.token;
    let session = auth?.session;

    const employee = auth.employee?.[0];
    const tags = employee?.tags ?? [];
    const employeeId = employee?.id;
    const positionId = employee?.positionId;
    const organizationId = employee?.organizationId;

    const isActiveFilter = ref<boolean | null>(true);

    const statusOptions = [
      { label: "Aktif", value: true },
      { label: "Nonaktif", value: false },
    ];

    const handleStatusFilter = () => {
      current.value = 1;
      fetchData();
    };

    // ── Options ──────────────────────────────────────────────────────
    const functionalOptions = ref<{ label: string; value: string }[]>([]);
    const fetchFunctionalOptions = async () => {
      try {
        const res = (await apiFetch(
          `${Config.UrlBackend}/api/option/functional`,
          { method: "GET" },
        )) as Response;
        if (!res || !res.ok) return;
        const result = await res.json();
        functionalOptions.value = (result.data || result).map((x: any) => ({
          label: x.name,
          value: x.id,
        }));
      } catch {
        /* silent */
      }
    };

    const personOptions = ref<any[]>([]);
    const personLoading = ref(false);

    const handleInputSearchPerson = async (keyword?: string) => {
      // reset list setiap karakter diketik
      personOptions.value = [];

      // validasi minimal 2 karakter
      if (!keyword || keyword.length < 2) {
        return;
      }
      personLoading.value = true;
      try {
        const response = await apiFetch(
          `${Config.UrlBackend}/api/person?page=1&pageSize=100&inputSearch=${keyword}`,
          {
            method: "GET",
          },
        );

        const result = await response.json();

        personOptions.value = (result.data || []).map((item: any) => ({
          label: `${item.name} - ${item.national_id_number}`,
          value: item.id,
          name: item.name,
          national_employee_id_number: item.national_employee_id_number,
        }));
      } catch (error) {
        console.error(error);
        message.error("Gagal memuat data person");
      } finally {
        personLoading.value = false;
      }
    };

    const handlePersonSelect = (value: any) => {
      const selected = personOptions.value.find((p) => p.value === value);

      if (!selected) return;
      message.info("aaaaaaaaaaaaaa");
      message.info(selected.national_employee_id_number);
      formData.value.person_id = selected.value;
      formData.value.name = selected.name;
      formData.value.national_employee_id_number =
        selected.national_employee_id_number;
    };
    const employeeCategoryFilter = ref<number | null>(null);
    const employeeCategoryOptions = ref<any[]>([]);
    const fetchEmployeeCategoryOptions = async () => {
      try {
        const response = await apiFetch(
          `${Config.UrlBackend}/api/option/employee_category`,
          { method: "GET" },
        );

        const result = await response.json();

        // asumsi response:
        // [{ id: 1, name: 'Suami' }, { id: 2, name: 'Istri' }]
        employeeCategoryOptions.value = (result.data || result).map(
          (item: any) => ({
            label: item.name,
            value: item.id,
          }),
        );
      } catch (error) {
        console.error(error);
        message.error("Gagal memuat employee_category");
      }
    };
    const getEmployeeCategoryLabel = (
      value: string | number | null | undefined,
    ) => {
      if (value == null) return "-";
      const option = employeeCategoryOptions.value.find(
        (o) => String(o.value) === String(value),
      );
      return option?.label ?? "-";
    };

    const organizationOptions = ref<any[]>([]);
    const fetchOrganizationOptions = async () => {
      try {
        const response = await apiFetch(
          `${Config.UrlBackend}/api/option/organization`,
          { method: "GET" },
        );

        const result = await response.json();

        organizationOptions.value = (result.data || result).map(
          (item: any) => ({
            label: item.name,
            value: item.id,
          }),
        );
      } catch (error) {
        console.error(error);
        message.error("Gagal memuat organizationOptions");
      }
    };
    const getOrganizationLabel = (
      value: string | number | null | undefined,
    ) => {
      if (value == null) return "-";
      const option = organizationOptions.value.find(
        (o) => String(o.value) === String(value),
      );
      return option?.label ?? "-";
    };

    const onOrganizationChange = (orgId: number | null) => {
      formData.position_id = null; // reset jabatan saat unit berubah

      if (orgId) {
        fetchPositionOptions(orgId);
      } else {
        positionOptions.value = []; // kosongkan kalau tidak ada unit
      }
    };

    const positionOptions = ref<any[]>([]);
    const fetchPositionOptions = async (orgId) => {
      try {
        const response = await apiFetch(
          `${Config.UrlBackend}/api/option/position/${orgId}`,
          { method: "GET" },
        );
        const result = await response.json();
        positionOptions.value = (result.data || result).map((item: any) => ({
          label: item.position_name,
          value: item.id,
        }));
      } catch (error) {
        console.error(error);
        message.error("Gagal memuat positionOptions");
      }
    };

    const tagOptions = ref<any[]>([]);
    const fetchTagOptions = async () => {
      try {
        const response = await apiFetch(
          `${Config.UrlBackend}/api/option/permission`,
          { method: "GET" },
        );
        const result = await response.json();
        tagOptions.value = (result.data || result).map((item: any) => ({
          label: item.tag,
          value: item.tag,
        }));
      } catch (error) {
        console.error(error);
        message.error("Gagal memuat tagOptions");
      }
    };

    const getPositionLabel = (value: string | number | null | undefined) => {
      if (value == null) return "-";
      const option = positionOptions.value.find(
        (o) => String(o.value) === String(value),
      );
      return option?.label ?? "-";
    };

    const professionalOptions = ref<any[]>([]);
    const fetchProfessionalOptions = async () => {
      try {
        const response = await apiFetch(
          `${Config.UrlBackend}/api/option/professional`,
          { method: "GET" },
        );
        const result = await response.json();
        professionalOptions.value = (result.data || result).map(
          (item: any) => ({
            label: item.name,
            value: item.id,
          }),
        );
      } catch (error) {
        console.error(error);
        message.error("Gagal memuat professionalOptions");
      }
    };
    const getProfessionalLabel = (
      value: string | number | null | undefined,
    ) => {
      if (value == null) return "-";
      const option = professionalOptions.value.find(
        (o) => String(o.value) === String(value),
      );
      return option?.label ?? "-";
    };

    const genderOptions = [
      { label: "Laki-Laki", value: "L" },
      { label: "Perempuan", value: "P" },
    ];

    const fetchData = async (page = 1) => {
      if (
        !inputSearch.value &&
        !employeeCategoryFilter.value &&
        !selectedOrgId.value
      )
        return;
      loading.value = true;

      let url =
        `${Config.UrlBackend}/api/employee?` +
        `page=${page}&pageSize=${pageSize.value}`;

      if (isActiveFilter.value) {
        url += `&isActive=${isActiveFilter.value.toString()}`;
      }

      if (employeeCategoryFilter.value) {
        url += `&employeeCategoryId=${employeeCategoryFilter.value}`;
      }

      if (selectedOrgId.value) {
        url += `&selectedOrgId=${selectedOrgId.value}`;
      }

      if (inputSearch.value) {
        url += `&inputSearch=${inputSearch.value}`;
      }

      const res = await apiFetch(url);
      const result = await res.json();

      tableData.value = result.data;
      total.value = result.total;

      loading.value = false;
    };

    const handleCategoryFilter = async () => {
      current.value = 1;
      await fetchData(1);
    };

    // modal state
    const isModalOpen = ref(false);
    const isEditMode = ref(false);
    const isPreviewOpen = ref(false);

    const formData = ref({
      id: null,
      person_id: "",
      national_employee_id_number: "",
      professional_id: "",
      employee_category_id: "",
      organization_id: "",
      position_id: null,
      functional_id: null,
      address: "",
      tags: "",
      is_active: true, // default aktif
      is_shift: false,
    });

    const formDataFilter = ref({
      professional_id: "",
      professional_group_id: "",
    });

    // form validation
    const formRef = ref<any>(null);
    const formRules = computed(() => {
      if (isEditMode.value) {
        return {};
      }
      return {
        person_id: {
          required: true,
          message: 'Person wajib diisi',
          trigger: ['blur', 'change'],
        },
        employee_category_id: {
          required: true,
          message: 'Kategori pegawai wajib diisi',
          trigger: ['blur', 'change'],
        },
        professional_id: {
          required: true,
          message: 'Profesi wajib diisi',
          trigger: ['blur', 'change'],
        },
        organization_id: {
          required: true,
          message: 'Unit kerja wajib diisi',
          trigger: ['blur', 'change'],
        },
        tags: {
          required: true,
          type: 'array' as const,
          message: 'Tags wajib diisi',
          trigger: ['blur', 'change'],
        },
      };
    });

    // modal methods
    const openAddModal = () => {
      isEditMode.value = false;
      fetchPositionOptions("0");
      formData.value = {
        id: null,
        person_id: "",
        national_employee_id_number: "",
        employee_category_id: "",
        professional_id: "",
        organization_id: "",
        position_id: null,
        functional_id: null,
        address: "",
        tags: "",
        is_active: true, // default aktif
        is_shift: false,
      };
      isModalOpen.value = true;
    };

    const openEditModal = (row: any) => {
      isPreviewOpen.value = false;
      isEditMode.value = true;

      fetchPositionOptions(row.organization_id);

      formData.value = {
        ...row,
        // ✅ STRING → ARRAY
        tags: row.tags ? String(row.tags).split(",") : [],
        is_active: !!row.is_active,
      };

      // // Load pre-selected employees into options so the select shows their name
      // if (row.functional_id) {
      //   functionalOptions.value = [
      //     {
      //       label: row.functional_name || `ID: ${row.functional_id}`,
      //       value: Number(row.functional_id),
      //     },
      //   ];
      // }

      isModalOpen.value = true;
    };

    const resetFaceDescription = (row: any) => {
      dialog.warning({
        title: "Konfirmasi Reset Wajah",
        content: `Apakah Anda yakin ingin mereset data wajah pegawai ${row.name}?`,
        positiveText: "Ya",
        negativeText: "Tidak",

        async onPositiveClick() {
          try {
            const payload = {
              PersonId: row.person_id,
            };

            const response = await apiFetch(
              `${Config.UrlBackend}/api/attendance/reset-face`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              },
            );

            if (!response.ok) {
              const errorData = await response.json().catch(() => null);
              throw new Error(errorData?.message ?? "Reset wajah gagal");
            }

            message.success("Wajah berhasil direset");
          } catch (err: any) {
            message.error(err.message);
          }
        },
      });
    };

    const openProfile = (row: any) => {
      isModalOpen.value = false;
      formData.value = { ...row };
      isPreviewOpen.value = true;
    };

    const closeModal = () => {
      isModalOpen.value = false;
    };

    // table & pagination
    const handleInputSearch = () => {
      fetchData(current.value);
      showDropdown.value = !showDropdown.value;
    };

    // sampai di sini

    // form submit
    const submitForm = async () => {
      if (!token) {
        console.error("No token found!");
        return;
      }

      // ✅ VALIDASI FORM SEBELUM SUBMIT
      try {
        await formRef.value?.validate();
      } catch (e) {
        message.error("Harap lengkapi semua isian yang wajib diisi.");
        return;
      }

      loading.value = true;

      try {
        const url = isEditMode.value
          ? `${Config.UrlBackend}/api/employee/update`
          : `${Config.UrlBackend}/api/employee/create`;

        //--------------------------------------------------
        // BUILD PAYLOAD
        //--------------------------------------------------
        let payload: any;

        if (isEditMode.value) {
          payload = { ...formData.value };
        } else {
          const { id, ...withoutId } = formData.value;
          payload = withoutId;
        }

        //--------------------------------------------------
        // ✅ CONVERT TAGS ARRAY → STRING
        //--------------------------------------------------
        payload.tags = Array.isArray(formData.value.tags)
          ? formData.value.tags.join(",")
          : null;

        //--------------------------------------------------
        // OPTIONAL USERLOGIN
        //--------------------------------------------------
        payload.UserLogin = employee;

        //--------------------------------------------------
        // API CALL
        //--------------------------------------------------
        const response = await apiFetch(url, {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        message.success(
          data.message ||
            (isEditMode.value ? "Data diperbarui" : "Data ditambahkan"),
        );

        await fetchData(current.value);
        isModalOpen.value = false;
      } catch (error) {
        console.error(error);
        message.error("Terjadi kesalahan saat menyimpan data");
      } finally {
        loading.value = false;
      }
    };

    // table columns
    const columns = [
      {
        title: "Name",
        key: "name",
        width: 180,
        fixed: "left",
        render: (row: any) => {
          const front = row.front_title
            ? `${row.front_title.replace(/\.$/, "")}.`
            : "";

          const name = row.name ?? "";

          const end = row.end_title ? `, ${row.end_title}` : "";

          return [front, name].filter(Boolean).join(" ") + end;
        },
      },
      {
        title: "Aksi",
        key: "actions",
        width: 150,
        render(row: any) {
          return h("div", { class: "flex gap-2" }, [
            h(
              NButton,
              {
                size: "small",
                type: "primary",
                onClick: () => openEditModal(row),
              },
              { default: () => "Ubah" },
            ),
            h(
              NButton,
              {
                size: "small",
                type: "success",
                onClick: () => openProfile(row),
              },
              { default: () => "Lihat Profil" },
            ),
            h(
              NButton,
              {
                size: "small",
                type: "warning",
                onClick: () => resetFaceDescription(row),
              },
              { default: () => "Reset Wajah" },
            ),
          ]);
        },
      },
      { title: "EmployeeId", key: "id" },
      { title: "NIP", key: "national_employee_id_number" },
      {
        title: "Status Pegawai",
        key: "employee_category_name",
        render: (row: any) =>
          getEmployeeCategoryLabel(row.employee_category_id),
      },
      {
        title: "Jabatan profesi",
        key: "professional_name",
        render: (row: any) => getProfessionalLabel(row.professional_id),
      },
      {
        title: "Unit kerja",
        key: "organization_name",
        render: (row: any) => getOrganizationLabel(row.organization_id),
      },
      {
        title: "Jabatan manajerial",
        key: "position_name",
        render: (row: any) => getPositionLabel(row.position_id),
      },
      { title: "Tag", key: "tags" },
      { title: "PersonId", key: "person_id" },
      { title: "NIK", key: "national_id_number" },
      { title: "Tgl Lahir", key: "birth_date" },
      { title: "JKel", key: "gender" },
      { title: "Alamat", key: "address" },
      { title: "Phone", key: "phone_number" },
      { title: "Email", key: "email" },
      {
        title: "Status",
        key: "is_active",
        width: 120,
        render(row: any) {
          return row.is_active ? "✅ Aktif" : "❌ Nonaktif";
        },
      },
    ];

    // load pertama kali
    onMounted(() => {
      fetchEmployeeCategoryOptions();
      fetchOrganizationOptions();
      fetchProfessionalOptions();
      fetchFunctionalOptions();
      fetchTagOptions();
      fetchPositionOptions(organizationId);
      fetchData(current.value);
    });

    return {
      columns,
      tableData,
      current,
      pageSize,
      total,
      loading,
      inputSearch,
      handleInputSearch,
      employeeCategoryFilter,
      handleCategoryFilter,
      handleInputSearchPerson,
      personOptions,
      personLoading,
      onOrgSelected: (orgId: string | number | null) => {
        selectedOrgId.value = orgId;
        fetchData(current.value);
      },
      isPreviewOpen,
      isModalOpen,
      isEditMode,
      formRef,
      formRules,
      formData,
      openAddModal,
      openEditModal,
      openProfile,
      closeModal,
      submitForm,
      genderOptions,
      employee,
      formDataFilter,
      statusOptions,
      handleStatusFilter,
      isActiveFilter,
      employeeCategoryOptions,
      fetchEmployeeCategoryOptions,
      organizationOptions,
      fetchOrganizationOptions,
      positionOptions,
      fetchPositionOptions,
      professionalOptions,
      fetchProfessionalOptions,
      onOrganizationChange,
      tagOptions,
      fetchTagOptions,
      fetchFunctionalOptions,
      functionalOptions,
    };
  },
});
