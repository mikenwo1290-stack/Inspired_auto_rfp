'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Something went wrong with the authentication process. This could be due to:
          </p>
          <ul className="mt-4 text-sm text-gray-500 text-left max-w-sm mx-auto">
            <li>• Invalid email address</li>
            <li>• Network connectivity issues</li>
            <li>• Supabase service temporarily unavailable</li>
            <li>• Expired or invalid magic link</li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/login">
              Try Again
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}