/**
 * Utilidades de fecha compartidas por los stores y, más adelante,
 * por los componentes que muestran fechas en pantalla (Home, modal, etc).
 */

/**
 * Devuelve el mes actual en formato "YYYY-MM", tal como lo espera
 * el campo `fechaInicio` / `fechaFin` del modelo `Juego`.
 */
export function mesActual(): string {
  const ahora = new Date()
  const año = ahora.getFullYear()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  return `${año}-${mes}`
}

const NOMBRES_MES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

/**
 * Formatea un mes en formato "YYYY-MM" como "Ene 2024" para mostrar en UI
 * (timeline de Home, período de juego en el modal de edición, etc).
 * Devuelve la cadena original si no matchea el formato esperado.
 */
export function formatearMes(mesISO: string): string {
  const partes = mesISO.split('-')
  if (partes.length !== 2) return mesISO
  const [añoStr, mesStr] = partes
  const indiceMes = Number(mesStr) - 1
  if (Number.isNaN(indiceMes) || indiceMes < 0 || indiceMes > 11) return mesISO
  return `${NOMBRES_MES[indiceMes]} ${añoStr}`
}

/**
 * Formatea un timestamp ISO completo (fechaAgregado) como "Ene 2024".
 */
export function formatearFechaAgregado(fechaISO: string): string {
  const fecha = new Date(fechaISO)
  if (Number.isNaN(fecha.getTime())) return fechaISO
  return `${NOMBRES_MES[fecha.getMonth()]} ${fecha.getFullYear()}`
}

/**
 * Formatea el período de juego para el timeline de Home, ej.:
 * "Ene 2024 - Mar 2024" o "Ene 2024 - Actualidad" si `fechaFin` es null.
 */
export function formatearPeriodoJuego(fechaInicio: string, fechaFin: string | null): string {
  const inicio = fechaInicio ? formatearMes(fechaInicio) : '—'
  const fin = fechaFin ? formatearMes(fechaFin) : 'Actualidad'
  return `${inicio} - ${fin}`
}
