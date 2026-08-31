import { Loader2, Plus, Check, ImageOff, AlertCircle } from 'lucide-react'
import type { ResultadoBusquedaJuego } from '@/types'

interface SearchResultsDropdownProps {
  visible: boolean
  cargando: boolean
  error: string | null
  resultados: ResultadoBusquedaJuego[]
  existeJuego: (id: number) => boolean
  onSeleccionar: (juego: ResultadoBusquedaJuego) => void
}

/**
 * Dropdown de resultados del buscador global (Navbar). Puramente
 * presentacional: la lógica de debounce, fetch y estado vive en Navbar.
 */
export function SearchResultsDropdown({
  visible,
  cargando,
  error,
  resultados,
  existeJuego,
  onSeleccionar,
}: SearchResultsDropdownProps) {
  if (!visible) return null

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg animate-fade-in">
      {cargando && (
        <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Buscando juegos…
        </div>
      )}

      {!cargando && error && (
        <div className="flex items-center gap-2 px-4 py-4 text-sm text-destructive-foreground">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!cargando && !error && resultados.length === 0 && (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
          No se encontraron juegos.
        </p>
      )}

      {!cargando && !error && resultados.length > 0 && (
        <ul className="divide-y divide-border">
          {resultados.map((juego) => {
            const yaAñadido = existeJuego(juego.id)
            return (
              <li key={juego.id}>
                <button
                  type="button"
                  onClick={() => onSeleccionar(juego)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent"
                >
                  {juego.caratula ? (
                    <img
                      src={juego.caratula}
                      alt=""
                      className="h-14 w-10 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded bg-secondary">
                      <ImageOff className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{juego.titulo}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {juego.año ?? 'Año desconocido'}
                      {juego.generos.length > 0 ? ` · ${juego.generos.join(', ')}` : ''}
                    </p>
                  </div>

                  {yaAñadido ? (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}