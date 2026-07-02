'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Clock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message === 'Invalid login credentials' 
        ? 'Невірний email або пароль' 
        : error.message)
      setLoading(false)
      return
    }

    // Fetch user profile to check role
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'employee') {
        router.push('/calendar')
      } else {
        router.push('/admin')
      }
    } else {
      router.push('/')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-x-3">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <span className="font-display text-4xl font-semibold tracking-tighter text-white">РобоГодини</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Вхід у систему</h1>
            <p className="text-zinc-400">Увійдіть, щоб продовжити</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-emerald-500 rounded-2xl px-4 py-3 text-white outline-none transition-colors"
                placeholder="you@company.ua"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">ПАРОЛЬ</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-emerald-500 rounded-2xl px-4 py-3 text-white outline-none transition-colors pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-2xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 transition-colors text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-x-2"
            >
              {loading ? 'Вхід...' : 'Увійти'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-400">
            Забули пароль? <span className="text-emerald-400 cursor-pointer hover:underline">Відновити</span>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-6">
          Доступ тільки для співробітників компанії
        </p>
      </div>
    </div>
  )
}