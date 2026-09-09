import { Link } from 'react-router-dom'
import { useLibraryStore } from '@/store'
import { TimelineEntry } from '@/components/TimelineEntry'

/**
 * Home (`/`): timeline vertical con todos los juegos cuyo estado sea
 * distinto de 'Backlog', ordenados por `fechaAgregado` descendente
 * (los agregados más recientemente primero).
 */
export default function Home() {
  const juegos = useLibraryStore((state) => state.juegos)

  const entradas = juegos
    .filter((juego) => juego.estado !== 'Backlog')
    .sort((a, b) => new Date(b.fechaAgregado).getTime() - new Date(a.fechaAgregado).getTime())

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Tu actividad</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Los juegos que estás jugando, completaste o abandonaste, del más reciente al más antiguo.
      </p>

      {entradas.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Todavía no tenés juegos en progreso. Empezá alguno desde tu{' '}
          <Link to="/backlog" className="text-primary hover:underline">
            Backlog
          </Link>
          .
        </p>
      ) : (
        <div className="relative mt-6 space-y-6 before:absolute before:bottom-0 before:left-[94px] before:top-0 before:w-px before:bg-border">
          {entradas.map((juego) => (
            <TimelineEntry key={juego.id} juego={juego} />
          ))}
        </div>
      )}
    </div>
  )
}
