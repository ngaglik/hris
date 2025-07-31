import { idID as dateIdID } from 'naive-ui'
import { NLocale, NDateLocale } from 'naive-ui'

export const idID: NLocale = {
  name: 'id-ID',
  global: {
    undo: 'Batalkan',
    redo: 'Ulangi',
    confirm: 'Konfirmasi',
    clear: 'Bersihkan'
  },
  Popconfirm: {
    positiveText: 'Ya',
    negativeText: 'Tidak'
  },
  Cascader: {
    placeholder: 'Pilih'
  },
  Calendar: {
    sunday: 'Minggu',
    monday: 'Senin',
    tuesday: 'Selasa',
    wednesday: 'Rabu',
    thursday: 'Kamis',
    friday: 'Jumat',
    saturday: 'Sabtu',
    month: 'Bulan',
    year: 'Tahun',
    lastMonth: 'Bulan Lalu',
    nextMonth: 'Bulan Depan',
    lastYear: 'Tahun Lalu',
    nextYear: 'Tahun Depan'
  },
  DatePicker: {
    placeholder: 'Pilih tanggal',
    startPlaceholder: 'Tanggal awal',
    endPlaceholder: 'Tanggal akhir',
    // tambahkan lainnya sesuai kebutuhan
  },
  // tambahkan lebih banyak komponen jika dibutuhkan
}

export const dateId = dateIdID as NDateLocale
