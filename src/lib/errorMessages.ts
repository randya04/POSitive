export const errorMessages: Record<string, string> = {
  "auth/invalid-credentials": "Email o contraseña incorrectos.",
  "auth/user-not-found": "No existe una cuenta con ese correo.",
  "auth/network-request-failed": "Fallo de red. Por favor, revisa tu conexión.",
  // ...otros códigos o claves genéricas
}

export function getErrorMessage(code?: string): string {
  if (code && errorMessages[code]) {
    return errorMessages[code]
  }
  return "Ha ocurrido un error inesperado. Intenta de nuevo más tarde."
}
