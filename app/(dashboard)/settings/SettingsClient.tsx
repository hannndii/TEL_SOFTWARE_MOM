'use client'

import { useState, useTransition } from 'react'
import { User, Shield, CreditCard, Loader2, CheckCircle2, AlertTriangle, Key } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { updatePassword, deleteAccount } from './actions'

type Tab = 'profile' | 'security' | 'billing'

export default function SettingsClient({ userProfile, userEmail }: { userProfile: any, userEmail: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [success, setSuccess] = useState(false)
  
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your profile, preferences, and billing.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar settings */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-lg transition-colors ${
              activeTab === 'profile' 
                ? 'bg-white text-telkom-red shadow-sm border border-gray-200' 
                : 'text-gray-600 hover:bg-gray-100 border border-transparent'
            }`}
          >
            <User size={20} /> Profile
          </button>
          
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-lg transition-colors ${
              activeTab === 'security' 
                ? 'bg-white text-telkom-red shadow-sm border border-gray-200' 
                : 'text-gray-600 hover:bg-gray-100 border border-transparent'
            }`}
          >
            <Shield size={20} /> Security
          </button>
          
          <button 
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-lg transition-colors ${
              activeTab === 'billing' 
                ? 'bg-white text-telkom-red shadow-sm border border-gray-200' 
                : 'text-gray-600 hover:bg-gray-100 border border-transparent'
            }`}
          >
            <CreditCard size={20} /> Billing
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email Address</label>
                  <p className="text-gray-900 font-medium mt-1">{userEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Account ID</label>
                  <p className="text-gray-500 text-sm mt-1">{userProfile?.id}</p>
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
                    <input 
                      type="password" 
                      name="password"
                      required
                      minLength={6}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-telkom-red/50 transition-all"
                      placeholder="At least 6 characters"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      name="confirmPassword"
                      required
                      minLength={6}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-telkom-red/50 transition-all"
                      placeholder="Repeat new password"
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
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Subscription Plan</h2>
              
              <div className={`p-6 rounded-xl border-2 ${isPremium ? 'border-telkom-red bg-red-50/30' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      {isPremium ? 'Premium Tier' : 'Free Tier'}
                      {isPremium && <CheckCircle2 size={20} className="text-telkom-red" />}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {isPremium ? 'You have access to unlimited generation and audio uploads.' : 'Limited to 3 generations per day and text-only uploads.'}
                    </p>
                  </div>
                  {!isPremium && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">Rp 0</p>
                      <p className="text-xs text-gray-500">/month</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Daily Quota Left:</span>
                    <span className="font-bold text-gray-900">{isPremium ? 'Unlimited' : `${userProfile?.daily_quota_left ?? 3} / 3`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Audio/Video Support:</span>
                    <span className="font-bold text-gray-900">{isPremium ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>

                {!isPremium && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900">Upgrade to Premium</h4>
                        <p className="text-sm text-gray-500">Unlock full capabilities of TELMOM AI.</p>
                      </div>
                      <button 
                        onClick={handleUpgrade}
                        disabled={isUpgrading || success}
                        className="w-full sm:w-auto bg-telkom-navy hover:bg-blue-900 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {isUpgrading ? <Loader2 size={20} className="animate-spin" /> : null}
                        {success ? 'Upgraded Successfully!' : 'Upgrade Now'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
