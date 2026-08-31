import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      // El selector nativo de <input type="month"> hereda el color del texto;
      // en tema oscuro el ícono de calendario del navegador queda invertido.
      '[color-scheme:dark]',
      className
    )}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }
