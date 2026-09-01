import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Star, Search } from 'lucide-react'
import { useLibraryStore, MAX_FAVORITOS } from '@/store'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface FavoriteManagerDialogProps {
  abierto: boolean
  onCambiarAbierto: (abierto: boolean) => void
}

export function FavoriteManagerDialog({ abierto, onCambiarAbierto }: FavoriteManagerDialogProps) {
  const juegos = useLibraryStore((state) => state.juegos)
  const toggleFavorito = useLibraryStore((state) => state.toggleFavorito)
  const contarFavoritos = useLibraryStore((state) => state.contarFavoritos)

  const [busqueda, setBusqueda] = useState('')

  const juegosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    const base = termino
      ? juegos.filter((juego) => juego.titulo.toLowerCase().includes(termino))
      : juegos
    return [...base].sort((a, b) => {
      if (a.esFavorito !== b.esFavorito) return a.esFavorito ? -1 : 1
      return a.titulo.localeCompare(b.titulo)
    })
  }, [juegos, busqueda])

  function manejarToggle(id: number) {
    const pudoAlternar = toggleFavorito(id)
    if (!pudoAlternar) {
      toast.warning(`Ya tenés ${MAX_FAVORITOS} juegos favoritos. Quitá alguno antes de agregar otro.`)
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={onCambiarAbierto}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Gestionar favoritos</DialogTitle>
          <DialogDescription>
            {contarFavoritos()}/{MAX_FAVORITOS} favoritos seleccionados.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar en tu biblioteca…"
            className="pl-9"
          />
        </div>

        <div className="max-h-96 space-y-1 overflow-y-auto">
          {juegos.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Todavía no tenés juegos en tu biblioteca.
            </p>
          ) : juegosFiltrados.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No se encontraron juegos con ese nombre.
            </p>
          ) : (
            juegosFiltrados.map((juego) => (
              <button
                key={juego.id}
                type="button"
                onClick={() => manejarToggle(juego.id)}
                className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent"
              >
                {juego.caratula ? (
                  <img
                    src={juego.caratula}
                    alt=""
                    className="h-12 w-9 shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="h-12 w-9 shrink-0 rounded bg-secondary" />
                )}
                <span className="min-w-0 flex-1 truncate text-sm">{juego.titulo}</span>
                <Star
                  className={cn(
                    'h-4 w-4 shrink-0',
                    juego.esFavorito ? 'fill-primary text-primary' : 'text-muted-foreground'
                  )}
                />
              </button>
            ))
          )}
        </div>

        <div className="flex justify-end border-t border-border pt-4">
          <Button type="button" onClick={() => onCambiarAbierto(false)}>
            Listo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}