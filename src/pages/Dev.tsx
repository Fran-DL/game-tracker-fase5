import { useState } from 'react'
import type { FormEvent } from 'react'
import { Pencil } from 'lucide-react'
import { useLibraryStore, useProfileStore, useThemeStore, MAX_FAVORITOS } from '@/store'
import { abrirEdicionJuego } from '@/store/useGameEditDialogStore'
import { OPCIONES_COLOR_PRIMARIO } from '@/lib/theme'
import { buscarJuegos, obtenerTop100, ErrorServicioIGDB } from '@/services'
import type { ResultadoBusquedaJuego } from '@/types'

/**
 * Panel temporal de pruebas (`/dev`), NO es una pantalla final de la spec.
 * Sirve para validar a mano el store, la persistencia y los servicios de
 * IGDB/Twitch, y para agregar juegos mockeados con los que probar Home,
 * Backlog y el modal de edición mientras el buscador real (Fase 6) y el
 * Top 100 (Fase 7) todavía no están conectados a la UI.
 *
 * Se va a eliminar (o reducir a algo mínimo) en una fase de pulido final.
 */
export default function Dev() {
  const juegos = useLibraryStore((state) => state.juegos)
  const agregarJuego = useLibraryStore((state) => state.agregarJuego)
  const existeJuego = useLibraryStore((state) => state.existeJuego)
  const eliminarJuego = useLibraryStore((state) => state.eliminarJuego)
  const contarFavoritos = useLibraryStore((state) => state.contarFavoritos)

  const perfil = useProfileStore()
  const colorPrimario = useThemeStore((state) => state.colorPrimario)
  const setColorPrimario = useThemeStore((state) => state.setColorPrimario)

  // --- Fase 3: prueba de servicios IGDB/Twitch ------------------------------
  const [terminoBusqueda, setTerminoBusqueda] = useState('')
  const [resultadosBusqueda, setResultadosBusqueda] = useState<ResultadoBusquedaJuego[]>([])
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false)
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null)

  const [top100, setTop100] = useState<ResultadoBusquedaJuego[]>([])
  const [cargandoTop100, setCargandoTop100] = useState(false)
  const [errorTop100, setErrorTop100] = useState<string | null>(null)

  function agregarJuegoDePrueba() {
    const id = Date.now()
    agregarJuego({
      id,
      titulo: `Juego de prueba #${juegos.length + 1}`,
      caratula: '',
      año: 2024,
      generos: ['Aventura'],
    })
  }

  // Juego mockeado con carátula, pensado para probar cómodamente Home,
  // Backlog y el modal de edición sin depender todavía de IGDB real.
  function agregarJuegoMockeadoConCaratula() {
    const id = Date.now()
    agregarJuego({
      id,
      titulo: `Hollow Knight (mock #${juegos.length + 1})`,
      caratula: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.jpg',
      año: 2017,
      generos: ['Metroidvania', 'Plataformas', 'Indie'],
    })
  }

  async function manejarBusqueda(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!terminoBusqueda.trim()) return

    setCargandoBusqueda(true)
    setErrorBusqueda(null)
    try {
      const resultados = await buscarJuegos(terminoBusqueda)
      setResultadosBusqueda(resultados)
    } catch (error) {
      setErrorBusqueda(
        error instanceof ErrorServicioIGDB
          ? error.message
          : 'Ocurrió un error inesperado al buscar juegos.'
      )
    } finally {
      setCargandoBusqueda(false)
    }
  }

  async function manejarCargarTop100(forzar: boolean) {
    setCargandoTop100(true)
    setErrorTop100(null)
    try {
      const resultado = await obtenerTop100({ forzarActualizacion: forzar })
      setTop100(resultado)
    } catch (error) {
      setErrorTop100(
        error instanceof ErrorServicioIGDB
          ? error.message
          : 'Ocurrió un error inesperado al cargar el Top 100.'
      )
    } finally {
      setCargandoTop100(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Panel de pruebas (temporal)</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Agregá juegos mockeados acá y probá Home / Backlog / el modal de edición desde la
          barra de arriba. Esta pantalla no es parte de la spec final.
        </p>
      </header>

      {/* Color primario */}
      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="font-medium">Color primario</h2>
        <p className="text-sm text-muted-foreground">Actual: {colorPrimario.nombre}</p>
        <div className="mt-3 flex gap-3">
          {OPCIONES_COLOR_PRIMARIO.map((opcion) => (
            <button
              key={opcion.nombre}
              type="button"
              onClick={() => setColorPrimario(opcion)}
              title={opcion.nombre}
              className="h-9 w-9 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: opcion.hex,
                borderColor:
                  opcion.nombre === colorPrimario.nombre ? 'white' : 'transparent',
              }}
            />
          ))}
        </div>
      </section>

      {/* Perfil */}
      <section className="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 className="font-medium">Perfil</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={perfil.nombreUsuario}
            onChange={(e) => perfil.setNombreUsuario(e.target.value)}
            placeholder="Nombre de usuario"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            value={perfil.biografia}
            onChange={(e) => perfil.setBiografia(e.target.value)}
            placeholder="Biografía"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </section>

      {/* Biblioteca */}
      <section className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-medium">
            Biblioteca ({juegos.length} juegos, {contarFavoritos()}/{MAX_FAVORITOS} favoritos)
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={agregarJuegoMockeadoConCaratula}
              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
            >
              + Agregar mockeado (con carátula)
            </button>
            <button
              type="button"
              onClick={agregarJuegoDePrueba}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
            >
              + Agregar juego de prueba
            </button>
          </div>
        </div>

        {juegos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay juegos en la biblioteca.
          </p>
        ) : (
          <ul className="space-y-2">
            {juegos.map((juego) => (
              <li
                key={juego.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{juego.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {juego.estado} · rejugado {juego.vecesRejugado}x
                    {juego.esFavorito ? ' · favorito' : ''}
                    {juego.calificacion !== null ? ` · ${juego.calificacion}/10` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => abrirEdicionJuego(juego.id)}
                    className="flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:opacity-90"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => eliminarJuego(juego.id)}
                    className="rounded-md border border-destructive/50 px-2 py-1 text-xs text-destructive-foreground hover:bg-destructive/10"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Servicios IGDB (prueba, Fase 3) */}
      <section className="rounded-lg border border-border bg-card p-4 space-y-4">
        <div>
          <h2 className="font-medium">Servicios IGDB (prueba)</h2>
          <p className="text-sm text-muted-foreground">
            Panel temporal para validar la autenticación con Twitch y las peticiones
            a IGDB antes de conectarlas a la navbar y a la pantalla de Top 100.
          </p>
        </div>

        <form onSubmit={manejarBusqueda} className="flex gap-2">
          <input
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            placeholder="Buscar un juego (ej. The Witcher 3)"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={cargandoBusqueda}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {cargandoBusqueda ? 'Buscando…' : 'Buscar'}
          </button>
        </form>

        {errorBusqueda && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
            {errorBusqueda}
          </div>
        )}

        {resultadosBusqueda.length > 0 && (
          <ul className="space-y-2">
            {resultadosBusqueda.map((juego) => (
              <li
                key={juego.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-3">
                  {juego.caratula ? (
                    <img src={juego.caratula} alt="" className="h-14 w-10 rounded object-cover" />
                  ) : (
                    <div className="h-14 w-10 rounded bg-muted" />
                  )}
                  <div>
                    <p className="font-medium">{juego.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {juego.año ?? 'Año desconocido'} · {juego.generos.join(', ') || 'Sin género'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => agregarJuego(juego)}
                  disabled={existeJuego(juego.id)}
                  className="shrink-0 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent disabled:opacity-50"
                >
                  {existeJuego(juego.id) ? 'Ya añadido' : 'Añadir'}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Top 100 (caché 24h)</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => manejarCargarTop100(false)}
                disabled={cargandoTop100}
                className="rounded-md border border-border px-2 py-1 text-xs hover:bg-accent disabled:opacity-50"
              >
                {cargandoTop100 ? 'Cargando…' : 'Cargar Top 100'}
              </button>
              <button
                type="button"
                onClick={() => manejarCargarTop100(true)}
                disabled={cargandoTop100}
                className="rounded-md border border-border px-2 py-1 text-xs hover:bg-accent disabled:opacity-50"
              >
                Forzar actualización
              </button>
            </div>
          </div>

          {errorTop100 && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
              {errorTop100}
            </div>
          )}

          {top100.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground">{top100.length} juegos cargados.</p>
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
                {top100.slice(0, 20).map((juego) => (
                  <img
                    key={juego.id}
                    src={juego.caratula}
                    alt={juego.titulo}
                    title={juego.titulo}
                    className="aspect-[3/4] w-full rounded object-cover"
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
