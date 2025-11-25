"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { BookingModal } from "./booking-modal"
import type { Appointment } from "@/app/actions"
import { createClient } from "@/lib/supabase/client"

type CalendarGridProps = {
  initialAppointments: Appointment[]
  initialStartDate: Date
}

const TIME_SLOTS = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"]

const DAYS_OF_WEEK = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

export function CalendarGrid({ initialAppointments, initialStartDate }: CalendarGridProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
  const [startDate, setStartDate] = useState(initialStartDate)
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string
    time: string
  } | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Suscripción en tiempo real a cambios en las citas
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("appointments_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
        },
        () => {
          // Recargar citas cuando hay cambios
          window.location.reload()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getDatesForWeek = () => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const isSlotBooked = (date: Date, time: string) => {
    const dateStr = date.toISOString().split("T")[0]
    return appointments.some((apt) => apt.appointment_date === dateStr && apt.start_time <= time && apt.end_time > time)
  }

  const goToPreviousWeek = () => {
    const newDate = new Date(startDate)
    newDate.setDate(newDate.getDate() - 7)
    setStartDate(newDate)
    window.location.href = `/?date=${newDate.toISOString().split("T")[0]}`
  }

  const goToNextWeek = () => {
    const newDate = new Date(startDate)
    newDate.setDate(newDate.getDate() + 7)
    setStartDate(newDate)
    window.location.href = `/?date=${newDate.toISOString().split("T")[0]}`
  }

  const handleSlotClick = (date: Date, time: string) => {
    if (!isSlotBooked(date, time)) {
      setSelectedSlot({
        date: date.toISOString().split("T")[0],
        time,
      })
      setShowModal(true)
    }
  }

  const weekDates = getDatesForWeek()

  return (
    <>
      <div className="space-y-6">
        {/* Header con navegación de semana */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek} className="h-10 w-10 bg-transparent">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {startDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
            </h2>
            <p className="text-sm text-muted-foreground">
              {weekDates[0].toLocaleDateString("es-ES", { day: "numeric", month: "short" })} -{" "}
              {weekDates[6].toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
            </p>
          </div>

          <Button variant="outline" size="icon" onClick={goToNextWeek} className="h-10 w-10 bg-transparent">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Grid del calendario */}
        <div className="grid grid-cols-8 gap-3">
          {/* Columna de horas */}
          <div className="space-y-3">
            <div className="h-16 flex items-center justify-center">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            {TIME_SLOTS.map((time) => (
              <div
                key={time}
                className="h-24 flex items-center justify-center text-sm font-medium text-muted-foreground"
              >
                {time}
              </div>
            ))}
          </div>

          {/* Columnas de días */}
          {weekDates.map((date, dayIndex) => (
            <div key={dayIndex} className="space-y-3">
              {/* Header del día */}
              <Card className="h-16 flex flex-col items-center justify-center bg-muted/50">
                <div className="text-xs font-medium text-muted-foreground">{DAYS_OF_WEEK[dayIndex]}</div>
                <div className="text-lg font-bold text-foreground">{date.getDate()}</div>
              </Card>

              {/* Slots de tiempo */}
              {TIME_SLOTS.map((time) => {
                const booked = isSlotBooked(date, time)
                return (
                  <Card
                    key={time}
                    className={`h-24 flex items-center justify-center cursor-pointer transition-all hover:shadow-md ${
                      booked
                        ? "bg-red-100 dark:bg-red-950 cursor-not-allowed"
                        : "bg-green-50 dark:bg-green-950 hover:bg-green-100 dark:hover:bg-green-900"
                    }`}
                    onClick={() => handleSlotClick(date, time)}
                  >
                    <span
                      className={`text-xs font-medium ${
                        booked ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {booked ? "Ocupado" : "Disponible"}
                    </span>
                  </Card>
                )
              })}
            </div>
          ))}
        </div>

        {/* Leyenda */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-green-100 dark:bg-green-950 border border-green-300 dark:border-green-700" />
            <span className="text-muted-foreground">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-700" />
            <span className="text-muted-foreground">Ocupado</span>
          </div>
        </div>
      </div>

      {/* Modal de reserva */}
      {selectedSlot && (
        <BookingModal open={showModal} onOpenChange={setShowModal} date={selectedSlot.date} time={selectedSlot.time} />
      )}
    </>
  )
}
