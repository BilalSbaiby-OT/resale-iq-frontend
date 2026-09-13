import "react"

declare module "react" {
  interface FormHTMLAttributes<T> {
    toolname?: string
    tooldescription?: string
    toolautosubmit?: boolean
  }
  interface InputHTMLAttributes<T> {
    toolparamdescription?: string
  }
}

export {}
