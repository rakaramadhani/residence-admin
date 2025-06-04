import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL atau Anon Key tidak ditemukan. Emergency realtime subscription tidak akan berfungsi.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Types untuk realtime payload
export interface EmergencyRealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: any
  old: any
  schema: string
  table: string
}

// Helper function untuk subscribe ke emergency changes
export const subscribeToEmergencyChanges = (
  callback: (payload: EmergencyRealtimePayload) => void
) => {
  const channel = supabase
    .channel('emergency-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'Emergency' // Sesuaikan dengan nama tabel di database
      },
      (payload) => {
        console.log('Emergency realtime event:', payload)
        callback(payload as EmergencyRealtimePayload)
      }
    )
    .subscribe()

  return channel
} 