import * as PulseShared from '@pulse/shared'

const configuration = new PulseShared.Configuration({
  basePath: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  fetchApi: fetch
})

export const authApi = new PulseShared.AuthApi(configuration)
export const monitorApi = new PulseShared.MonitorApi(configuration)