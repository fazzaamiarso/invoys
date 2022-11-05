export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return JSON.stringify(error);
}
