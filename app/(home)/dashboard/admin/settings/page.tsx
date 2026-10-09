'use client'

import { useState, useEffect } from 'react'
import {
  ShieldCheck,
  KeyRound,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  Shield,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface AdminInfo {
  id: string
  name: string
  email: string
  role: string
  createdAt?: string
  updatedAt?: string
  hasPassword?: boolean
}

export default function AdminSettingsPage() {
  const [admin, setAdmin] = useState<AdminInfo | null>(null)
  const [loadingInitial, setLoadingInitial] = useState(true)

  // Profile Form state
  const [profileName, setProfileName] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Email Form state
  const [newEmail, setNewEmail] = useState('')
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('')
  const [showEmailPassword, setShowEmailPassword] = useState(false)
  const [savingEmail, setSavingEmail] = useState(false)

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  // Active sub-tab
  const [activeSection, setActiveSection] = useState<'security' | 'email' | 'profile'>('security')

  // Fetch admin profile
  const fetchAdminDetails = async () => {
    try {
      setLoadingInitial(true)
      const res = await fetch('/api/admin/settings/credentials')
      if (!res.ok) {
        throw new Error('Failed to load admin profile.')
      }
      const data = await res.json()
      if (data.admin) {
        setAdmin(data.admin)
        setProfileName(data.admin.name || '')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch admin settings'
      toast.error(msg)
    } finally {
      setLoadingInitial(false)
    }
  }

  useEffect(() => {
    fetchAdminDetails()
  }, [])

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileName.trim()) {
      toast.error('Name cannot be empty')
      return
    }

    setSavingProfile(true)
    try {
      const res = await fetch('/api/admin/settings/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_PROFILE',
          name: profileName.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile name')
      }

      toast.success(data.message || 'Profile name updated successfully')
      if (admin) {
        setAdmin({ ...admin, name: profileName.trim() })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating profile'
      toast.error(msg)
    } finally {
      setSavingProfile(false)
    }
  }

  // Handle Email Update
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedEmail = newEmail.trim().toLowerCase()

    if (!trimmedEmail) {
      toast.error('Please enter a new email address')
      return
    }

    if (admin && trimmedEmail === admin.email.toLowerCase()) {
      toast.error('New email must be different from current email')
      return
    }

    if (!emailCurrentPassword) {
      toast.error('Please enter your current password to verify identity')
      return
    }

    setSavingEmail(true)
    try {
      const res = await fetch('/api/admin/settings/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_EMAIL',
          newEmail: trimmedEmail,
          currentPassword: emailCurrentPassword,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update email')
      }

      toast.success(data.message || 'Email updated successfully')
      if (admin) {
        setAdmin({ ...admin, email: trimmedEmail })
      }
      setNewEmail('')
      setEmailCurrentPassword('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating email'
      toast.error(msg)
    } finally {
      setSavingEmail(false)
    }
  }

  // Handle Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword) {
      toast.error('Please enter your current password')
      return
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    setSavingPassword(true)
    try {
      const res = await fetch('/api/admin/settings/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_PASSWORD',
          currentPassword,
          newPassword,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password')
      }

      toast.success(data.message || 'Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error changing password'
      toast.error(msg)
    } finally {
      setSavingPassword(false)
    }
  }

  if (loadingInitial) {
    return (
      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-5 w-96 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-64 md:col-span-2 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Admin Settings & Security
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your administrative credentials, login email, password, and security preferences.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchAdminDetails}
          disabled={loadingInitial}
          className="self-start sm:self-auto gap-2 text-xs h-9"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loadingInitial ? 'animate-spin' : ''}`} />
          Refresh Details
        </Button>
      </div>

      {/* Grid: Left Column (Profile summary) & Right Column (Management Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Summary Card & Navigation */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border/80 shadow-xs overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-purple-500/10 border-b border-border/50 relative" />
            <div className="px-6 pb-6 -mt-10">
              <div className="relative mb-4">
                <div className="h-18 w-18 rounded-2xl bg-card border-2 border-primary/30 shadow-md flex items-center justify-center text-primary font-bold text-xl">
                  {admin?.name ? admin.name.substring(0, 2).toUpperCase() : 'AD'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg text-foreground">
                    {admin?.name || 'Administrator'}
                  </h3>
                  <Badge variant="default" className="text-[10px] tracking-wider uppercase bg-primary text-primary-foreground font-semibold px-2 py-0.5">
                    {admin?.role || 'ADMIN'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground break-all">{admin?.email}</p>
              </div>

              <div className="mt-6 pt-5 border-t border-border/60 space-y-3 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-primary" /> Access Level
                  </span>
                  <span className="font-medium text-foreground">Super Administrator</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-emerald-500" /> Authentication
                  </span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">Password Protected</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Nav Switches */}
          <div className="flex flex-col gap-1.5 bg-muted/30 p-1.5 rounded-xl border border-border/50">
            <button
              onClick={() => setActiveSection('security')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeSection === 'security'
                  ? 'bg-card text-foreground shadow-xs border border-border/80'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <KeyRound className="h-4 w-4 text-primary" />
                <span>Change Password</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 opacity-50" />
            </button>

            <button
              onClick={() => setActiveSection('email')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeSection === 'email'
                  ? 'bg-card text-foreground shadow-xs border border-border/80'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-primary" />
                <span>Change Login Email</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 opacity-50" />
            </button>

            <button
              onClick={() => setActiveSection('profile')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeSection === 'profile'
                  ? 'bg-card text-foreground shadow-xs border border-border/80'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-primary" />
                <span>Admin Profile Name</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 opacity-50" />
            </button>
          </div>
        </div>

        {/* Right Side: Active Section Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION: CHANGE PASSWORD */}
          {activeSection === 'security' && (
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="border-b border-border/50 pb-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Change Admin Password</CardTitle>
                    <CardDescription className="text-xs">
                      Update your administrator account password. Your new password will be active immediately.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <form onSubmit={handleUpdatePassword} className="space-y-5">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label htmlFor="current-pass" className="text-sm font-medium">
                      Current Password <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="current-pass"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current admin password"
                        required
                        className="pr-10 h-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Toggle password visibility"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="new-pass" className="text-sm font-medium">
                      New Password <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="new-pass"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        required
                        minLength={8}
                        className="pr-10 h-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Toggle password visibility"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-pass" className="text-sm font-medium">
                      Confirm New Password <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-pass"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your new password"
                        required
                        minLength={8}
                        className="pr-10 h-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Toggle password visibility"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Requirements checklist */}
                  <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/50 text-xs space-y-2 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${
                          newPassword.length >= 8 ? 'text-emerald-500' : 'text-muted-foreground/50'
                        }`}
                      />
                      <span className={newPassword.length >= 8 ? 'text-foreground font-medium' : ''}>
                        At least 8 characters long
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${
                          newPassword && newPassword === confirmPassword
                            ? 'text-emerald-500'
                            : 'text-muted-foreground/50'
                        }`}
                      />
                      <span
                        className={
                          newPassword && newPassword === confirmPassword ? 'text-foreground font-medium' : ''
                        }
                      >
                        Passwords match
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={savingPassword || !currentPassword || newPassword.length < 8 || newPassword !== confirmPassword}
                      className="px-6 h-10 font-semibold"
                    >
                      {savingPassword && <LoadingSpinner size="sm" className="mr-2" />}
                      {savingPassword ? 'Updating Password...' : 'Save New Password'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* SECTION: CHANGE EMAIL */}
          {activeSection === 'email' && (
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="border-b border-border/50 pb-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Change Admin Email Address</CardTitle>
                    <CardDescription className="text-xs">
                      Update the primary email address used to log into the HairCrew admin dashboard.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <form onSubmit={handleUpdateEmail} className="space-y-5">
                  {/* Current Email Display */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Current Admin Email</Label>
                    <Input
                      type="email"
                      value={admin?.email || ''}
                      disabled
                      className="bg-muted/50 text-muted-foreground cursor-not-allowed h-10"
                    />
                  </div>

                  {/* New Email */}
                  <div className="space-y-2">
                    <Label htmlFor="new-email" className="text-sm font-medium">
                      New Admin Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="new-email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="e.g. admin@haircrew.in"
                      required
                      className="h-10"
                    />
                  </div>

                  {/* Current Password Verification */}
                  <div className="space-y-2">
                    <Label htmlFor="email-current-pass" className="text-sm font-medium">
                      Current Password (for Verification) <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="email-current-pass"
                        type={showEmailPassword ? 'text' : 'password'}
                        value={emailCurrentPassword}
                        onChange={(e) => setEmailCurrentPassword(e.target.value)}
                        placeholder="Enter your current password to authorize this change"
                        required
                        className="pr-10 h-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmailPassword(!showEmailPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Toggle password visibility"
                      >
                        {showEmailPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Warning Notice */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <strong className="font-semibold block mb-0.5">Important Security Notice:</strong>
                      Changing this email updates your administrator login identifier immediately. Next time you sign in to the portal, you must provide this new email.
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={savingEmail || !newEmail || !emailCurrentPassword}
                      className="px-6 h-10 font-semibold"
                    >
                      {savingEmail && <LoadingSpinner size="sm" className="mr-2" />}
                      {savingEmail ? 'Updating Email...' : 'Save New Email'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* SECTION: PROFILE NAME */}
          {activeSection === 'profile' && (
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="border-b border-border/50 pb-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Admin Profile Name</CardTitle>
                    <CardDescription className="text-xs">
                      Update the display name shown on your administrative dashboard.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="admin-name" className="text-sm font-medium">
                      Display Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="admin-name"
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. HairCrew Admin"
                      required
                      className="h-10"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={savingProfile || !profileName.trim()}
                      className="px-6 h-10 font-semibold"
                    >
                      {savingProfile && <LoadingSpinner size="sm" className="mr-2" />}
                      {savingProfile ? 'Saving...' : 'Save Display Name'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}