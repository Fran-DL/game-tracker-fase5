import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import { Camera, X, Star, UserCircle, Trophy, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLibraryStore, useProfileStore } from '@/store'
import { abrirEdicionJuego } from '@/store/useGameEditDialogStore'
import { convertirArchivoABase64 } from '@/lib/imagen'
import { FavoriteManagerDialog } from '@/components/FavoriteManagerDialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'


/** Margen razonable para no llenar la cuota de localStorage con la foto en Base64. */
const LIMITE_TAMAÑO_FOTO_BYTES = 3 * 1024 * 1024

const JUEGOS_LOGROS_POR_PAGINA = 15

export default function Perfil() {
  const inputArchivoRef = useRef<HTMLInputElement>(null)
  const [gestorFavoritosAbierto, setGestorFavoritosAbierto] = useState(false)
  const [paginaLogros, setPaginaLogros] = useState(0)

  const nombreUsuario = useProfileStore((state) => state.nombreUsuario)
  const biografia = useProfileStore((state) => state.biografia)
  const fotoBase64 = useProfileStore((state) => state.fotoBase64)
  const setNombreUsuario = useProfileStore((state) => state.setNombreUsuario)
  const setBiografia = useProfileStore((state) => state.setBiografia)
  const setFotoBase64 = useProfileStore((state) => state.setFotoBase64)

  const juegos = useLibraryStore((state) => state.juegos)
  const toggleFavorito = useLibraryStore((state) => state.toggleFavorito)
  const favoritos = juegos.filter((juego) => juego.esFavorito).slice(0, 10)
  const juegosConLogros = juegos.filter((juego) => juego.logrosCompletos)
  const totalPaginasLogros = Math.max(1, Math.ceil(juegosConLogros.length / JUEGOS_LOGROS_POR_PAGINA))
  const juegosLogrosPagina = juegosConLogros.slice(
    paginaLogros * JUEGOS_LOGROS_POR_PAGINA,
    (paginaLogros + 1) * JUEGOS_LOGROS_POR_PAGINA
  )

  // Si se elimina un juego y la página actual queda vacía (ej. estabas en la
  // última página), retrocede automáticamente en vez de mostrar un grid vacío.
  useEffect(() => {
    if (paginaLogros > 0 && paginaLogros >= totalPaginasLogros) {
      setPaginaLogros(totalPaginasLogros - 1)
    }
  }, [paginaLogros, totalPaginasLogros])

  async function manejarSeleccionArchivo(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!archivo) return

    if (!archivo.type.startsWith('image/')) {
      toast.error('Elegí un archivo de imagen válido.')
      return
    }
    if (archivo.size > LIMITE_TAMAÑO_FOTO_BYTES) {
      toast.error('La imagen es muy pesada. Elegí una de hasta 3 MB.')
      return
    }

    try {
      const base64 = await convertirArchivoABase64(archivo)
      setFotoBase64(base64)
      toast.success('Foto de perfil actualizada.')
    } catch {
      toast.error('No se pudo cargar la imagen. Probá con otra.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Perfil</h1>

      {/* Avatar + datos del perfil */}
      <section className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <button
          type="button"
          onClick={() => inputArchivoRef.current?.click()}
          className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-border bg-secondary transition-transform hover:scale-105"
          title="Cambiar foto de perfil"
        >
          {fotoBase64 ? (
            <img src={fotoBase64} alt="Tu foto de perfil" className="h-full w-full object-cover" />
          ) : (
            <UserCircle className="h-full w-full text-muted-foreground" strokeWidth={1} />
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-6 w-6 text-white" />
          </span>
        </button>
        <input
          ref={inputArchivoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={manejarSeleccionArchivo}
        />

        <div className="w-full flex-1 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="nombre-usuario">Nombre de usuario</Label>
            <Input
              id="nombre-usuario"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              placeholder="¿Cómo te llamás?"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="biografia">Biografía</Label>
            <Textarea
              id="biografia"
              value={biografia}
              onChange={(e) => setBiografia(e.target.value)}
              placeholder="Contá algo sobre vos y tus juegos favoritos"
              rows={3}
            />
          </div>
        </div>
      </section>

      {/* Mis 10 Favoritos */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Mis 10 Favoritos</h2>
          <Button type="button" variant="outline" size="sm" onClick={() => setGestorFavoritosAbierto(true)}>
            Gestionar favoritos
          </Button>
        </div>

        {favoritos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            Todavía no marcaste ningún juego como favorito. Usá "Gestionar favoritos" para elegir hasta 10.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {favoritos.map((juego) => (
              <div
                key={juego.id}
                className="group relative cursor-pointer overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-transform hover:scale-[1.02]"
                onClick={() => abrirEdicionJuego(juego.id)}
              >
                {juego.caratula ? (
                  <img
                    src={juego.caratula}
                    alt={`Carátula de ${juego.titulo}`}
                    className="aspect-[3/4] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-1 bg-secondary p-2 text-center text-xs text-muted-foreground">
                    <Star className="h-4 w-4" />
                    {juego.titulo}
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorito(juego.id)
                  }}
                  title="Quitar de favoritos"
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Logros completos */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Logros completos</h2>
          {juegosConLogros.length > 0 && (
            <span className="text-sm text-muted-foreground">{juegosConLogros.length} juegos</span>
          )}
        </div>

        {juegosConLogros.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            Todavía no marcaste ningún juego con los logros completos.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {juegosLogrosPagina.map((juego) => (
                <div
                  key={juego.id}
                  className="group relative cursor-pointer overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-transform hover:scale-[1.02]"
                  onClick={() => abrirEdicionJuego(juego.id)}
                >
                  {juego.caratula ? (
                    <img
                      src={juego.caratula}
                      alt={`Carátula de ${juego.titulo}`}
                      className="aspect-[3/4] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-1 bg-secondary p-2 text-center text-xs text-muted-foreground">
                      <Trophy className="h-4 w-4" />
                      {juego.titulo}
                    </div>
                  )}
                  <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-amber-400">
                    <Trophy className="h-3.5 w-3.5" />
                  </span>
                </div>
              ))}
            </div>

            {totalPaginasLogros > 1 && (
              <div className="flex items-center justify-center gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setPaginaLogros((p) => Math.max(0, p - 1))}
                  disabled={paginaLogros === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {paginaLogros + 1} de {totalPaginasLogros}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setPaginaLogros((p) => Math.min(totalPaginasLogros - 1, p + 1))}
                  disabled={paginaLogros === totalPaginasLogros - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      <FavoriteManagerDialog
        abierto={gestorFavoritosAbierto}
        onCambiarAbierto={setGestorFavoritosAbierto}
      />
    </div>
  )
}