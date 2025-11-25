"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type Appointment = {
  id: string
  client_name: string
  client_email: string
  appointment_date: string
  start_time: string
  end_time: string
  status: string
  created_at: string
}

export async function getWeekAppointments(startDate: Date) {
  const supabase = await createClient()

  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 7)

  const { data, error } = await supabase.rpc("get_week_appointments", {
    start_date: startDate.toISOString().split("T")[0],
    end_date: endDate.toISOString().split("T")[0],
  })

  if (error) {
    console.error("[v0] Error fetching appointments:", error)
    throw new Error("No se pudieron cargar las citas")
  }

  return data as Appointment[]
}

export async function createAppointment(formData: {
  clientName: string
  clientEmail: string
  date: string
  startTime: string
}) {
  const supabase = await createClient()

  // Calcular hora de fin (2 horas después)
  const [hours, minutes] = formData.startTime.split(":").map(Number)
  const endHours = hours + 2
  const endTime = `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`

  const { data, error } = await supabase.rpc("create_appointment", {
    p_client_name: formData.clientName,
    p_client_email: formData.clientEmail,
    p_appointment_date: formData.date,
    p_start_time: formData.startTime,
    p_end_time: endTime,
  })

  if (error) {
    console.error("[v0] Error creating appointment:", error)
    throw new Error("No se pudo crear la cita")
  }

  revalidatePath("/")
  return data[0] as Appointment
}
