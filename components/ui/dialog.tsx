"use client"
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

export function Dialog({ open, onOpenChange, children }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  )
}

Dialog.Trigger = DialogPrimitive.Trigger

Dialog.Content = function DialogContent({ className = "", children }: { className?: string, children: React.ReactNode }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40 z-50" />
      <DialogPrimitive.Content className={`fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl focus:outline-none ${className}`}>
        <DialogPrimitive.Close asChild>
          <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 focus:outline-none" aria-label="Close">
            <X className="w-6 h-6" />
          </button>
        </DialogPrimitive.Close>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

Dialog.Title = function DialogTitle({ className = "", children }: { className?: string, children: React.ReactNode }) {
  return <DialogPrimitive.Title className={`text-xl font-bold mb-2 ${className}`}>{children}</DialogPrimitive.Title>
} 