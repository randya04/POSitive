import React from 'react'

export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full p-4">
      {children}
    </div>
  )
}
