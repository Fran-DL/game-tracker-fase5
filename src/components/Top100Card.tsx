import { useNavigate } from 'react-router-dom'
import type { MouseEvent } from 'react'
import { Plus, Check } from 'lucide-react'
import { toast } from 'sonner'
import type { ResultadoBusquedaJuego } from '@/types'
import { useLibraryStore } from '@/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Top100CardProps {
  juego: ResultadoBusquedaJuego
}

/**
 * Tarjeta de juego usada en el grid del Top 100.
 *
 * Clickear la tarjeta navega siempre a `/juego/:id` (esté o no en la
 * biblioteca); el botón "Añadir" agrega directo al backlog sin navegar,
 * cortando la propagación del click.
 */
export function Top100Card({ juego }: Top100CardProps) {
  const navigate = useNavigate()
  const existeJuego = useLibraryStore((state) => state.existeJuego)
  const agregarJuego = useLibraryStore((state) => state.agregarJuego)
  const yaAñadido = existeJuego(juego.id)

  function manejarAgregar(evento: MouseEvent) {
    evento.stopPropagation()
    if (yaAñadido) return
    agregarJuego(juego)
    toast.success(`"${juego.titulo}" se agregó a tu Backlog.`)
  }

  function manejarClickTarjeta() {
    navigate(`/juego/${juego.id}`)
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={manejarClickTarjeta}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') manejarClickTarjeta()
      }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:scale-[1.02] hover:shadow-md"
    >
      {yaAñadido && (
        <Badge variant="secondary" className="absolute left-2 top-2 z-10 shadow">
          Ya añadido
        </Badge>
      )}

      {juego.caratula ? (
        <img
          src={juego.caratula}
          alt={`Carátula de ${juego.titulo}`}
          className="aspect-[3/4] w-full object-cover"
        />
      ) : (
        <div className="flex aspect-[3/4] w-full items-center justify-center bg-secondary text-xs text-muted-foreground">
          Sin carátula
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug">{juego.titulo}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {juego.año ?? 'Año desconocido'}
          </p>
        </div>

        <Button
          type="button"
          variant={yaAñadido ? 'outline' : 'default'}
          size="sm"
          className="mt-auto"
          disabled={yaAñadido}
          onClick={manejarAgregar}
        >
          {yaAñadido ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {yaAñadido ? 'Ya añadido' : 'Añadir a mi biblioteca'}
        </Button>
      </div>
    </article>
  )
}