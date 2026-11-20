export const LAYOUT_ITEMS = [
  {
    label: "Presensi",
    key: "/Attendance",
  },
  {
    label: "Profile",
    key: "/Profile",
  },
  {
    label: "Performance Individu",
    key: "/PerformanceIndividu",
    children: [
      {
        label: "Dashboard",
        key: "/DashboardPerformance",
      },
      {
        label: "Entri Kinerja",
        key: "/EntriKinerja",
      },
      {
        label: "Rekap Kinerja",
        key: "/RekapKinerja",
      },
      {
        label: "Master Indikator",
        key: "/MasterIndikator",
      },
      {
        label: "Mapping Indikator",
        key: "/MappingIndikator",
      },
    ],
  },
  {
    label: "Administrator",
    key: "/administrator",
    children: [
      {
        label: "Kepegawaian",
        key: "/profilehumanresource",
        children: [
          {
            label: "Dashboard",
            key: "/EmployeeSummaryUnitCategory",
          },
          {
            label: "Data Personal",
            key: "/person",
          },
          {
            label: "Data Pegawai",
            key: "/employee",
          },
          {
            label: "Verifikasi Absensi",
            key: "/AbsenceVerification",
          },
          {
            label: "Report Presensi",
            key: "/AttendanceReport",
          },
        ],
      },
      {
        label: "Referensi",
        key: "/references",
        children: [
          {
            label: "Organisasi",
            key: "/organization",
          },
          {
            label: "Jabatan Manajerial",
            key: "/position",
          },
          {
            label: "Jabatan Profesi",
            key: "/professional",
          },
          {
            label: "Status kepegawaian",
            key: "/EmployeeCategory",
          },
          {
            label: "Lokasi",
            key: "location",
          },
          {
            label: "Pendidikan",
            key: "graduation",
          },
          {
            label: "Agama",
            key: "religion",
          },
        ],
      },
      {
        label: "Alat",
        key: "/",
        children: [
          {
            label: "Generator Sertifikat",
            key: "/CertificateGeneratorPDF",
          },
        ],
      },
    ],
  },
];
