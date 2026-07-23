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
        
        <div className="relative z-10 w-full max-w-sm flex flex-col items-start px-4">
          <Image 
            src="/web-logo-signinup.png" 
            alt="myTELMOM" 
            width={500}
            height={500}
            className="w-full h-auto mb-2"
            priority
          />
          
          <div className="text-left w-full mt-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
              Smart Meeting Minutes,<br />
              Simplified.
            </h3>
            
            <p className="text-gray-400 text-base sm:text-[17px] leading-relaxed">
              Capture, summarize, and manage your meeting<br />
              minutes effortlessly in one intelligent platform.
            </p>
          </div>
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
