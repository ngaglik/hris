export const Config = {
  AppId: import.meta.env.VITE_APP_ID,
  UrlBackend: import.meta.env.VITE_BACKEND_URL,
  TokenName: import.meta.env.VITE_TOKEN_NAME,
  SessionName: import.meta.env.VITE_SESSION_NAME,
};

export const generalOptions = {
  year: [
    { label: "2025", value: 2025 },
    { label: "2026", value: 2026 },
    { label: "2027", value: 2027 },
  ],
  month: [
    { label: "Januari", value: 1 },
    { label: "Pebruari", value: 2 },
    { label: "Maret", value: 3 },
    { label: "April", value: 4 },
    { label: "Mei", value: 5 },
    { label: "Juni", value: 6 },
    { label: "Juli", value: 7 },
    { label: "Agustus", value: 8 },
    { label: "September", value: 9 },
    { label: "Oktober", value: 10 },
    { label: "Nopember", value: 11 },
    { label: "Desember", value: 12 },
  ],
};

export const dictHari = new Map<string, string>([
  ["Sunday", "Minggu"],
  ["Monday", "Senin"],
  ["Tuesday", "Selasa"],
  ["Wednesday", "Rabu"],
  ["Thursday", "Kamis"],
  ["Friday", "Jumat"],
  ["Saturday", "Sabtu"],
]);

/** Pemetaan warna per schedule_type_id sesuai master data hr.schedule_type */
export const scheduleTypeStyle: Record<
  number,
  { bg: string; color: string; border: string; dot: string }
> = {
  1: { bg: "#f6ffed", color: "#389e0d", border: "#52c41a", dot: "#52c41a" }, // Masuk
  2: { bg: "#e6f7ff", color: "#096dd9", border: "#1890ff", dot: "#1890ff" }, // Sakit
  3: { bg: "#e6fffb", color: "#08979c", border: "#13c2c2", dot: "#13c2c2" }, // Ijin
  4: { bg: "#f9f0ff", color: "#531dab", border: "#722ed1", dot: "#722ed1" }, // Cuti
  5: { bg: "#f5f5f5", color: "#595959", border: "#d9d9d9", dot: "#8c8c8c" }, // Libur
  6: { bg: "#fff7e6", color: "#d46b08", border: "#fa8c16", dot: "#fa8c16" }, // Dinas luar
  7: { bg: "#e6fffb", color: "#006d75", border: "#08979c", dot: "#08979c" }, // WFH
  8: { bg: "#fff0f6", color: "#c41d7f", border: "#eb2f96", dot: "#eb2f96" }, // Cuti Melahirkan
};
