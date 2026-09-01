/**
 * Convierte un archivo de imagen a una cadena Base64 (data URL), lista para
 * guardarse en localStorage como foto de perfil.
 */
export function convertirArchivoABase64(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader()
    lector.onload = () => resolve(lector.result as string)
    lector.onerror = () => reject(new Error('No se pudo leer la imagen.'))
    lector.readAsDataURL(archivo)
  })
}