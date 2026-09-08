import { useEffect, useState } from 'react'
import type { DuracionJuego } from '@/types'
import { obtenerDuracionJuego } from '@/services'

/**
 * Resuelve la duración estimada de un juego por su id de IGDB (con caché,
 * ver `services/juegos.ts`). Ante cualquier error simplemente no se
 * muestra nada: no es un dato crítico para navegar la biblioteca.
 */
export function useDuracionJuego(idJuego: number): { duracion: DuracionJuego | null; cargando: boolean } {
  const [duracion, setDuracion] = useState<DuracionJuego | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let cancelado = false
    setCargando(true)

    obtenerDuracionJuego(idJuego)
      .then((resultado) => {
        if (!cancelado) setDuracion(resultado)
      })
      .catch(() => {
        if (!cancelado) setDuracion(null)
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })

    return () => {
      cancelado = true
    }
  }, [idJuego])

  return { duracion, cargando }
}