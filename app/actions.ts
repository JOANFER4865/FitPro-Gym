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
  try {
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 7)

    const startDateStr = startDate.toISOString().split("T")[0]
    const endDateStr = endDate.toISOString().split("T")[0]

    console.log("[v0] Fetching appointments via RPC from", startDateStr, "to", endDateStr)

    const supabase = await createClient()

    const { data, error } = await supabase.rpc("get_week_appointments", {
      start_date: startDateStr,
      end_date: endDateStr,
    })

    if (error) {
      console.error("[v0] RPC error:", error)
      // Devolver array vacío si hay error
      return []
    }

    console.log("[v0] Found", data?.length || 0, "appointments")
    return (data || []) as Appointment[]
  } catch (error) {
    console.error("[v0] Error fetching appointments:", error)
    return []
  }
}

export async function createAppointment(formData: {
  clientName: string
  clientEmail: string
  date: string
  startTime: string
}) {
  try {
    // Calcular hora de fin (2 horas después)
    const [hours, minutes] = formData.startTime.split(":").map(Number)
    const endHours = hours + 2
    const endTime = `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`

    console.log(
      "[v0] Creating appointment via RPC for",
      formData.clientName,
      "on",
      formData.date,
      "at",
      formData.startTime,
    )

    const supabase = await createClient()

    const { data, error } = await supabase.rpc("create_appointment", {
      p_client_name: formData.clientName,
      p_client_email: formData.clientEmail,
      p_appointment_date: formData.date,
      p_start_time: formData.startTime,
      p_end_time: endTime,
    })

    if (error) {
      console.error("[v0] Create RPC error:", error)
      throw new Error("No se pudo crear la cita")
    }

    console.log("[v0] Appointment created successfully")

    revalidatePath("/")
    return (data?.[0] || data) as Appointment
  } catch (error) {
    console.error("[v0] Error creating appointment:", error)
    throw new Error("No se pudo crear la cita. Por favor intenta nuevamente.")
  }
}
