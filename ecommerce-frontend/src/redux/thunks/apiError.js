export const getApiError = (error) =>
  error.response?.data?.message ||
  error.message ||
  'The request could not be completed. Please try again.'
