import { login } from './actions'
import Link from 'next/link'

export default async function LoginPage({
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
            TEL<span className="text-telkom-red">MOM</span>
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

        <form className="mt-8 space-y-6">
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
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                autoComplete="current-password" 
                required 
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-telkom-red focus:border-transparent transition-all sm:text-sm" 
                placeholder="Password" 
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-telkom-red focus:ring-telkom-red border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-telkom-navy hover:text-blue-800">
                Forgot your password?
              </a>
            </div>
          </div>

          <button 
            formAction={login} 
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-telkom-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-telkom-red transition-colors shadow-sm"
          >
            Sign in
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-telkom-navy hover:text-blue-800">
            Sign up here
          </Link>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-telkom-red transition-colors">
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
      </div>
    </div>
  )
}
