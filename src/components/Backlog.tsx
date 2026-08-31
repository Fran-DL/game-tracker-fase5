import { useLibraryStore } from '@/store'
import { GameCard } from '@/components/GameCard'

/**
 * Backlog (`/backlog`): grid de tarjetas con todos los juegos cuyo
 * estado sea 'Backlog'. Cada tarjeta permite "Empezar" (pasa a 'Jugando')
 * o abrir el modal de edición completo.
 */
export default function Backlog() {
  const juegos = useLibraryStore((state) => state.juegos)
  const backlog = juegos.filter((juego) => juego.estado === 'Backlog')

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Backlog</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Juegos pendientes de empezar. {backlog.length} en total.
      </p>

      {backlog.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Tu backlog está vacío. Agregá juegos desde el Top 100 o el buscador.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {backlog.map((juego) => (
            <GameCard key={juego.id} juego={juego} />
          ))}
        </div>
      )}
    </div>
  )
}
