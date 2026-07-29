import Link from 'next/link'
import AuthLayout from '@/components/AuthLayout'

export const metadata = {
  title: 'Privacy Policy - myTELMOM',
  description: 'Privacy Policy and Data Protection for myTELMOM',
}

export default function PrivacyPolicy() {
  return (
    <AuthLayout>
      <div className="w-full max-w-2xl mx-auto space-y-6 text-gray-700">
        <div>
          <Link href="/login" className="text-sm text-telkom-red font-medium hover:underline mb-4 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        
        <div className="prose prose-sm prose-red">
          <p>
            At myTELMOM, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our AI Meeting Minutes service.
          </p>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">1. Information We Collect</h3>
          <p>
            <strong>Personal Data:</strong> We may collect personally identifiable information, such as your name and email address when you register for an account.
            <br />
            <strong>Meeting Data:</strong> When you use our service, you may upload audio files or text transcripts. We process this data solely to generate meeting minutes (MoM) for your account.
          </p>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">2. How We Use Your Information</h3>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Provide, operate, and maintain our AI generation services.</li>
            <li>Process your audio and text inputs using our AI partners (e.g., Google Gemini) exclusively for generating your requested MoM.</li>
            <li>Send you administrative emails, such as password resets and account verifications.</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">3. Data Security</h3>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. Your data is stored securely using Supabase with Row Level Security (RLS) enabled, ensuring that your meeting minutes are only accessible to you. We do not sell your data to third parties.
          </p>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">4. AI Processing</h3>
          <p>
            Your meeting transcripts and audio are processed by our AI providers to generate summaries. This data is transmitted securely via API and is not used to train public AI models. 
          </p>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">5. Contact Us</h3>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us or your internal IT administrator.
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
