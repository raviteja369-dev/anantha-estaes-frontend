import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const fillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@ananthaestates.com')
      setPassword('admin123')
    } else {
      setEmail('employee@ananthaestates.com')
      setPassword('employee123')
    }
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email.trim().toLowerCase(), password)
      navigate(user.role === 'super_admin' ? '/dashboard' : '/employee/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex gradient-bg">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-blue-500/10" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-md"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/30">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Anantha Estates</h1>
              <p className="text-muted-foreground">Plot Management System</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Manage your real estate empire with precision
          </h2>
          <p className="text-muted-foreground text-lg">
            Interactive plot layouts, employee management, payment tracking, and powerful analytics — all in one premium dashboard.
          </p>
        </motion.div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <Card className="glass border-0 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in to your account to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3 text-center">{error}</div>
                )}
                <div>
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" type="text" inputMode="email" autoComplete="off" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <Label>Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" type="password" autoComplete="off" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
              <div className="mt-6 p-4 rounded-lg bg-muted/50 text-xs text-muted-foreground space-y-3">
                <p className="font-medium text-foreground">Demo Credentials</p>
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => fillDemo('admin')} className="text-left rounded-md border border-border bg-background px-3 py-2 hover:bg-accent transition-colors cursor-pointer">
                    <span className="font-medium text-foreground">Admin</span>
                    <span className="block mt-0.5">admin@ananthaestates.com / admin123</span>
                  </button>
                  <button type="button" onClick={() => fillDemo('employee')} className="text-left rounded-md border border-border bg-background px-3 py-2 hover:bg-accent transition-colors cursor-pointer">
                    <span className="font-medium text-foreground">Employee</span>
                    <span className="block mt-0.5">employee@ananthaestates.com / employee123</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
