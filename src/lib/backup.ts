import { useLibraryStore, useProfileStore, useThemeStore } from '@/store'
import type { Juego, Perfil, OpcionColorPrimario } from '@/types'

const VERSION_BACKUP = 1

/** Claves de localStorage que no dependen de un store de Zustand (cachés de IGDB). */
const CLAVES_CACHE_IGDB = ['game-tracker-top100-cache', 'game-tracker-duracion-cache']

export interface BackupGameTracker {
  version: number
  fechaExportacion: string
  biblioteca: { juegos: Juego[] }
  perfil: Perfil
  tema: { colorPrimario: OpcionColorPrimario }
}

export class ErrorImportacion extends Error {}

/** Arma el objeto de backup a partir del estado actual de los stores. */
function generarBackup(): BackupGameTracker {
  return {
    version: VERSION_BACKUP,
    fechaExportacion: new Date().toISOString(),
    biblioteca: { juegos: useLibraryStore.getState().juegos },
    perfil: {
      nombreUsuario: useProfileStore.getState().nombreUsuario,
      biografia: useProfileStore.getState().biografia,
      fotoBase64: useProfileStore.getState().fotoBase64,
    },
    tema: { colorPrimario: useThemeStore.getState().colorPrimario },
  }
}

/** Genera el backup y dispara la descarga como archivo .json. */
export function descargarBackup(): void {
  const backup = generarBackup()
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = `game-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)

  URL.revokeObjectURL(url)
}

/**
 * Type guard mínimo: solo valida la forma general del archivo (que exista
 * `biblioteca.juegos` como array y `perfil` como objeto), no cada campo de
 * cada juego. Si el archivo viene corrupto o incompleto en algún juego
 * puntual, se prefiere dejarlo pasar antes que bloquear toda la importación.
 */
function esBackupValido(datos: unknown): datos is BackupGameTracker {
  if (!datos || typeof datos !== 'object') return false
  const d = datos as Record<string, unknown>
  const biblioteca = d.biblioteca as Record<string, unknown> | undefined
  return Array.isArray(biblioteca?.juegos) && typeof d.perfil === 'object' && d.perfil !== null
}

/** Parsea y valida el contenido (ya leído como texto) de un archivo de backup. */
export function parsearArchivoBackup(contenido: string): BackupGameTracker {
  let datos: unknown
  try {
    datos = JSON.parse(contenido)
  } catch {
    throw new ErrorImportacion('El archivo no es un JSON válido.')
  }

  if (!esBackupValido(datos)) {
    throw new ErrorImportacion(
      'El archivo no tiene el formato esperado de un backup de Game Tracker.'
    )
  }
  return datos
}

/** Sobreescribe biblioteca, perfil y tema con los datos del backup. */
export function aplicarBackup(backup: BackupGameTracker): void {
  useLibraryStore.setState({ juegos: backup.biblioteca.juegos })
  useProfileStore.setState({ ...backup.perfil })
  if (backup.tema?.colorPrimario) {
    useThemeStore.getState().setColorPrimario(backup.tema.colorPrimario)
  }
}

/**
 * Restablece biblioteca y perfil a sus valores por defecto, y limpia las
 * cachés de IGDB (Top 100 y duración). No toca el color primario: es una
 * preferencia de la app, no un dato del usuario.
 */
export function borrarTodosLosDatos(): void {
  useLibraryStore.setState({ juegos: [] })
  useProfileStore.setState({ nombreUsuario: '', biografia: '', fotoBase64: null })

  for (const clave of CLAVES_CACHE_IGDB) {
    try {
      localStorage.removeItem(clave)
    } catch {
      // Modo privado o cuota bloqueada: no hay nada más que hacer acá.
    }
  }
}