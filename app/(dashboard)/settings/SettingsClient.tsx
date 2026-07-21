'use client'

import { useState, useTransition, useRef } from 'react'
import { User, Shield, CreditCard, Loader2, CheckCircle2, AlertTriangle, Key, Copy, Check, Camera, Edit2, Save, X, Crown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { updatePassword, deleteAccount, updateProfile } from './actions'
import { createClient } from '@/utils/supabase/client'
import PasswordInput from '@/components/PasswordInput'
import Image from 'next/image'

type Tab = 'profile' | 'security' | 'billing'

export default function SettingsClient({ userProfile, userEmail }: { userProfile: any, userEmail: string }) {
  const searchParams = useSearchParams()
  const activeTab = (searchParams.get('tab') as Tab) || 'profile'
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Profile Editing States
  const [fullName, setFullName] = useState(userProfile?.full_name || '')
  const [isEditingName, setIsEditingName] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit size to 5MB and type to JPEG
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum size is 5MB.')
      return
    }
    
    if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
      alert('Only JPEG/JPG files are allowed.')
      return
    }

    setIsUploading(true)
    try {
      const fileName = `${userProfile.id}-${Math.random()}.jpg`
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })
        
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      await updateProfile(fullName, publicUrl)
    } catch (error: any) {
      alert('Error uploading avatar: ' + error.message)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSaveName = async () => {
    if (!fullName.trim()) return
    setIsSavingProfile(true)
    await updateProfile(fullName, null)
    setIsSavingProfile(false)
    setIsEditingName(false)
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
      {/* HEADER */}
      <div className="relative bg-gradient-to-r from-telkom-navy to-[#1e2840] pt-12 pb-16 px-8 -mx-8 -mt-8 rounded-b-3xl shadow-inner overflow-hidden mb-8">
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
          <p className="text-gray-300 mt-2 text-sm font-medium">Manage your profile, preferences, and billing.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Content Area */}
        <div className="w-full space-y-6">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200">
                <div className="flex flex-col items-center space-y-8">
                  
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center space-y-5">
                    <div className="relative group">
                      <div className="w-28 h-28 rounded-full bg-slate-800 flex items-center justify-center text-white text-4xl font-bold shadow-sm ring-4 ring-slate-50 overflow-hidden relative">
                        {userProfile?.avatar_url ? (
                          <Image src={userProfile.avatar_url} alt="Avatar" fill className="object-cover" />
                        ) : (
                          userEmail.charAt(0).toUpperCase()
                        )}
                        {isUploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                            <Loader2 size={24} className="text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-slate-200 text-slate-600 hover:text-telkom-red transition-colors group-hover:scale-110"
                        title="Change Avatar"
                      >
                        <Camera size={16} />
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleAvatarUpload} 
                        accept="image/jpeg, image/jpg" 
                        className="hidden" 
                      />
                    </div>
                    
                    <div className="text-center space-y-3">
                      <h3 className="text-xl font-bold text-slate-900">{userProfile?.full_name || userEmail.split('@')[0]}</h3>
                      
                      {isPremium ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-700 shadow-sm">
                          <Crown size={14} className="text-yellow-600" />
                          <span className="text-xs font-bold tracking-wide uppercase">Premium Member</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600 text-sm font-medium">
                          Free Member
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="w-full max-w-2xl space-y-8 mt-4">
                    <div className="border-b border-slate-100 pb-4 text-center">
                      <h2 className="text-2xl font-bold text-slate-900">Personal Information</h2>
                      <p className="text-sm text-slate-500 mt-1">Your basic account details.</p>
                    </div>

                    <div className="space-y-6 max-w-xl mx-auto">
                      {/* Name Edit Field */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                            <User size={16} className="text-slate-400" /> Full Name
                          </label>
                          {!isEditingName && (
                            <button onClick={() => setIsEditingName(true)} className="text-xs font-medium text-telkom-red hover:text-red-700 flex items-center gap-1">
                              <Edit2 size={12} /> Edit Name
                            </button>
                          )}
                        </div>
                        {isEditingName ? (
                          <div className="flex flex-col gap-2">
                            <input 
                              type="text" 
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-telkom-red"
                              placeholder="Enter your full name"
                              autoFocus
                            />
                            <div className="flex items-center gap-2">
                              <button onClick={handleSaveName} disabled={isSavingProfile} className="px-3 py-1.5 bg-telkom-red text-white hover:bg-red-600 rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium">
                                {isSavingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                              </button>
                              <button onClick={() => {setIsEditingName(false); setFullName(userProfile?.full_name || '')}} className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium">
                                <X size={14} /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm">
                            {userProfile?.full_name || <span className="text-slate-400 italic">Not set</span>}
                          </div>
                        )}
                      </div>

                      {/* Email Field */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
                          <User size={16} className="text-slate-400" /> Email Address
                        </label>
                        <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm">
                          {userEmail}
                        </div>
                      </div>
                      
                      {/* Account ID Field */}
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
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Key className="text-gray-400" size={20} />
                  <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
                </div>
                
                {securityMessage && (
                  <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${securityMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {securityMessage.text}
                  </div>
                )}

                <form id="password-form" action={handlePasswordUpdate} className="space-y-6 max-w-xl">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                      <PasswordInput 
                        id="currentPassword"
                        name="currentPassword"
                        placeholder="Enter your current password"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                      <PasswordInput 
                        id="password"
                        name="password"
                        placeholder="At least 6 characters"
                        required
                        minLength={6}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                      <PasswordInput 
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Repeat new password"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>         
                  <button 
                    type="submit"
                    disabled={isPending}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-md font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
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
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-5 py-2 rounded-md font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
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
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200">
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
                  <div className={`relative p-6 rounded-2xl border-2 transition-all ${!isPremium ? 'border-gray-900' : 'border-gray-100 hover:border-gray-200 opacity-70'}`}>
                    {!isPremium && (
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded-md text-xs font-bold tracking-wide">
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
                  <div className={`relative p-6 rounded-2xl border-2 transition-all ${isPremium ? 'border-telkom-red bg-red-50/10' : 'border-red-100 hover:border-telkom-red/50 bg-white'}`}>
                    {isPremium ? (
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-telkom-red text-white px-3 py-1 rounded-md text-xs font-bold tracking-wide flex items-center gap-1">
                        <CheckCircle2 size={14} /> ACTIVE
                      </div>
                    ) : (
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-telkom-red text-white px-3 py-1 rounded-md text-xs font-bold tracking-wide">
                        MOST POPULAR
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
