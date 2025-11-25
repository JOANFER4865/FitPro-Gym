"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, Mail, User, CheckCircle2 } from "lucide-react"
import { createAppointment } from "@/app/actions"

type BookingModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: string
  time: string
}

export function BookingModal({ open, onOpenChange, date, time }: BookingModalProps) {
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const getEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(":").map(Number)
    const endHours = hours + 2
    return `${endHours.toString().padStart(2, "0")}:${minutes}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await createAppointment({
        clientName,
        clientEmail,
        date,
        startTime: time,
      })

      setIsSuccess(true)

      // Cerrar modal después de 3 segundos
      setTimeout(() => {
        onOpenChange(false)
        setIsSuccess(false)
        setClientName("")
        setClientEmail("")
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al agendar la cita")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false)
      setIsSuccess(false)
      setClientName("")
      setClientEmail("")
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">¡Cita Confirmada!</DialogTitle>
              <DialogDescription className="text-center">
                Hemos enviado un email de confirmación a {clientEmail}
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted rounded-lg p-4 w-full space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{formatDate(date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {time} - {getEndTime(time)} (2 horas)
                </span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Agendar Sesión de Entrenamiento</DialogTitle>
              <DialogDescription>Completa tus datos para reservar esta cita de 2 horas</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              {/* Información de la cita */}
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formatDate(date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {time} - {getEndTime(time)} (2 horas)
                  </span>
                </div>
              </div>

              {/* Formulario */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nombre completo
                  </Label>
                  <Input
                    id="name"
                    placeholder="Juan Pérez"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan@ejemplo.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded-lg p-3">
                  {error}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Agendando..." : "Confirmar Cita"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
