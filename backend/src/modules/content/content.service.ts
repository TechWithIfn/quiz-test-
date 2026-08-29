import { contentRepository, type ContentGovernance } from './content.repository.js'

export const contentService = {
  async getGovernance(): Promise<ContentGovernance> {
    return contentRepository.getGovernance()
  },
}
