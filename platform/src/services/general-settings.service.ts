import { http } from '@/lib/http'

export interface GeneralSettings {
  id: number
  therapySessionDurationMinutes: number
}

export const generalSettingsService = {
  get: () =>
    http.get<GeneralSettings>('/settings/general').then((response) => response.data),

  update: (therapySessionDurationMinutes: number) =>
    http
      .patch<GeneralSettings>('/settings/general', {
        therapySessionDurationMinutes,
      })
      .then((response) => response.data),
}
