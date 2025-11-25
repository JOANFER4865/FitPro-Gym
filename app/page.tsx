import { CalendarGrid } from "@/components/calendar-grid"
import { getWeekAppointments } from "./actions"
import { Dumbbell } from "lucide-react"

type PageProps = {
  searchParams: Promise<{ date?: string }>
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams

  // Calcular el inicio de la semana (lunes)
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  const startDate = params.date ? getStartOfWeek(new Date(params.date)) : getStartOfWeek(new Date())

  const appointments = await getWeekAppointments(startDate)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Dumbbell className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              FitPro Gym
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Agenda tu sesión de entrenamiento personalizado. Elige el horario que mejor se adapte a ti.
          </p>
          <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full text-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="font-medium">Actualizaciones en tiempo real</span>
          </div>
        </div>

        {/* Calendar */}
        <CalendarGrid initialAppointments={appointments} initialStartDate={startDate} />

        {/* Footer info */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-card border rounded-lg p-6 max-w-2xl">
            <h3 className="font-semibold text-lg mb-2">Información de las sesiones</h3>
            <p className="text-sm text-muted-foreground">
              Cada sesión tiene una duración de <strong>2 horas</strong>. Recibirás un email de confirmación
              inmediatamente después de agendar. El entrenador será notificado de tu nueva cita.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
