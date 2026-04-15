import 'react'

declare module 'react' {
  interface HTMLAttributes<T> {
    t?: boolean | string
  }
}
