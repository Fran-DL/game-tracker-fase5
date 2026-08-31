import { Routes, Route, NavLink } from 'react-router-dom'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'
import { GameEditDialog } from '@/components/GameEditDialog'
import Home from '@/pages/Home'
import Backlog from '@/pages/Backlog'
import Dev from '@/pages/Dev'

/** Enlaces de la nav temporal (Fase 5). La Navbar real llega en la Fase 6. */
const ENLACES_NAV_TEMPORAL = [
  { to: '/', etiqueta: 'Home', fin: true },
  { to: '/backlog', etiqueta: 'Backlog', fin: false },
  { to: '/dev', etiqueta: 'Dev (temporal)', fin: false },
] as const

/**
 * Layout raíz de la app: monta el modal de edición y el Toaster una única
 * vez (disponibles en cualquier ruta) y define las rutas de las pantallas
 * principales. La nav de acá arriba es un standin temporal de la Fase 5;
 * se reemplaza por la Navbar fija con buscador global en la Fase 6.
 */
function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster theme="dark" richColors position="bottom-right" />
      <GameEditDialog />

      <nav className="flex gap-1 border-b border-border px-6 py-3">
        {ENLACES_NAV_TEMPORAL.map((enlace) => (
          <NavLink
            key={enlace.to}
            to={enlace.to}
            end={enlace.fin}
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )
            }
          >
            {enlace.etiqueta}
          </NavLink>
        ))}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/backlog" element={<Backlog />} />
        <Route path="/dev" element={<Dev />} />
      </Routes>
    </div>
  )
}

export default App
