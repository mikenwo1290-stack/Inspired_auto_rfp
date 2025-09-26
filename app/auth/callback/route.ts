import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  
  console.log('Auth callback received:', { 
    url: request.url, 
    code: code ? 'present' : 'missing',
    allParams: Object.fromEntries(searchParams.entries())
  })
  
  if (!code) {
    console.log('No code found, redirecting to login')
    return redirect('/login')
  }
  
  const supabase = await createClient()
  
  // Exchange the code for a session
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  
  if (error) {
    console.error('Error exchanging code for session:', error)
    return redirect('/error')
  }
  
  console.log('Authentication successful, redirecting to home')
  // Successful authentication, redirect to home
  return redirect('/')
} 