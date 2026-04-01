import request from '@/utils/http'

export interface UploadResult {
  url: string
  name: string
}

interface UploadResponse {
  url?: string
  data?: { url: string; name?: string }
}


export function uploadImage(file: File): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)

  return request.post<UploadResponse>({
    url: '/app/admin/upload/image',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(res => {

    if (res.data?.url) {
      return { url: res.data.url, name: res.data.name || file.name }
    }
    if (res.url) {
      return { url: res.url, name: file.name }
    }
    return { url: '', name: file.name }
  })
}
