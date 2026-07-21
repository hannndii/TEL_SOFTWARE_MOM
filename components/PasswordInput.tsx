'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps {
  id: string
  name: string
  placeholder: string
  autoComplete?: string
  required?: boolean
  minLength?: number
}

export default function PasswordInput({ id, name, placeholder, autoComplete, required, minLength }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">{placeholder}</label>
      <input 
        id={id} 
        name={name} 
        type={showPassword ? "text" : "password"} 
        autoComplete={autoComplete} 
        required={required} 
        minLength={minLength}
        className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-telkom-red focus:border-transparent transition-all sm:text-sm" 
        placeholder={placeholder} 
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none z-10 cursor-pointer"
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  )
}
