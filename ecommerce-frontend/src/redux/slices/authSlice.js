import { createSlice } from '@reduxjs/toolkit'
import { AUTH_TOKEN_KEY } from '../../api/axiosInstance.js'
import {
  loadCurrentUser,
  loginUser,
  registerUser,
} from '../thunks/authThunks.js'

const storedToken = window.localStorage.getItem(AUTH_TOKEN_KEY)

const initialState = {
  user: null,
  token: storedToken,
  isSessionChecked: !storedToken,
  isSessionLoading: false,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null
    },
    sessionCleared(state) {
      state.user = null
      state.token = null
      state.isSessionChecked = true
      state.isSessionLoading = false
      state.isLoading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    const setSession = (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isSessionChecked = true
      state.isSessionLoading = false
      state.isLoading = false
      state.error = null
    }

    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, setSession)
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, setSession)
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
      })
      .addCase(loadCurrentUser.pending, (state) => {
        state.isSessionLoading = true
        state.error = null
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.isSessionChecked = true
        state.isSessionLoading = false
      })
      .addCase(loadCurrentUser.rejected, (state, action) => {
        state.isSessionChecked = true
        state.isSessionLoading = false
        if (action.payload?.status === 401) {
          state.user = null
          state.token = null
        }
        state.error = action.payload?.message || action.error.message
      })
  },
})

export const { clearAuthError, sessionCleared } = authSlice.actions
export const logoutUser = () => (dispatch) => {
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  dispatch(sessionCleared())
}
export const selectCurrentUser = (state) => state.auth.user
export const selectAuthToken = (state) => state.auth.token
export const selectIsAuthenticated = (state) =>
  Boolean(state.auth.token && state.auth.user)
export const selectAuthError = (state) => state.auth.error
export default authSlice.reducer
