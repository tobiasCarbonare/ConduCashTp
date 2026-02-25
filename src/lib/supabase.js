import { createClient } from '@supabase/supabase-js'

/**
 * CONFIGURACIÓN DE SUPABASE
 * 
 * Se obtienen las credenciales desde las variables de entorno (.env).
 * VITE_SUPABASE_URL: La dirección del proyecto en la nube de Supabase.
 * VITE_SUPABASE_ANON_KEY: La clave de API pública (anónima).
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verificación de seguridad para asegurar que las variables de entorno están cargadas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Variables de entorno de Supabase no encontradas.')
}

// Inicialización del cliente de Supabase para interactuar con la Base de Datos y Autenticación
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
