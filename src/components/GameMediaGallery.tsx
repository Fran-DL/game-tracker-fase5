import { useState } from 'react'
import { Play } from 'lucide-react'
import type { CapturaJuego } from '@/types'
import { urlMiniaturaVideo } from '@/services'
import { MediaLightbox, type ItemGaleria } from '@/components/MediaLightbox'

interface GameMediaGalleryProps {
  idVideo: string | null
  capturas: CapturaJuego[]
}

/**
 * Galería horizontal scrolleable (estilo tienda digital) con el video del
 * juego primero (si existe) y luego las capturas de pantalla, todo obtenido
 * de IGDB. Clickear cualquier elemento lo abre en grande via `MediaLightbox`.
 */
export function GameMediaGallery({ idVideo, capturas }: GameMediaGalleryProps) {
  const [indiceAbierto, setIndiceAbierto] = useState<number | null>(null)

  const items: ItemGaleria[] = [
    ...(idVideo ? [{ tipo: 'video', idVideo } as const] : []),
    ...capturas.map((captura) => ({ tipo: 'imagen', captura }) as const),
  ]

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay capturas ni video disponibles para este juego.
      </p>
    )
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map((item, indice) => (
          <button
            key={indice}
            type="button"
            onClick={() => setIndiceAbierto(indice)}
            className="group relative aspect-video w-56 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary"
          >
            <img
              src={item.tipo === 'video' ? urlMiniaturaVideo(item.idVideo) : item.captura.urlMiniatura}
              alt=""
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            {item.tipo === 'video' && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="h-10 w-10 text-white" fill="white" />
              </span>
            )}
          </button>
        ))}
      </div>

      {indiceAbierto !== null && (
        <MediaLightbox
          items={items}
          indiceInicial={indiceAbierto}
          onCerrar={() => setIndiceAbierto(null)}
        />
      )}
    </>
  )
}