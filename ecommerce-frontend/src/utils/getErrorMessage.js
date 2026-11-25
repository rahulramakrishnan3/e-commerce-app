export function getErrorMessage(error, fallback = 'Something went wrong.') {
  if (typeof error === 'string') {
    return error
  }
  return error?.message || fallback
}
