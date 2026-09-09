# Vault - Game Tracker

Aplicación web para organizar y hacer seguimiento de tu biblioteca de videojuegos. Permite buscar juegos en IGDB, añadirlos al backlog, registrar su progreso, calificarlos y gestionar favoritos.

## Funciones principales

- Búsqueda de juegos mediante IGDB.
- Biblioteca con estados: backlog, jugando, completado y abandonado.
- Registro de fechas, reseñas, calificación, logros y rejugadas.
- Perfil y hasta 10 juegos favoritos.
- Personalización del color de la interfaz.
- Exportación e importación de datos en formato JSON.
- Persistencia local en el navegador mediante `localStorage`.

## Requisitos

- Node.js 18 o superior.
- Una aplicación de Twitch para acceder a la API de IGDB.

## Instalación

```bash
npm install
```

Copia `.env.example` como `.env` y completa tus credenciales:

```env
TWITCH_CLIENT_ID=tu_client_id
TWITCH_CLIENT_SECRET=tu_client_secret
```

Las credenciales se utilizan únicamente en el proxy de desarrollo de Vite; no se exponen al navegador.

## Desarrollo

```bash
npm run dev
```

También puedes ejecutar `iniciar-tracker.bat` en Windows para iniciar el servidor y abrir la aplicación automáticamente.

Otros comandos disponibles:

```bash
npm run build    # Compila y genera la versión de producción
npm run preview  # Previsualiza la compilación
npm run lint     # Ejecuta Oxlint
```

## Rutas principales

- `/`: actividad reciente.
- `/backlog`: biblioteca y juegos pendientes.
- `/top100`: selección Top 100.
- `/perfil`: perfil y favoritos.
- `/configuracion`: apariencia y copias de seguridad.
- `/juego/:id`: detalle de un juego.

## Tecnologías

React, TypeScript, Vite, Tailwind CSS, React Router, Zustand e IGDB.