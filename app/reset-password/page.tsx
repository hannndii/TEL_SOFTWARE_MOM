import { updatePassword } from '@/app/login/actions'
import PasswordInput from '@/components/PasswordInput'

export default async function ResetPasswordPage({
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
          <h3 className="mt-4 text-xl font-bold text-gray-900">
            Create New Password
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Please enter your new password below.
          </p>
        </div>
        
        {resolvedParams?.error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center font-medium border border-red-100">
            {resolvedParams.error}
          </div>
        )}

        <form action={updatePassword} className="mt-8 space-y-6">
          <PasswordInput 
            id="password" 
            name="password" 
            placeholder="New Password (min. 6 characters)" 
            autoComplete="new-password" 
            required 
          />

          <button 
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-telkom-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-telkom-red transition-colors shadow-sm"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  )
}
