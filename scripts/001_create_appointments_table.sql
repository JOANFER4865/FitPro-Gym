-- Tabla para las citas del entrenador
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_email text not null,
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  status text default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamp with time zone default now()
);

-- Habilitar RLS
alter table public.appointments enable row level security;

-- Política para permitir a todos ver las citas (para ver disponibilidad)
create policy "appointments_select_all"
  on public.appointments for select
  using (true);

-- Política para permitir a todos crear citas
create policy "appointments_insert_all"
  on public.appointments for insert
  with check (true);

-- Crear índice para mejorar las consultas por fecha
create index idx_appointments_date on public.appointments(appointment_date, start_time);
