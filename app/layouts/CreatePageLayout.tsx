'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Stat {
  number: string
  label: string
}

interface CreatePageLayoutProps {
  children: React.ReactNode
  title: React.ReactNode
  description: string
  stats: Stat[]
  sidebarTitle: string
  sidebarDescription: string
}

const Stat = ({ number, label }: Stat) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
    <div className="text-2xl font-bold text-white">{number}</div>
    <div className="text-sm text-white/80">{label}</div>
  </div>
)

export function CreatePageLayout({
  children,
  title,
  description,
  stats,
  sidebarTitle,
  sidebarDescription,
}: CreatePageLayoutProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex">
      {/* Main Content */}
      <div className="flex-1 bg-white pl-24">
        {/* Navigation */}
        <div className="sticky top-0 z-10 -ml-16 pl-8 py-4 bg-white/80 backdrop-blur-sm">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="max-w-[700px]">
          {/* Hero Section */}
          <div className="pt-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
            <p className="text-xl text-gray-500 mb-12">{description}</p>
          </div>

          {/* Content */}
          {children}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:block w-[35%] relative">
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute inset-0 [background:linear-gradient(135deg,rgba(37,99,235,0.85)_0%,rgba(59,130,246,0.75)_50%,rgba(96,165,250,0.80)_100%)] backdrop-blur-xl" />
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[100px]" />
          <div className="absolute inset-0 mix-blend-overlay bg-gradient-to-t from-transparent via-white/5 to-white/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]" />
          
          {/* Content */}
          <div className="relative z-10 p-12">
            <h2 className="text-3xl font-bold text-white leading-tight backdrop-blur-sm">
              {sidebarTitle}
            </h2>
            <p className="mt-4 text-lg text-white/90 backdrop-blur-sm">
              {sidebarDescription}
            </p>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <Stat key={index} {...stat} />
              ))}
            </div>
          </div>
          
          {/* Logo Circle */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
            <div className="relative w-[400px] h-[400px] rounded-full border-[10px] border-white/20 animate-pulse-slow backdrop-blur-sm">
              <Image
                src="/logo_white_no_text.png"
                alt=""
                fill
                objectFit="contain"
                className="opacity-25 scale-75"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 