/**
 * Pull the backend's own message out of a failed request.
 *
 * The API returns `{ success: false, message }` with messages written to be
 * shown to a person ("Choose a size for 'Lavash': Regular, Large"). Surfacing
 * them verbatim tells the operator what to change; a generic failure does not.
 */
export function apiErrorMessage(err: unknown, fallback = 'Произошла ошибка'): string {
  const e = err as { response?: { data?: { message?: string } }; message?: string }
  return e?.response?.data?.message || e?.message || fallback
}
