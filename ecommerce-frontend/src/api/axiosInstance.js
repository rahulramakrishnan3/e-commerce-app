import axios from 'axios'

export const AUTH_TOKEN_KEY = 'knit-and-thread-token'
export const AUTH_SESSION_EXPIRED_EVENT = 'knit-and-thread:session-expired'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url
    const isAuthenticationRequest =
      requestUrl === '/auth/login' || requestUrl === '/auth/register'

    if (error.response?.status === 401 && !isAuthenticationRequest) {
      window.localStorage.removeItem(AUTH_TOKEN_KEY)
      window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT))
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
