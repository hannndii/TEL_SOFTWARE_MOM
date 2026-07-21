'use client'

import { useState, useTransition } from 'react'
import { User, Shield, CreditCard, Loader2, CheckCircle2, AlertTriangle, Key, Copy, Check } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { updatePassword, deleteAccount } from './actions'
import PasswordInput from '@/components/PasswordInput'

type Tab = 'profile' | 'security' | 'billing'

export default function SettingsClient({ userProfile, userEmail }: { userProfile: any, userEmail: string }) {
  const searchParams = useSearchParams()
  const activeTab = (searchParams.get('tab') as Tab) || 'profile'
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  // Security Tab States
  const [isPending, startTransition] = useTransition()
  const [securityMessage, setSecurityMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const isPremium = userProfile?.tier === 'premium'
  const router = useRouter()

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      const response = await fetch('/api/payment/midtrans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      })
      const data = await response.json()
      if (data.redirect_url) {
        window.location.href = data.redirect_url
      } else {
        alert(data.error || 'Failed to initialize payment')
        setIsUpgrading(false)
      }
    } catch (error) {
      console.error(error)
      alert('Network error')
      setIsUpgrading(false)
    }
  }

  const handlePasswordUpdate = async (formData: FormData) => {
    setSecurityMessage(null)
    startTransition(async () => {
      const result = await updatePassword(formData)
      if (result.error) {
        setSecurityMessage({ type: 'error', text: result.error })
      } else {
        setSecurityMessage({ type: 'success', text: 'Password updated successfully!' })
        // Clear form
        const form = document.getElementById('password-form') as HTMLFormElement
        if (form) form.reset()
      }
    })
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.")
    if (!confirmed) return

    setSecurityMessage(null)
    startTransition(async () => {
      const result = await deleteAccount()
      if (result?.error) {
        setSecurityMessage({ type: 'error', text: result.error })
      }
    })
  }

  return (
    <div className="w-full">
      {/* CLEAN HEADER */}
      <div className="max-w-4xl mx-auto pt-6 pb-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 mt-2 text-sm">Manage your profile, preferences, and billing.</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Content Area */}
        <div className="w-full space-y-6">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <div className="flex flex-col items-center space-y-8">
                  
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center space-y-5">
                    <div className="w-28 h-28 rounded-full bg-slate-800 flex items-center justify-center text-white text-4xl font-bold shadow-sm ring-4 ring-slate-50">
                      {userEmail.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold text-slate-900">{userEmail.split('@')[0]}</h3>
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${isPremium ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                        {isPremium ? 'Premium Member' : 'Free Member'}
                      </span>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="w-full max-w-2xl space-y-8 mt-4">
                    <div className="border-b border-slate-100 pb-4 text-center">
                      <h2 className="text-2xl font-bold text-slate-900">Personal Information</h2>
                      <p className="text-sm text-slate-500 mt-1">Your basic account details.</p>
                    </div>

                    <div className="space-y-6 max-w-xl mx-auto">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
                          <User size={16} className="text-slate-400" /> Email Address
                        </label>
                        <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900">
                          {userEmail}
                        </div>
                      </div>
                      
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
                          <Shield size={16} className="text-slate-400" /> Account ID
                        </label>
                        <div className="relative">
                          <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-mono text-sm pr-12 truncate">
                            {userProfile?.id}
                          </div>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(userProfile?.id || '');
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                            title="Copy ID"
                          >
                            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Change Password Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Key className="text-gray-400" size={20} />
                  <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
                </div>
                
                {securityMessage && (
                  <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${securityMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {securityMessage.text}
                  </div>
                )}

                <form id="password-form" action={handlePasswordUpdate} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <PasswordInput 
                      id="password"
                      name="password"
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <PasswordInput 
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Repeat new password"
                      required
                      minLength={6}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isPending}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-lg font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
                  >
                    {isPending ? <Loader2 size={16} className="animate-spin" /> : null}
                    Update Password
                  </button>
                </form>
              </div>

              {/* Danger Zone Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="text-red-500" size={20} />
                  <h2 className="text-lg font-bold text-red-600">Danger Zone</h2>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  Permanently delete your account and all of your data. This action is not reversible.
                </p>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isPending}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-5 py-2 rounded-lg font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isPending ? <Loader2 size={16} className="animate-spin" /> : null}
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* BILLING TAB */}
          {activeTab === 'billing' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Subscription Plan</h2>
                  <p className="text-gray-500 mt-2">Manage your billing and choose the right plan for your team's needs.</p>
                </div>
                
                {/* Current Plan Status Banner */}
                <div className={`p-4 rounded-xl border mb-8 flex items-center justify-between ${isPremium ? 'border-green-200 bg-green-50' : 'border-blue-100 bg-blue-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPremium ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {isPremium ? <CheckCircle2 size={24} /> : <Shield size={24} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Current Plan</p>
                      <p className={`text-lg font-bold ${isPremium ? 'text-green-700' : 'text-blue-700'}`}>{isPremium ? 'Premium Tier' : 'Free Tier'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">Daily Quota Left</p>
                    <p className="text-xl font-bold text-gray-900">{isPremium ? 'Unlimited' : `${userProfile?.daily_quota_left ?? 3} / 3`}</p>
                  </div>
                </div>

                {/* Plan Comparison */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Free Plan */}
                  <div className={`relative p-6 rounded-2xl border-2 transition-all ${!isPremium ? 'border-gray-900 shadow-lg' : 'border-gray-100 hover:border-gray-200 opacity-70'}`}>
                    {!isPremium && (
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                        CURRENT
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-900">Starter</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-gray-900">Rp 0</span>
                      <span className="text-sm font-medium text-gray-500">/ forever</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Perfect for trying out our AI capabilities.</p>
                    
                    <ul className="mt-6 space-y-3">
                      <li className="flex items-start gap-3 text-sm text-gray-700">
                        <CheckCircle2 size={18} className="text-gray-400 shrink-0 mt-0.5" />
                        3 AI MoM Generations per day
                      </li>
                      <li className="flex items-start gap-3 text-sm text-gray-700">
                        <CheckCircle2 size={18} className="text-gray-400 shrink-0 mt-0.5" />
                        Text / Document upload only
                      </li>
                      <li className="flex items-start gap-3 text-sm text-gray-700 opacity-50">
                        <div className="w-[18px] h-[18px] border-2 border-gray-300 rounded-full shrink-0 mt-0.5"></div>
                        No Audio / Video processing
                      </li>
                    </ul>
                  </div>

                  {/* Premium Plan */}
                  <div className={`relative p-6 rounded-2xl border-2 transition-all ${isPremium ? 'border-telkom-red shadow-lg bg-red-50/10' : 'border-red-100 hover:border-telkom-red/50 bg-white'}`}>
                    {isPremium ? (
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-telkom-red text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1">
                        <CheckCircle2 size={14} /> ACTIVE
                      </div>
                    ) : (
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm">
                        RECOMMENDED
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 text-telkom-navy">Professional</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-gray-900">Rp 99k</span>
                      <span className="text-sm font-medium text-gray-500">/ month</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Unlock unlimited potential for your business.</p>
                    
                    <ul className="mt-6 space-y-3 mb-8">
                      <li className="flex items-start gap-3 text-sm text-gray-900 font-medium">
                        <CheckCircle2 size={18} className="text-telkom-red shrink-0 mt-0.5" />
                        Unlimited AI Generations
                      </li>
                      <li className="flex items-start gap-3 text-sm text-gray-900 font-medium">
                        <CheckCircle2 size={18} className="text-telkom-red shrink-0 mt-0.5" />
                        Audio & Video File Support
                      </li>
                      <li className="flex items-start gap-3 text-sm text-gray-900 font-medium">
                        <CheckCircle2 size={18} className="text-telkom-red shrink-0 mt-0.5" />
                        Priority AI Processing Queue
                      </li>
                    </ul>

                    {!isPremium && (
                      <button 
                        onClick={handleUpgrade}
                        disabled={isUpgrading || success}
                        className="w-full bg-telkom-red hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(229,42,58,0.39)] hover:shadow-[0_6px_20px_rgba(229,42,58,0.23)] hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                      >
                        {isUpgrading ? <Loader2 size={20} className="animate-spin" /> : null}
                        {success ? 'Upgraded Successfully!' : 'Upgrade to Professional'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
