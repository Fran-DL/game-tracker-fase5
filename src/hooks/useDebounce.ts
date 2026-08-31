import { useEffect, useState } from 'react'

/**
 * Devuelve una versión "debounced" de `valor`: solo se actualiza después de
 * que pasen `delayMs` milisegundos sin que `valor` vuelva a cambiar.
 * Lo usa el buscador global de la Navbar para no disparar una petición a
 * IGDB en cada tecla.
 */
export function useDebounce<T>(valor: T, delayMs: number): T {
  const [valorDebounced, setValorDebounced] = useState(valor)

  useEffect(() => {
    const temporizador = setTimeout(() => setValorDebounced(valor), delayMs)
    return () => clearTimeout(temporizador)
  }, [valor, delayMs])

  return valorDebounced
}