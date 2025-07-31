import { Config } from '@/constant/config'


export const ProfessionalOption = async () => {
  const token = localStorage.getItem(Config.TokenName)
  const session = localStorage.getItem(Config.SessionName)

  try {
    const response = await fetch(Config.UrlBackend + '/api/option/professional', {
      headers: {
        Authorization: `Bearer ${token}`,
        uSession: `${session}`
      }
    })

    const result = await response.json()
    const data = result.data // asumsi respons seperti { data: [...] }

    if (!Array.isArray(data)) {
      console.warn('Data bukan array:', data)
      return []
    }

    return data.map((item: any) => ({
      label: item.professional_name,
      value: item.id
    }))
  } catch (error) {
    console.error('Gagal memuat data professional:', error)
    return []
  }
}




export const OrganizationOption = async () => {
  const token = localStorage.getItem(Config.TokenName)
  const session = localStorage.getItem(Config.SessionName)

  try {
    const response = await fetch(Config.UrlBackend + '/api/option/organization', {
      headers: {
        Authorization: `Bearer ${token}`,
        uSession: `${session}`
      }
    })

    const result = await response.json()
    const data = result.data // asumsi respons seperti { data: [...] }

    if (!Array.isArray(data)) {
      console.warn('Data bukan array:', data)
      return []
    }

    return data.map((item: any) => ({
      label: item.name,
      value: item.id
    }))
  } catch (error) {
    console.error('Gagal memuat data professional:', error)
    return []
  }
}

export const ProfessionalGroupOption = async () => {
  const token = localStorage.getItem(Config.TokenName)
  const session = localStorage.getItem(Config.SessionName)

  try {
    const response = await fetch(Config.UrlBackend + '/api/option/professional_group', {
      headers: {
        Authorization: `Bearer ${token}`,
        uSession: `${session}`
      }
    })

    const result = await response.json()
    const data = result.data // asumsi respons seperti { data: [...] }

    if (!Array.isArray(data)) {
      console.warn('Data bukan array:', data)
      return []
    }

    return data.map((item: any) => ({
      label: item.name,
      value: item.id
    }))
  } catch (error) {
    console.error('Gagal memuat data professional:', error)
    return []
  }
}

