import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseAnonKey)
  throw new Error('Missing Supabase environment variables')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch {
  console.error('❌ Invalid Supabase URL format:', supabaseUrl)
  throw new Error('Invalid Supabase URL format')
}

console.log('✅ Supabase configuration loaded successfully')
console.log('🔗 Supabase URL:', supabaseUrl)
console.log('🔑 Anon Key length:', supabaseAnonKey.length)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Test connection on client side
if (typeof window !== 'undefined') {
  // Test realtime connection by creating a test channel
  const testChannel = supabase.channel('connection_test')
  testChannel.subscribe((status) => {
    console.log('📡 Supabase realtime status:', status)
    if (status === 'SUBSCRIBED') {
      console.log('✅ Supabase realtime connection working')
      // Cleanup test channel
      setTimeout(() => {
        supabase.removeChannel(testChannel)
      }, 1000)
    } else if (status === 'CHANNEL_ERROR') {
      console.error('❌ Supabase realtime connection failed')
    }
  })
} 