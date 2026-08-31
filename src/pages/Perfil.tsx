import { UserCircle } from 'lucide-react'

export default function Perfil() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-6 py-20 text-center">
      <UserCircle className="h-10 w-10 text-muted-foreground" />
      <h1 className="text-xl font-semibold">Perfil</h1>
      <p className="text-sm text-muted-foreground">
        Avatar, biografía, favoritos y color primario llegan en la Fase 8.
      </p>
    </div>
  )
}