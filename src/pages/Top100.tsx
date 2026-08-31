import { Trophy } from 'lucide-react'

export default function Top100() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-6 py-20 text-center">
      <Trophy className="h-10 w-10 text-muted-foreground" />
      <h1 className="text-xl font-semibold">Top 100</h1>
      <p className="text-sm text-muted-foreground">
        Esta pantalla se construye en la Fase 7. Por ahora podés seguir agregando juegos
        desde el buscador de la barra superior.
      </p>
    </div>
  )
}