import Image from 'next/image'
import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Hidden on mobile, takes 50% width on large screens */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0B1120] overflow-hidden flex-col items-center justify-center p-12">
        {/* Background gradient effects similar to the image */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent"></div>
        
        {/* Decorative lines / grid (subtle) */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>
        
        <div className="relative z-10 w-full max-w-md flex flex-col items-start">
          <div className="w-full flex justify-center mb-12">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80">
              <Image 
                src="/web-logo-signinup.png" 
                alt="3D isometric graphic" 
                fill 
                className="object-contain"
                priority
              />
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
            <span className="italic">my</span><span className="text-[#E62020]">TELMOM</span>
          </h2>
          
          <h3 className="text-3xl font-semibold text-white mb-4 leading-tight">
            Smart Meeting Minutes,<br />
            Simplified.
          </h3>
          
          <p className="text-gray-400 text-lg leading-relaxed">
            Capture, summarize, and manage your meeting<br />
            minutes effortlessly in one intelligent platform.
          </p>
        </div>
        
        <div className="absolute bottom-8 left-12 text-sm text-gray-500 font-medium">
          Created by <span className="text-white font-bold tracking-widest">HANDEV.</span>
        </div>
      </div>

      {/* Right Panel - Form area */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
