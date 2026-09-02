import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { CapturaJuego } from '@/types'

export type ItemGaleria =
  | { tipo: 'video'; idVideo: string }
  | { tipo: 'imagen'; captura: CapturaJuego }

interface MediaLightboxProps {
  items: ItemGaleria[]
  indiceInicial: number
  onCerrar: () => void
}

/**
 * Visor a pantalla completa para la galería de medios del detalle de juego.
 * Soporta navegación con flechas del teclado y Escape para cerrar. Los
 * videos se embeben directamente desde YouTube (autoplay al abrir).
 */
export function MediaLightbox({ items, indiceInicial, onCerrar }: MediaLightboxProps) {
  const [indice, setIndice] = useState(indiceInicial)
  const item = items[indice]
  const hayVarios = items.length > 1

  useEffect(() => {
    function manejarTeclado(evento: KeyboardEvent) {
      if (evento.key === 'Escape') onCerrar()
      if (evento.key === 'ArrowRight') setIndice((i) => (i + 1) % items.length)
      if (evento.key === 'ArrowLeft') setIndice((i) => (i - 1 + items.length) % items.length)
    }
    document.addEventListener('keydown', manejarTeclado)
    return () => document.removeEventListener('keydown', manejarTeclado)
  }, [items.length, onCerrar])

  if (!item) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-fade-in"
      onClick={onCerrar}
    >
      <button
        type="button"
        onClick={onCerrar}
        className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
        aria-label="Cerrar"
      >
        <X className="h-5 w-5" />
      </button>

      {hayVarios && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIndice((i) => (i - 1 + items.length) % items.length)
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIndice((i) => (i + 1) % items.length)
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <div className="max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        {item.tipo === 'video' ? (
          <iframe
            src={`https://www.youtube.com/embed/${item.idVideo}?autoplay=1`}
            title="Video del juego"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="aspect-video w-[85vw] max-w-4xl rounded-lg"
          />
        ) : (
          <img
            src={item.captura.urlGrande}
            alt=""
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
          />
        )}
      </div>
    </div>
  )
}