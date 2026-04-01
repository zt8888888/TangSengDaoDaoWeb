



import CryptoJS from 'crypto-js'


const SECRET_KEY = import.meta.env.VITE_CRYPTO_KEY || 'art-design-pro-secret-key-2024'
const ENCRYPTED_PREFIX = 'ENC:'



export function encrypt(data: string): string {
  if (!data) return ''
  try {
    const encrypted = CryptoJS.AES.encrypt(data, SECRET_KEY).toString()
    return ENCRYPTED_PREFIX + encrypted
  } catch (error) {
    console.error('[Crypto] 加密失败:', error)
    return data
  }
}



export function decrypt(encryptedData: string): string {
  if (!encryptedData) return ''
  try {

    const data = encryptedData.startsWith(ENCRYPTED_PREFIX)
      ? encryptedData.slice(ENCRYPTED_PREFIX.length)
      : encryptedData

    const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('[Crypto] 解密失败:', error)
    return encryptedData
  }
}



export function isEncrypted(data: string): boolean {
  return data?.startsWith(ENCRYPTED_PREFIX) ?? false
}



export function secureSetItem(key: string, value: string): void {
  try {
    const encrypted = encrypt(value)
    localStorage.setItem(key, encrypted)
  } catch (error) {
    console.error('[Crypto] 安全存储失败:', error)
  }
}



export function secureGetItem(key: string): string | null {
  try {
    const value = localStorage.getItem(key)
    if (!value) return null


    if (!isEncrypted(value)) {
      return value
    }

    return decrypt(value)
  } catch (error) {
    console.error('[Crypto] 安全读取失败:', error)
    return null
  }
}
