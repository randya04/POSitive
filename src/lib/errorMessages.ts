export const errorMessages: Record<string, string> = {
  "auth/invalid-credentials": "Email o contraseña incorrectos.",
  "auth/user-not-found": "No existe una cuenta con ese correo.",
  "auth/network-request-failed": "Fallo de red. Por favor, revisa tu conexión.",
  // Supabase: Límite de invitaciones por email excedido (código 429)
  "auth/over_email_send_rate_limit": "Has superado el límite de envíos de invitaciones. Por favor espera unos minutos e intenta de nuevo.",
  // ...otros códigos o claves genéricas
}

export function getErrorMessage(code?: string): string {
  if (code && errorMessages[code]) {
    return errorMessages[code]
  }
  return "Ha ocurrido un error inesperado. Intenta de nuevo más tarde."
}
