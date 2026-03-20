import Navigation from './Navigation'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
      <Navigation />
    </div>
  )
}
