import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import LoginBrandPanel from './components/LoginBrandPanel'
import LoginLogo from './components/LoginLogo'
import LoginForm from './components/LoginForm'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (email, password) => {
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'super_admin' ? '/dashboard' : '/employee/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <LoginBrandPanel />

      <main className="relative flex flex-1 flex-col bg-slate-100">
        {/* Mobile brand header */}
        <div className="relative overflow-hidden lg:hidden bg-slate-900 px-6 py-8">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-36 bg-[linear-gradient(145deg,#0f172a_0%,#1e1b4b_100%)]"
          />
          <div className="relative">
            <LoginLogo variant="dark" />
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 lg:py-12">
          <div className="w-full max-w-[420px]">
            <div className="mb-8 hidden lg:block">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
                Sign in
              </h1>
              <p className="mt-2 text-[14px] text-slate-500">
                Enter your credentials to access the dashboard.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-7 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.04)] lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
              <div className="mb-6 border-b border-slate-100 pb-5 lg:hidden">
                <h1 className="text-lg font-semibold text-slate-900">Sign in to your account</h1>
                <p className="mt-1 text-[13px] text-slate-500">
                  Enter your credentials to continue.
                </p>
              </div>

              <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
            </div>

            <div className="mt-8 space-y-3 text-center">
              <p className="text-[12px] text-slate-500">
                Need access? Contact your system administrator.
              </p>
              <div className="flex items-center justify-center gap-3 text-[12px] text-slate-400">
                <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
                <span aria-hidden>·</span>
                <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
              </div>
              <p className="text-[11px] text-slate-400 lg:hidden">
                © {new Date().getFullYear()} Anantha Estates
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
