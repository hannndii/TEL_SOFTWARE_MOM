'use client'

import { useState } from 'react'
import { submitFeedback } from './actions'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export default function FeedbackPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await submitFeedback(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(true)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-12 bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
        <p className="text-gray-600 text-lg mb-8">
          Your feedback is incredibly valuable to us and will help shape the future of TELMOM.
        </p>
        <button 
          onClick={() => setSuccess(false)}
          className="bg-telkom-navy text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-900 transition-colors"
        >
          Submit Another Response
        </button>
      </div>
    )
  }

  const renderScale1To5 = (name: string, label: string) => (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-900 mb-3">{label}</label>
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-500 font-medium w-16 text-right">Poor (1)</span>
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map(num => (
            <label key={`${name}-${num}`} className="flex flex-col items-center gap-2 cursor-pointer group">
              <input type="radio" name={name} value={num} required className="w-5 h-5 text-telkom-red focus:ring-telkom-red border-gray-300" />
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">{num}</span>
            </label>
          ))}
        </div>
        <span className="text-xs text-gray-500 font-medium w-16">Excellent (5)</span>
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-3xl mx-auto pb-12">
      <div className="bg-gradient-to-r from-telkom-navy to-[#1e2840] p-10 rounded-t-3xl text-white">
        <h1 className="text-3xl font-bold mb-3">Usability Testing Feedback</h1>
        <p className="text-gray-300 text-sm">
          Please share your honest experience using the TELMOM application. Your feedback helps us build a better tool for everyone.
        </p>
      </div>

      <div className="bg-white p-10 rounded-b-3xl shadow-sm border border-gray-100">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Section 1: Basic Info */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-6">1. Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input type="text" name="name" required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-telkom-red focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Department / Division</label>
                <input type="text" name="department" required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-telkom-red focus:border-transparent transition-all" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">How often do you create Meeting Minutes in a week?</label>
              <div className="space-y-2">
                {['1 - 2 times', '3 - 5 times', 'More than 5 times', 'Rarely / Never'].map(opt => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="frequency" value={opt} required className="text-telkom-red focus:ring-telkom-red" />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Section 2: UI */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-6">2. User Interface (UI) Experience</h2>
            {renderScale1To5("ui_login", "How would you rate the visual appearance of the Login and Registration pages?")}
            {renderScale1To5("ui_dashboard", "Are the colors, text, and layout on the Dashboard easy to read and comfortable for the eyes?")}
            {renderScale1To5("ui_navigation", "How easy was it to find the 'Create New MoM' menu or other navigation items?")}
          </section>

          {/* Section 3: UX */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-6">3. User Experience (UX)</h2>
            {renderScale1To5("ux_upload", "How easy was the process of uploading files (audio/documents) on the Create MoM form?")}
            {renderScale1To5("ux_generate", "Did the 'Generate' process run smoothly and was it easy to understand?")}
            {renderScale1To5("ux_accuracy", "How would you rate the accuracy of the generated meeting minutes (MoM) summaries?")}
            
            <div className="mt-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Is the 'Generated Today / Quota' information on the Dashboard clear to you?</label>
              <div className="space-y-2">
                {[
                  'Yes, very clear', 
                  'Somewhat clear, but needs adjustments', 
                  'Not clear at all'
                ].map(opt => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="ux_quota_clarity" value={opt} required className="text-telkom-red focus:ring-telkom-red" />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Section 4: Qualitative */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-6">4. Feedback & Suggestions</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">What feature do you like the most about the TELMOM application?</label>
                <textarea name="feedback_favorite" required rows={3} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-telkom-red focus:border-transparent transition-all"></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Did you encounter any issues (errors/bugs) while using the application? If yes, please explain where.</label>
                <textarea name="feedback_bugs" rows={3} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-telkom-red focus:border-transparent transition-all"></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Are there any additional features or improvements you hope to see in future updates?</label>
                <textarea name="feedback_improvements" rows={3} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-telkom-red focus:border-transparent transition-all"></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">How likely are you to recommend this application to colleagues in other divisions? (1-10)</label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <label key={`recommend-${num}`} className="relative cursor-pointer">
                      <input type="radio" name="recommend_score" value={num} required className="peer sr-only" />
                      <div className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 font-medium text-gray-700 peer-checked:bg-telkom-red peer-checked:text-white peer-checked:border-telkom-red hover:bg-gray-50 transition-colors">
                        {num}
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex justify-between w-full max-w-[480px] mt-2 text-xs text-gray-500 font-medium">
                  <span>1 = Very Unlikely</span>
                  <span>10 = Very Likely</span>
                </div>
              </div>
            </div>
          </section>

          <div className="pt-6 border-t">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-telkom-red text-white px-10 py-3.5 rounded-xl font-bold text-lg hover:bg-red-700 focus:ring-4 focus:ring-red-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting Feedback...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
