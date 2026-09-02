import type {
  IGDBJuegoCrudo,
  ResultadoBusquedaJuego,
  DetalleJuegoCompleto,
} from '@/types'

type TamañoCaratula = 'cover_big' | 'cover_small' | 'thumb'
type TamañoCaptura = 'screenshot_med' | 'screenshot_big' | 'screenshot_huge'

/**
 * Construye la URL de la carátula de un juego a partir del `image_id` de IGDB.
 * Por defecto usa "cover_big" (~264x374), el tamaño recomendado por la spec
 * para tarjetas y el modal de edición.
 */
export function urlCaratula(imageId: string, tamaño: TamañoCaratula = 'cover_big'): string {
  return `https://images.igdb.com/igdb/image/upload/t_${tamaño}/${imageId}.jpg`
}

/**
 * Construye la URL de una captura de pantalla a partir del `image_id` de IGDB.
 * "screenshot_med" (569x320) para miniaturas de la galería, "screenshot_huge"
 * (1280x720) para el lightbox.
 */
export function urlCaptura(imageId: string, tamaño: TamañoCaptura = 'screenshot_big'): string {
  return `https://images.igdb.com/igdb/image/upload/t_${tamaño}/${imageId}.jpg`
}

/**
 * Thumbnail de YouTube a partir del `video_id` que devuelve IGDB en `videos`.
 * No requiere ninguna llamada extra: YouTube expone esta imagen por convención.
 */
export function urlMiniaturaVideo(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

/**
 * Convierte un juego "crudo" de IGDB (tal como llega de la API) al formato
 * normalizado `ResultadoBusquedaJuego` que consume el resto de la app
 * (buscador, Top 100, modal de edición).
 */
export function mapearJuegoIGDB(crudo: IGDBJuegoCrudo): ResultadoBusquedaJuego {
  return {
    id: crudo.id,
    titulo: crudo.name,
    caratula: crudo.cover?.image_id ? urlCaratula(crudo.cover.image_id) : '',
    año: crudo.first_release_date
      ? new Date(crudo.first_release_date * 1000).getUTCFullYear()
      : null,
    generos: crudo.genres?.map((genero) => genero.name) ?? [],
  }
}

/**
 * Convierte un juego "crudo" de IGDB al formato `DetalleJuegoCompleto` que
 * consume la vista `/juego/:id`: agrega resumen, plataformas y medios
 * (primer video + capturas) además de los campos básicos.
 */
export function mapearDetalleJuegoIGDB(crudo: IGDBJuegoCrudo): DetalleJuegoCompleto {
  return {
    id: crudo.id,
    titulo: crudo.name,
    caratula: crudo.cover?.image_id ? urlCaratula(crudo.cover.image_id) : '',
    año: crudo.first_release_date
      ? new Date(crudo.first_release_date * 1000).getUTCFullYear()
      : null,
    generos: crudo.genres?.map((genero) => genero.name) ?? [],
    plataformas: crudo.platforms?.map((plataforma) => plataforma.name) ?? [],
    resumen: crudo.summary ?? '',
    capturas:
      crudo.screenshots?.map((captura) => ({
        urlMiniatura: urlCaptura(captura.image_id, 'screenshot_med'),
        urlGrande: urlCaptura(captura.image_id, 'screenshot_huge'),
      })) ?? [],
    // Tomamos el primero: la spec pide "si tiene video que se muestre
    // primero", no una lista completa de todos los videos disponibles.
    idVideo: crudo.videos?.[0]?.video_id ?? null,
  }
}