import { RawTest } from '@/types/content'
import { APP_CONFIG } from '@/config/constants'
import { StorageService } from './storage.service'

export interface CustomTestRepository {
  getAll(): RawTest[]
  save(test: RawTest): void
  delete(id: string): void
}

class LocalCustomTestRepository implements CustomTestRepository {
  getAll(): RawTest[] {
    return StorageService.getItem<RawTest[]>(APP_CONFIG.storageKeys.customTests, [])
  }

  save(test: RawTest): void {
    const tests = this.getAll().filter((item) => item.id !== test.id)
    StorageService.setItem(APP_CONFIG.storageKeys.customTests, [...tests, test])
  }

  delete(id: string): void {
    StorageService.setItem(APP_CONFIG.storageKeys.customTests, this.getAll().filter((test) => test.id !== id))
  }
}

export const customTestRepository: CustomTestRepository = new LocalCustomTestRepository()
