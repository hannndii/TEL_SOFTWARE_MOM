import { signup } from '@/app/login/actions'
import Link from 'next/link'
import PasswordInput from '@/components/PasswordInput'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const resolvedParams = await searchParams;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome to <span className="text-telkom-red font-bold">TELMOM</span> and Join Now!
          </p>
        </div>
        
        {resolvedParams?.error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center font-medium border border-red-100">
            {resolvedParams.error}
          </div>
        )}

        <form action={signup} className="mt-8 space-y-6">
          <div className="space-y-4">
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
            <PasswordInput 
              id="password" 
              name="password" 
              placeholder="Password (minimum 6 characters)" 
              autoComplete="new-password" 
              required 
            />
          </div>

          <button 
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-telkom-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-telkom-red transition-colors shadow-sm"
          >
            Sign up
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-telkom-navy hover:text-blue-800">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  )
}
