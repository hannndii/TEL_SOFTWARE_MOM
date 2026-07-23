import Image from 'next/image'
import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-[#0B1120] overflow-hidden flex-col items-center justify-center p-12">
        {/* Background gradient effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-red-600/20 via-transparent to-transparent"></div>
        
        {/* Decorative lines / grid */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0))] opacity-20"></div>
        
        <div className="relative z-10 w-full max-w-lg flex flex-col items-start px-8">
          <div className="w-full flex justify-center mb-8">
            <div className="relative w-72 h-72 sm:w-96 sm:h-96">
              <Image 
                src="/web-logo-signinup.png" 
                alt="3D isometric graphic" 
                fill 
                className="object-contain"
                priority
              />
            </div>
          </div>
          
          <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
            <span className="italic">my</span><span className="text-[#E62020]">TELMOM</span>
          </h2>
          
          <h3 className="text-3xl font-bold text-white mb-6 leading-tight">
            Smart Meeting Minutes,<br />
            Simplified.
          </h3>
          
          <p className="text-gray-400 text-lg leading-relaxed max-w-md">
            Capture, summarize, and manage your meeting<br />
            minutes effortlessly in one intelligent platform.
          </p>
        </div>
        
        <div className="absolute bottom-10 left-16 text-xs text-gray-500 font-medium tracking-wide">
          Created by <span className="text-white font-bold tracking-widest ml-1">HANDEV.</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
