import React from 'react'

export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-7xl mx-auto px-0 md:px-4 flex flex-col gap-0">
      {children}
    </div>
  )
}
