import Link from 'next/link'
import AuthLayout from '@/components/AuthLayout'

export const metadata = {
  title: 'Terms of Service - myTELMOM',
  description: 'Terms of Service for myTELMOM',
}

export default function TermsOfService() {
  return (
    <AuthLayout>
      <div className="w-full max-w-2xl mx-auto space-y-6 text-gray-700">
        <div>
          <Link href="/login" className="text-sm text-telkom-red font-medium hover:underline mb-4 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        
        <div className="prose prose-sm prose-red">
          <p>
            By accessing or using myTELMOM, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.
          </p>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">1. Use of Service</h3>
          <p>
            myTELMOM is designed to assist corporate professionals in generating Meeting Minutes (MoM) automatically using AI. You agree to use the service only for lawful purposes and in accordance with your organization's internal policies.
          </p>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">2. User Accounts</h3>
          <p>
            You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
          </p>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">3. AI-Generated Content Disclaimer</h3>
          <p>
            Our service utilizes artificial intelligence to transcribe and summarize meetings. While we strive for accuracy, AI-generated content may contain errors or misinterpretations. <strong>You are solely responsible for reviewing, editing, and verifying the accuracy of the generated Meeting Minutes before distributing them.</strong>
          </p>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">4. Intellectual Property</h3>
          <p>
            You retain all rights to the audio and text inputs you provide to the service. By using the service, you grant us a temporary license to process your inputs solely for the purpose of providing the MoM generation service back to you.
          </p>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">5. Limitation of Liability</h3>
          <p>
            In no event shall myTELMOM, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
