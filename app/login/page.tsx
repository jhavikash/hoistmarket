'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, Building2, ArrowRight, CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase as _sb } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = _sb

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signupSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  account_type: z.enum(['user', 'vendor']),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

const resetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type LoginData = z.infer<typeof loginSchema>
type SignupData = z.infer<typeof signupSchema>
type ResetData = z.infer<typeof resetSchema>

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy-950 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <LoginPageInner />
    </Suspense>
  )
}

function LoginPageInner() {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push(redirectTo)
    })
  }, [router, redirectTo])

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) })
  const signupForm = useForm<SignupData>({ resolver: zodResolver(signupSchema), defaultValues: { account_type: 'user' } })
  const resetForm = useForm<ResetData>({ resolver: zodResolver(resetSchema) })

  const handleLogin = async (data: LoginData) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome back!')
      // Check role to redirect
      const { data: profile } = await supabase.from('profiles').select('role').eq('email', data.email).single()
      if (profile?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push(redirectTo)
      }
    }
  }

  const handleSignup = async (data: SignupData) => {
    const { error, data: authData } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          company: data.company || null,
          role: data.account_type,
        },
      },
    })

    if (error) {
      toast.error(error.message)
      return
    }

    // Update profile
    if (authData.user) {
      await supabase.from('profiles').upsert({
        id: authData.user.id,
        email: data.email,
        full_name: data.full_name,
        company: data.company || null,
        role: data.account_type,
      })
    }

    toast.success('Account created! Please check your email to confirm.')
    setMode('login')
  }

  const handleReset = async (data: ResetData) => {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/login`,
    })
    if (error) {
      toast.error(error.message)
    } else {
      setResetSent(true)
      toast.success('Password reset email sent!')
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-hero-gradient p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-gradient-to-tl from-orange-500/8 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-base">HM</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Hoist<span className="text-orange-500">Market</span>
            </span>
          </Link>

          <div>
            <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-400 mb-4">Platform Access</div>
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-6">
              The Global Reference<br/>
              for <span className="text-orange-500">Lifting Professionals</span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed mb-10">
              Access technical guides, submit equipment RFQs, manage vendor listings, and 
              track your enquiries — all in one platform.
            </p>
            <div className="space-y-3">
              {[
                'Free access to knowledge base & standards guides',
                'Submit equipment RFQs to verified vendors',
                'Track your enquiries and receive matched quotes',
                'Vendor accounts: manage listings and respond to leads',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="text-slate-400 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10 pt-6">
          <p className="text-slate-600 text-xs">
            © 2026 HoistMarket · Independent · Vendor-neutral · Free to access<br/>
            Monrovia, Liberia · India · GCC · West Africa
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HM</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Hoist<span className="text-orange-500">Market</span>
            </span>
          </div>

          {/* Tab Switcher */}
          {mode !== 'reset' && (
            <div className="flex bg-white/5 rounded-lg p-1 mb-8">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
                  mode === 'login' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
                  mode === 'signup' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {mode === 'login' && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
                <p className="text-slate-500 text-sm">Sign in to your HoistMarket account</p>
              </div>

              <div>
                <label className="label-dark">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    {...loginForm.register('email')}
                    type="email"
                    className="input-dark pl-10"
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="label-dark">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    {...loginForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="input-dark pl-10 pr-10"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-end">
                <button type="button" onClick={() => setMode('reset')} className="text-xs text-slate-500 hover:text-orange-400 transition-colors">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loginForm.formState.isSubmitting}
                className="btn-primary w-full justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loginForm.formState.isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              {/* Admin hint */}
              <div className="bg-navy-800 border border-navy-600 rounded-lg p-3 mt-2">
                <p className="text-xs text-slate-400">
                  <span className="text-orange-400 font-semibold">Admin access:</span> Use your admin email. 
                  The system automatically grants admin privileges based on your registered admin email.
                </p>
              </div>
            </form>
          )}

          {/* ── SIGNUP FORM ── */}
          {mode === 'signup' && (
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
                <p className="text-slate-500 text-sm">Free access to the full HoistMarket platform</p>
              </div>

              {/* Account Type */}
              <div>
                <label className="label-dark">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'user', label: 'Buyer / Engineer', desc: 'Submit RFQs, access resources' },
                    { value: 'vendor', label: 'Vendor / Supplier', desc: 'List company, receive RFQs' },
                  ].map((type) => (
                    <label
                      key={type.value}
                      className={`relative flex flex-col p-3 border rounded-lg cursor-pointer transition-all ${
                        signupForm.watch('account_type') === type.value
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-navy-600 bg-navy-800/50 hover:border-navy-500'
                      }`}
                    >
                      <input {...signupForm.register('account_type')} type="radio" value={type.value} className="sr-only" />
                      <span className="text-sm font-semibold text-white">{type.label}</span>
                      <span className="text-xs text-slate-500 mt-0.5">{type.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-dark">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input {...signupForm.register('full_name')} className="input-dark pl-10" placeholder="Your name" />
                  </div>
                  {signupForm.formState.errors.full_name && (
                    <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.full_name.message}</p>
                  )}
                </div>
                <div>
                  <label className="label-dark">Company</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input {...signupForm.register('company')} className="input-dark pl-10" placeholder="Optional" />
                  </div>
                </div>
              </div>

              <div>
                <label className="label-dark">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input {...signupForm.register('email')} type="email" className="input-dark pl-10" placeholder="you@company.com" />
                </div>
                {signupForm.formState.errors.email && (
                  <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-dark">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      {...signupForm.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      className="input-dark pl-10 pr-10"
                      placeholder="Min 8 chars"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {signupForm.formState.errors.password && (
                    <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.password.message}</p>
                  )}
                </div>
                <div>
                  <label className="label-dark">Confirm Password</label>
                  <input {...signupForm.register('confirmPassword')} type="password" className="input-dark" placeholder="Repeat password" />
                  {signupForm.formState.errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={signupForm.formState.isSubmitting}
                className="btn-primary w-full justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {signupForm.formState.isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <p className="text-xs text-slate-600 text-center">
                By creating an account you agree to our{' '}
                <Link href="/terms" className="text-orange-400 hover:underline">Terms of Use</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-orange-400 hover:underline">Privacy Policy</Link>
              </p>
            </form>
          )}

          {/* ── PASSWORD RESET ── */}
          {mode === 'reset' && (
            <div>
              <button onClick={() => setMode('login')} className="text-slate-500 hover:text-white text-sm flex items-center gap-1 mb-6 transition-colors">
                ← Back to Sign In
              </button>
              {resetSent ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
                  <p className="text-slate-400 text-sm">
                    We've sent a password reset link to your email address. 
                    Follow the link to set a new password.
                  </p>
                </div>
              ) : (
                <form onSubmit={resetForm.handleSubmit(handleReset)} className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Reset password</h2>
                    <p className="text-slate-500 text-sm">Enter your email and we'll send you a reset link</p>
                  </div>
                  <div>
                    <label className="label-dark">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input {...resetForm.register('email')} type="email" className="input-dark pl-10" placeholder="you@company.com" />
                    </div>
                    {resetForm.formState.errors.email && (
                      <p className="text-red-400 text-xs mt-1">{resetForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={resetForm.formState.isSubmitting}
                    className="btn-primary w-full justify-center py-3 disabled:opacity-60"
                  >
                    {resetForm.formState.isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Send Reset Link <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
