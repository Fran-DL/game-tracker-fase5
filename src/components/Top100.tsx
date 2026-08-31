import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, AlertCircle, Trophy } from 'lucide-react'
import { obtenerTop100, ErrorServicioIGDB } from '@/services'
import type { ResultadoBusquedaJuego } from '@/types'
import { cn } from '@/lib/utils'
import { Top100Card } from '@/components/Top100Card'
import { Button } from '@/components/ui/button'

const CANTIDAD_SKELETONS = 10

/** Placeholder animado mientras se cargan las carátulas del Top 100. */
function Top100CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-border bg-card">
      <div className="aspect-[3/4] w-full bg-secondary" />
      <div className="space-y-2 p-3">
        <div className="h-3.5 w-3/4 rounded bg-secondary" />
        <div className="h-3 w-1/2 rounded bg-secondary" />
        <div className="h-8 w-full rounded bg-secondary" />
      </div>
    </div>
  )
}

/**
 * Top 100 (`/top100`, Fase 7): los 100 juegos más populares de IGDB.
 *
 * `obtenerTop100` (services/juegos.ts) ya resuelve la caché de 24h en
 * localStorage; esta pantalla solo se preocupa de pedirlo, mostrar
 * loading/error, y renderizar el grid. "Actualizar" fuerza una petición
 * nueva ignorando la caché vigente.
 */
export default function Top100() {
  const [juegos, setJuegos] = useState<ResultadoBusquedaJuego[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async (forzarActualizacion: boolean) => {
    setCargando(true)
    setError(null)
    try {
      const resultado = await obtenerTop100({ forzarActualizacion })
      setJuegos(resultado)
    } catch (err) {
      setError(
        err instanceof ErrorServicioIGDB
          ? err.message
          : 'Ocurrió un error inesperado al cargar el Top 100.'
      )
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargar(false)
  }, [cargar])

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Trophy className="h-6 w-6 text-primary" />
            Top 100
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Los juegos más populares según IGDB. Se cachea 24 horas para no pedirlo de más.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => cargar(true)}
          disabled={cargando}
        >
          <RefreshCw className={cn('h-4 w-4', cargando && 'animate-spin')} />
          Actualizar
        </Button>
      </div>

      {error && (
        <div className="mt-6 flex items-center justify-between gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={() => cargar(false)}>
            Reintentar
          </Button>
        </div>
      )}

      {cargando ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: CANTIDAD_SKELETONS }).map((_, indice) => (
            <Top100CardSkeleton key={indice} />
          ))}
        </div>
      ) : !error && juegos.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No se encontraron juegos. Probá actualizar de nuevo.
        </p>
      ) : (
        !error && (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {juegos.map((juego) => (
              <Top100Card key={juego.id} juego={juego} />
            ))}
          </div>
        )
      )}
    </div>
  )
}