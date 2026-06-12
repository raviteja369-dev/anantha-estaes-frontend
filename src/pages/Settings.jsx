import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Moon, Sun, User, Shield } from 'lucide-react'

export default function Settings() {
  const { dark, toggleTheme } = useTheme()
  const { user } = useAuth()

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Name</span><span className="font-medium">{user?.name}</span></div>
          <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Email</span><span className="font-medium">{user?.email}</span></div>
          <div className="flex justify-between py-2"><span className="text-muted-foreground">Role</span><span className="font-medium capitalize flex items-center gap-1"><Shield className="h-3.5 w-3.5" />{user?.role?.replace('_', ' ')}</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">{dark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />} Appearance</CardTitle>
          <CardDescription>Customize how Anantha Estates looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode">Dark Mode</Label>
            <Switch id="dark-mode" checked={dark} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
