import { APP_CONFIG } from '@/config/constants'

interface StorageEnvelope<T> {
  version: number
  data: T
}

/** Client-side storage with versioned values and safe fallbacks. */
export class StorageService {
  static getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue
    const legacyKey = key.replace(/_v\d+$/, '')
    const currentRaw = window.localStorage.getItem(key)
    const sourceKey = currentRaw === null ? legacyKey : key
    const raw = currentRaw === null ? window.localStorage.getItem(legacyKey) : currentRaw
    if (raw === null) return defaultValue

    try {
      const parsed: unknown = JSON.parse(raw)
      if (isStorageEnvelope<T>(parsed)) {
        if (parsed.version !== APP_CONFIG.storageSchemaVersion) {
          window.localStorage.removeItem(sourceKey)
          return defaultValue
        }
        if (Array.isArray(defaultValue) && !Array.isArray(parsed.data)) {
          window.localStorage.removeItem(sourceKey)
          return defaultValue
        }
        return parsed.data
      }

      // Migrate the unversioned v0 shape once it is successfully parsed.
      this.setItem(key, parsed as T)
      if (sourceKey !== key) window.localStorage.removeItem(sourceKey)
      if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
        window.localStorage.removeItem(key)
        return defaultValue
      }
      return parsed as T
    } catch (error) {
      console.warn(`[StorageService] Failed to read key "${sourceKey}":`, error)
      window.localStorage.removeItem(sourceKey)
      return defaultValue
    }
  }

  static setItem<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined') return false
    try {
      const envelope: StorageEnvelope<T> = {
        version: APP_CONFIG.storageSchemaVersion,
        data: value,
      }
      window.localStorage.setItem(key, JSON.stringify(envelope))
      return true
    } catch (error) {
      console.warn(`[StorageService] Failed to write key "${key}":`, error)
      return false
    }
  }

  static removeItem(key: string): boolean {
    if (typeof window === 'undefined') return false
    try {
      window.localStorage.removeItem(key)
      return true
    } catch (e) {
      console.warn(`[StorageService] Failed to remove key "${key}":`, e)
      return false
    }
  }

  static clearLocalData(): void {
    if (typeof window === 'undefined') return
    Object.values(APP_CONFIG.storageKeys).forEach((key) => this.removeItem(key))
  }

  static clearAll(): void {
    this.clearLocalData()
  }
}

function isStorageEnvelope<T>(value: unknown): value is StorageEnvelope<T> {
  return typeof value === 'object' && value !== null && 'version' in value && 'data' in value
}
