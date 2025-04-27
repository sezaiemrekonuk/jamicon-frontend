// Copied from shadcn/ui toast component
// https://ui.shadcn.com/docs/components/toast

import { useEffect, useState } from "react"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000

type ToastActionElement = React.ReactElement

export type Toast = {
  id: string
  title?: string
  description?: string
  action?: ToastActionElement
  variant?: "default" | "destructive"
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ToasterToast = Toast & {
  id: string
  title?: string
  description?: string
  action?: ToastActionElement
}

const toasts: ToasterToast[] = []

type ToastProps = {
  toast: {
    id: string
    title?: string
    description?: string
    variant?: "default" | "destructive"
  }
}

export const useToast = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toast = ({ title, description, variant }: {
    title?: string
    description?: string
    variant?: "default" | "destructive"
  }) => {
    const id = genId()

    const newToast = {
      id,
      title,
      description,
      variant,
    }

    toasts.push(newToast)

    return newToast
  }

  const dismiss = (toastId?: string) => {
    if (toastId) {
      const index = toasts.findIndex((toast) => toast.id === toastId)
      if (index !== -1) {
        toasts.splice(index, 1)
      }
    } else {
      toasts.splice(0, toasts.length)
    }
  }

  return {
    toast,
    dismiss,
    toasts: mounted ? toasts : [],
  }
}

export { toast } from "./toast" 