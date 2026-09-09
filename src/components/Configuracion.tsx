import { useRef, useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react'
import { ThemeColorPicker } from '@/components/ThemeColorPicker'
import { Button } from '@/components/ui/button'
import {
  descargarBackup,
  parsearArchivoBackup,
  aplicarBackup,
  borrarTodosLosDatos,
  ErrorImportacion,
  type BackupGameTracker,
} from '@/lib/backup'

/**
 * Configuración (`/configuracion`, Fase 8): apariencia y gestión de datos.
 * Centraliza acá lo que antes vivía en Perfil (selector de color) y agrega
 * backup manual (exportar/importar JSON) y borrado total de datos.
 */
export default function Configuracion() {
  const inputArchivoRef = useRef<HTMLInputElement>(null)

  const [backupPendiente, setBackupPendiente] = useState<BackupGameTracker | null>(null)
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false)

  function manejarExportar() {
    descargarBackup()
    toast.success('Se descargó tu copia de seguridad.')
  }

  async function manejarArchivoSeleccionado(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!archivo) return

    try {
      const contenido = await archivo.text()
      setBackupPendiente(parsearArchivoBackup(contenido))
    } catch (error) {
      toast.error(
        error instanceof ErrorImportacion ? error.message : 'No se pudo leer el archivo seleccionado.'
      )
    }
  }

  function confirmarImportacion() {
    if (!backupPendiente) return
    aplicarBackup(backupPendiente)
    toast.success(`Se importaron ${backupPendiente.biblioteca.juegos.length} juegos.`)
    setBackupPendiente(null)
  }

  function manejarBorrarTodo() {
    if (!confirmandoBorrado) {
      setConfirmandoBorrado(true)
      return
    }
    borrarTodosLosDatos()
    toast.success('Se borraron todos tus datos.')
    setConfirmandoBorrado(false)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10 px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>

      {/* Apariencia */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Apariencia</h2>
        <p className="text-sm text-muted-foreground">Elegí el color principal de la aplicación.</p>
        <ThemeColorPicker />
      </section>

      {/* Copia de seguridad */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Copia de seguridad</h2>
        <p className="text-sm text-muted-foreground">
          Exportá tu biblioteca, perfil y preferencias a un archivo JSON, o importá uno
          previamente exportado. Importar reemplaza tus datos actuales.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={manejarExportar}>
            <Download className="h-4 w-4" />
            Exportar datos
          </Button>
          <Button type="button" variant="outline" onClick={() => inputArchivoRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Importar datos
          </Button>
          <input
            ref={inputArchivoRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={manejarArchivoSeleccionado}
          />
        </div>

        {backupPendiente && (
          <div className="space-y-3 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm">
            <p>
              El archivo contiene <strong>{backupPendiente.biblioteca.juegos.length}</strong> juegos
              {backupPendiente.perfil.nombreUsuario
                ? ` y el perfil de "${backupPendiente.perfil.nombreUsuario}"`
                : ''}
              . Esto va a <strong>reemplazar</strong> tus datos actuales.
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setBackupPendiente(null)}>
                Cancelar
              </Button>
              <Button type="button" size="sm" onClick={confirmarImportacion}>
                Sí, importar y reemplazar
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Zona de peligro */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-destructive-foreground">Zona de peligro</h2>
        <p className="text-sm text-muted-foreground">
          Borra tu biblioteca completa y tu perfil de este dispositivo. Esta acción no se puede
          deshacer; exportá una copia antes si no estás seguro.
        </p>

        {confirmandoBorrado ? (
          <div className="space-y-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm">
            <p className="flex items-center gap-2 text-destructive-foreground">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              ¿Seguro que querés borrar todos tus datos? No se puede deshacer.
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmandoBorrado(false)}>
                Cancelar
              </Button>
              <Button type="button" variant="destructive" size="sm" onClick={manejarBorrarTodo}>
                <Trash2 className="h-4 w-4" />
                Sí, borrar todo
              </Button>
            </div>
          </div>
        ) : (
          <Button type="button" variant="destructive" onClick={manejarBorrarTodo}>
            <Trash2 className="h-4 w-4" />
            Borrar todos los datos
          </Button>
        )}
      </section>
    </div>
  )
}