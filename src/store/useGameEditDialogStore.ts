import { create } from 'zustand'

/**
 * Store minúsculo (sin persistencia) que controla el modal global de edición
 * de juego. Vive en un único lugar para que Home, Backlog, Top 100, la
 * navbar o cualquier otra pantalla puedan abrirlo con solo conocer el id
 * de IGDB del juego, sin tener que levantar el estado hasta un ancestro común.
 *
 * `<GameEditDialog />` se monta una única vez (en App.tsx) y lee este store;
 * el resto de la app solo llama a `abrirEdicionJuego(id)`.
 */
interface GameEditDialogState {
  /** id del juego en edición, o null si el modal está cerrado. */
  idJuegoAbierto: number | null
  abrir: (id: number) => void
  cerrar: () => void
}

export const useGameEditDialogStore = create<GameEditDialogState>()((set) => ({
  idJuegoAbierto: null,
  abrir: (id) => set({ idJuegoAbierto: id }),
  cerrar: () => set({ idJuegoAbierto: null }),
}))

/** Atajo usado por componentes que solo necesitan disparar la apertura. */
export function abrirEdicionJuego(id: number): void {
  useGameEditDialogStore.getState().abrir(id)
}
