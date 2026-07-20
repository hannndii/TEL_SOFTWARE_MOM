import { verifyOtp } from '@/app/login/actions'
import Link from 'next/link'

export default async function VerifyOtpPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; error?: string }>
}) {
  const resolvedParams = await searchParams;
  const email = resolvedParams?.email || '';
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
            Verify Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit code to <span className="font-semibold">{email}</span>
          </p>
        </div>
        
        {resolvedParams?.error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center font-medium border border-red-100">
            {resolvedParams.error}
          </div>
        )}

        <form action={verifyOtp} className="mt-8 space-y-6">
          <input type="hidden" name="email" value={email} />
          
          <div className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">6-Digit Code</label>
              <input 
                id="token" 
                name="token" 
                type="text" 
                maxLength={6}
                required 
                className="appearance-none text-center tracking-widest text-2xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-telkom-red focus:border-transparent transition-all" 
                placeholder="000000" 
              />
            </div>
          </div>

          <button 
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-telkom-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-telkom-red transition-colors shadow-sm"
          >
            Verify Account
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-gray-600">
          Didn't receive the code?{' '}
          <Link href="/login" className="font-medium text-telkom-navy hover:text-blue-800">
            Try registering again
          </Link>
        </div>
      </div>
    </div>
  )
}
