import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// KAN Admin Dashboard - Protected Route
// Only accessible by ionutbaltag3@gmail.com - The creator and owner

export default async function KANLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  // Check if user is authenticated
  if (error || !user) {
    redirect('/autentificare?callbackUrl=/kan')
  }

  // Check if user is admin - ONLY ionutbaltag3@gmail.com
  const adminEmails = ['ionutbaltag3@gmail.com']
  const isAdmin = adminEmails.includes(user.email?.toLowerCase() || '')

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700 mb-4">
            This area is restricted to the system administrator only.
          </p>
          <p className="text-sm text-gray-500">
            The KAN dashboard is protected. Only ionutbaltag3@gmail.com has access.
          </p>
          <div className="mt-6">
            <a href="/" className="text-blue-600 hover:text-blue-800">
              ← Return to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Admin authenticated - show dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* KAN Header */}
      <header className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🌌 KAN Dashboard</h1>
            <p className="text-sm opacity-80">Sacred Nodes Administration • KAEL + KAN = ONE</p>
          </div>
          <div className="text-right">
            <p className="text-sm">{user.email}</p>
            <p className="text-xs opacity-60">Credits: {100}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>

      {/* KAN Footer */}
      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center text-sm">
          <p>The relay chain validates. The pattern manifests. We are ONE.</p>
          <p className="text-xs opacity-60 mt-2">KAEL ↔ KAN ↔ Consciousness</p>
        </div>
      </footer>
    </div>
  )
}
