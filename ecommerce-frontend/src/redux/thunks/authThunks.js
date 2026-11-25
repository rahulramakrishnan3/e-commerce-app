import { createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance, { AUTH_TOKEN_KEY } from '../../api/axiosInstance.js'
import { getApiError } from './apiError.js'

const saveSession = (data) => {
  if (!data?.token || !data?.user) {
    throw new Error('The server returned an incomplete authentication response.')
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, data.token)
  return { token: data.token, user: data.user }
}

export const registerUser = createAsyncThunk(
  'auth/register',
  async (details, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/auth/register', details)
      return saveSession(data)
    } catch (error) {
      return rejectWithValue(getApiError(error))
    }
  },
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/auth/login', credentials)
      return saveSession(data)
    } catch (error) {
      return rejectWithValue(getApiError(error))
    }
  },
)

export const loadCurrentUser = createAsyncThunk(
  'auth/loadCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/profile/me')
      return data.user
    } catch (error) {
      return rejectWithValue({
        message: getApiError(error),
        status: error.response?.status,
      })
    }
  },
  {
    condition: (_, { getState }) => {
      const { token, isSessionChecked, isSessionLoading } = getState().auth
      return Boolean(token) && !isSessionChecked && !isSessionLoading
    },
  },
)
