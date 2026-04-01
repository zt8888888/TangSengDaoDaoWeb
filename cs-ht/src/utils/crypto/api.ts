

import CryptoJS from 'crypto-js'

const API_KEY = 'QD2024SecretKey1234567890ABCDEF0'

const API_IV = 'QD2024IV12345678'

export function apiEncrypt(data: any): string {
  try {
    const json = JSON.stringify(data)
    const key = CryptoJS.enc.Utf8.parse(API_KEY)
    const iv = CryptoJS.enc.Utf8.parse(API_IV)

    const encrypted = CryptoJS.AES.encrypt(json, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })

    return encrypted.ciphertext.toString(CryptoJS.enc.Base64)
  } catch (error) {
    console.error('[API Crypto] 加密失败:', error)
    throw error
  }
}

export function apiDecrypt(encryptedData: string): any {
  try {
    const key = CryptoJS.enc.Utf8.parse(API_KEY)
    const iv = CryptoJS.enc.Utf8.parse(API_IV)

    const ciphertext = CryptoJS.enc.Base64.parse(encryptedData)

    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: ciphertext
    })

    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })

    const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8)

    if (!decryptedStr) {
      console.error('[API Crypto] 解密结果为空')
      return null
    }

    return JSON.parse(decryptedStr)
  } catch (error) {
    console.error('[API Crypto] 解密失败:', error, 'Data:', encryptedData?.substring(0, 100))
    return null
  }
}

export function isEncryptedResponse(headers: any): boolean {
  return headers?.['x-encrypted'] === '1'
}

