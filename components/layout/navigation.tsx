'use client'

import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { useAuth } from '@/components/supabase-provider'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export function Navigation() {
  const { user } = useAuth()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Trophy className="h-6 w-6" />
            <span className="font-bold text-xl">Chess Tournament Manager</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-sm font-medium hover:underline">
              Dashboard
            </Link>
            <Link href="/tournaments" className="text-sm font-medium hover:underline">
              Tournaments
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm">{user.email}</span>
                <Button onClick={() => supabase.auth.signOut()} variant="outline" size="sm">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login" className="text-sm font-medium hover:underline">
                  Login
                </Link>
                <Link href="/auth/signup" className="text-sm font-medium hover:underline">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}