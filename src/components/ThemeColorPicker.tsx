import { Check } from 'lucide-react'
import { useThemeStore } from '@/store'
import { OPCIONES_COLOR_PRIMARIO } from '@/lib/theme'
import { cn } from '@/lib/utils'

/**
 * Cuatro botones circulares (Violeta, Naranja, Azul, Verde) que cambian
 * --primary en tiempo real. La persistencia y el "reaplicar al recargar"
 * ya los resuelve useThemeStore (ver onRehydrateStorage).
 */
export function ThemeColorPicker() {
  const colorPrimario = useThemeStore((state) => state.colorPrimario)
  const setColorPrimario = useThemeStore((state) => state.setColorPrimario)

  return (
    <div className="flex items-center gap-3">
      {OPCIONES_COLOR_PRIMARIO.map((opcion) => {
        const seleccionado = opcion.nombre === colorPrimario.nombre
        return (
          <button
            key={opcion.nombre}
            type="button"
            title={opcion.nombre}
            aria-label={`Usar color ${opcion.nombre}`}
            onClick={() => setColorPrimario(opcion)}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-transform hover:scale-110',
              seleccionado ? 'border-white' : 'border-transparent'
            )}
            style={{ backgroundColor: opcion.hex }}
          >
            {seleccionado && <Check className="h-5 w-5 text-white" />}
          </button>
        )
      })}
    </div>
  )
}