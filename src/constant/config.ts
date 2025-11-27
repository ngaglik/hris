export const Config = {
  AppId: import.meta.env.VITE_APP_ID,
  UrlBackend: import.meta.env.VITE_BACKEND_URL,
  TokenName: import.meta.env.VITE_TOKEN_NAME,
  SessionName: import.meta.env.VITE_SESSION_NAME
}

export const generalOptions = {
      year:[
        { label: '2025', value: 2025 },
        { label: '2026', value: 2026 },
        { label: '2027', value: 2027 }
      ],
      month:[
        { label: 'Januari', value: 1 },
        { label: 'Pebruari', value: 2 },
        { label: 'Maret', value: 3 },
        { label: 'April', value: 4 },
        { label: 'Mei', value: 5 },
        { label: 'Juni', value: 6 },
        { label: 'Juli', value: 7 },
        { label: 'Agustus', value: 8 },
        { label: 'September', value: 9 },
        { label: 'Oktober', value: 10 },
        { label: 'Nopember', value: 11 },
        { label: 'Desember', value: 12 }
      ]
}

export const dictHari = new Map<string, string>([ ["Sunday", "Minggu"], ["Monday", "Senin"], ["Tuesday", "Selasa"], ["Wednesday", "Rabu"], ["Thursday", "Kamis"], ["Friday", "Jumat"], ["Saturday", "Sabtu"], ]);