import type { EstadoJuego } from '@/types'
import type { BadgeProps } from '@/components/ui/badge'

/**
 * Elige la variante de color del Badge según el estado del juego.
 * Centralizado acá para que Home, Backlog y cualquier otra pantalla
 * futura (ej. Top 100) muestren el mismo criterio visual.
 */
export function varianteBadgeEstado(estado: EstadoJuego): BadgeProps['variant'] {
  switch (estado) {
    case 'Jugando':
      return 'default'
    case 'Completado':
      return 'success'
    case 'Abandonado':
      return 'destructive'
    case 'Backlog':
      return 'secondary'
    default:
      return 'outline'
  }
}
