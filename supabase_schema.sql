-- TABLA DE PERFILES (Extiende la autenticación de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre_completo TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver su propio perfil" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Función para manejar la creación automática de un perfil al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre_completo)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'nombre_completo');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función handle_new_user
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- TABLA DE REGISTROS DE GANANCIAS
CREATE TABLE IF NOT EXISTS public.registros_ganancias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  ganancias NUMERIC(12,2) NOT NULL DEFAULT 0,
  viajes INTEGER NOT NULL DEFAULT 0,
  kms NUMERIC(10,2) NOT NULL DEFAULT 0,
  horas NUMERIC(10,2) NOT NULL DEFAULT 0,
  ganancias_extras NUMERIC(12,2) NOT NULL DEFAULT 0,
  combustible NUMERIC(12,2) NOT NULL DEFAULT 0,
  gastos_varios NUMERIC(12,2) NOT NULL DEFAULT 0,
  ganancia_neta NUMERIC(12,2) GENERATED ALWAYS AS (ganancias + ganancias_extras - (combustible + gastos_varios)) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en registros_ganancias
ALTER TABLE public.registros_ganancias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar sus propios registros de ganancias"
  ON public.registros_ganancias
  FOR ALL
  USING (auth.uid() = user_id);


-- TABLA DE MANTENIMIENTO DEL VEHÍCULO
CREATE TABLE IF NOT EXISTS public.servicios_mantenimiento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipo_servicio TEXT NOT NULL, -- 'vtv', 'aceite', 'distribucion', 'frenos'
  kilomentraje_en_servicio INTEGER NOT NULL,
  fecha_servicio DATE NOT NULL DEFAULT CURRENT_DATE,
  proximo_vencimiento_km INTEGER,
  proximo_vencimiento_fecha DATE,
  comentarios TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en servicios_mantenimiento
ALTER TABLE public.servicios_mantenimiento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar sus propios servicios de mantenimiento"
  ON public.servicios_mantenimiento
  FOR ALL
  USING (auth.uid() = user_id);



