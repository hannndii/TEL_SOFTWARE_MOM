import { login, resendVerification } from './actions'
import Link from 'next/link'
import PasswordInput from '@/components/PasswordInput'
import AuthLayout from '@/components/AuthLayout'
import { Mail, ArrowRight } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string, message?: string, email?: string }>
}) {
  const resolvedParams = await searchParams;
  
  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your meeting minutes
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
            {resolvedParams.email && (
              <form action={resendVerification} className="mt-3">
                <input type="hidden" name="email" value={resolvedParams.email} />
                <button type="submit" className="text-sm font-bold underline hover:text-green-800">
                  Tidak menerima email? Kirim Ulang Verifikasi
                </button>
              </form>
            )}
          </div>
        )}

        <form action={login} className="mt-8 space-y-6">
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-2">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Mail size={18} strokeWidth={2} />
                </div>
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  autoComplete="email" 
                  required 
                  className="appearance-none relative block w-full pl-10 px-4 py-3 border border-gray-200 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E62020] focus:border-transparent transition-all sm:text-sm" 
                  placeholder="hanndi287@gmail.com" 
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-700 mb-2">Password</label>
              <PasswordInput 
                id="password" 
                name="password" 
                placeholder="••••••••••••" 
                autoComplete="current-password" 
                required 
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-[#E62020] focus:ring-[#E62020] border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <button 
            type="submit"
            className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#E62020] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E62020] transition-colors shadow-sm"
          >
            Sign in
            <ArrowRight size={18} className="absolute right-4" />
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button type="button" className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E62020] transition-colors">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
        
        <div className="text-center mt-8 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up here
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
