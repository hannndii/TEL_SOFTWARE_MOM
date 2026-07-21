import { sendPasswordReset } from '@/app/login/actions'
import Link from 'next/link'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string, message?: string }>
}) {
  const resolvedParams = await searchParams;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
            TEL<span className="text-telkom-red">MOM</span>
          </h2>
          <h3 className="mt-4 text-xl font-bold text-gray-900">
            Forgot Password
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        
        {resolvedParams?.error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center font-medium border border-red-100">
            {resolvedParams.error}
          </div>
        )}
        
        {resolvedParams?.message && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg text-sm text-center font-medium border border-green-200 shadow-sm">
            {resolvedParams.message}
          </div>
        )}

        <form action={sendPasswordReset} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              autoComplete="email" 
              required 
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-telkom-red focus:border-transparent transition-all sm:text-sm" 
              placeholder="Email address" 
            />
          </div>

          <button 
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-telkom-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-telkom-red transition-colors shadow-sm"
          >
            Send Recovery Link
          </button>
        </form>

        <div className="text-center mt-4 text-sm">
          <Link href="/login" className="font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
