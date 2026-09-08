import type { CacheTop100, DetalleJuegoCompleto, ResultadoBusquedaJuego } from '@/types'
import { igdbFetch } from './igdbClient'
import { mapearJuegoIGDB, mapearDetalleJuegoIGDB } from './igdbMappers'
import type { DuracionJuego } from '@/types'

const CLAVE_CACHE_TOP_100 = 'game-tracker-top100-cache'
const DURACION_CACHE_MS = 24 * 60 * 60 * 1000 // 24 horas

const CLAVE_CACHE_DURACION = 'game-tracker-duracion-cache'
const DURACION_CACHE_DURACION_MS = 30 * 24 * 60 * 60 * 1000

/** Campos base que se piden a IGDB para cualquier juego (búsqueda, top 100, detalle). */
const CAMPOS_JUEGO = 'id,name,cover.image_id,first_release_date,genres.name'

/**
 * Busca juegos por nombre en IGDB. La usan tanto el buscador global de la
 * navbar como el modal de gestión de favoritos.
 */
export async function buscarJuegos(termino: string, limite = 20): Promise<ResultadoBusquedaJuego[]> {
  const terminoLimpio = termino.trim()
  if (!terminoLimpio) return []

  // Escapamos comillas para no romper la sintaxis del query de Apicalypse.
  const terminoEscapado = terminoLimpio.replace(/"/g, '\\"')

  const query = `
    fields ${CAMPOS_JUEGO};
    search "${terminoEscapado}";
    limit ${limite};
  `

  const crudos = await igdbFetch('/games', query)
  return crudos.map(mapearJuegoIGDB)
}

/**
 * Obtiene el detalle de un juego específico por su id de IGDB.
 * Se usa al seleccionar un resultado de búsqueda o del Top 100.
 */
export async function obtenerDetalleJuego(id: number): Promise<ResultadoBusquedaJuego> {
  const query = `
    fields ${CAMPOS_JUEGO};
    where id = ${id};
  `

  const crudos = await igdbFetch('/games', query)
  const [crudo] = crudos
  if (!crudo) {
    throw new Error(`No se encontró información en IGDB para el juego con id ${id}.`)
  }
  return mapearJuegoIGDB(crudo)
}

function leerCacheTop100(): CacheTop100 | null {
  try {
    const crudo = localStorage.getItem(CLAVE_CACHE_TOP_100)
    if (!crudo) return null
    return JSON.parse(crudo) as CacheTop100
  } catch {
    return null
  }
}

function guardarCacheTop100(juegos: ResultadoBusquedaJuego[]): void {
  const cache: CacheTop100 = { juegos, timestamp: Date.now() }
  try {
    localStorage.setItem(CLAVE_CACHE_TOP_100, JSON.stringify(cache))
  } catch {
    // Si falla (cuota llena, modo privado) simplemente no se cachea;
    // la próxima carga volverá a pedir los datos a IGDB.
  }
}

function cacheTop100Valida(cache: CacheTop100): boolean {
  return Date.now() - cache.timestamp < DURACION_CACHE_MS
}

/**
 * Obtiene los 100 juegos más populares de IGDB (ordenados por cantidad de
 * valoraciones totales), cacheando el resultado en localStorage durante
 * 24 horas para evitar peticiones innecesarias.
 *
 * Pasá `{ forzarActualizacion: true }` para ignorar la caché (ej. un botón
 * "Actualizar" en la pantalla de Top 100).
 */
export async function obtenerTop100(opciones?: {
  forzarActualizacion?: boolean
}): Promise<ResultadoBusquedaJuego[]> {
  if (!opciones?.forzarActualizacion) {
    const cache = leerCacheTop100()
    if (cache && cacheTop100Valida(cache)) {
      return cache.juegos
    }
  }

  const query = `
    fields ${CAMPOS_JUEGO},total_rating_count;
    where total_rating_count != null & cover != null;
    sort total_rating_count desc;
    limit 100;
  `

  const crudos = await igdbFetch('/games', query)
  const juegos = crudos.map(mapearJuegoIGDB)
  guardarCacheTop100(juegos)
  return juegos
}


/** Campos que se piden a IGDB para la vista de detalle (`/juego/:id`). */
const CAMPOS_DETALLE_JUEGO =
  'id,name,summary,cover.image_id,first_release_date,genres.name,platforms.name,screenshots.image_id,videos.video_id'

/**
 * Obtiene el detalle completo de un juego (resumen, plataformas, capturas
 * y video) para la vista `/juego/:id`. A diferencia de `obtenerDetalleJuego`,
 * trae todo lo necesario para la galería en una sola petición.
 */
export async function obtenerDetalleCompletoJuego(id: number): Promise<DetalleJuegoCompleto> {
  const query = `
    fields ${CAMPOS_DETALLE_JUEGO};
    where id = ${id};
  `

  const crudos = await igdbFetch('/games', query)
  const [crudo] = crudos
  if (!crudo) {
    throw new Error(`No se encontró información en IGDB para el juego con id ${id}.`)
  }
  return mapearDetalleJuegoIGDB(crudo)
}

interface EntradaCacheDuracion {
  duracion: DuracionJuego | null // null = ya se consultó y IGDB no tiene el dato
  timestamp: number
}

function leerCacheDuracion(): Record<number, EntradaCacheDuracion> {
  try {
    const crudo = localStorage.getItem(CLAVE_CACHE_DURACION)
    return crudo ? JSON.parse(crudo) : {}
  } catch {
    return {}
  }
}

function guardarEnCacheDuracion(id: number, duracion: DuracionJuego | null): void {
  const cache = leerCacheDuracion()
  cache[id] = { duracion, timestamp: Date.now() }
  try {
    localStorage.setItem(CLAVE_CACHE_DURACION, JSON.stringify(cache))
  } catch {
    // Cuota llena o modo privado: no se cachea, se vuelve a pedir la próxima vez.
  }
}

/** Convierte segundos (formato IGDB) a horas, o null si el campo no vino. */
function segundosAHoras(segundos: number | undefined): number | null {
  if (!segundos || segundos <= 0) return null
  return Math.round((segundos / 3600) * 10) / 10 // redondeado a 1 decimal
}

/**
 * Busca la duración estimada de un juego (`game_time_to_beats` de IGDB) por
 * su id. Cachea el resultado —incluso los "sin datos"— 30 días en
 * localStorage para no repetir la consulta en cada render de una tarjeta.
 */
export async function obtenerDuracionJuego(id: number): Promise<DuracionJuego | null> {
  const cache = leerCacheDuracion()
  const entrada = cache[id]
  if (entrada && Date.now() - entrada.timestamp < DURACION_CACHE_DURACION_MS) {
    return entrada.duracion
  }

  const query = `
    fields hastily,normally,completely;
    where game_id = ${id};
  `

  const crudos = await igdbFetch('/game_time_to_beats', query)
  const [crudo] = crudos as Array<{ hastily?: number; normally?: number; completely?: number }>

  const duracion: DuracionJuego | null = crudo
    ? {
        apurado: segundosAHoras(crudo.hastily),
        normal: segundosAHoras(crudo.normally),
        completo: segundosAHoras(crudo.completely),
      }
    : null

  const sinDatos = duracion && duracion.apurado === null && duracion.normal === null && duracion.completo === null
  const resultado = sinDatos ? null : duracion

  guardarEnCacheDuracion(id, resultado)
  return resultado
}