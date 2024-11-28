'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  FileText, 
  MessageSquare, 
  Star,
  Coins,
  Users2,
  Share2,
  BookMarked,
  History
} from 'lucide-react'

export const PaperNavigation = () => {
  const pathname = usePathname()
  const basePath = pathname.split('#')[0]

  const navItems = [
    { href: '#paper', label: 'Paper', icon: FileText },
    { href: '#reviews', label: 'Reviews', icon: Star },
    { href: '#comments', label: 'Comments', icon: MessageSquare },
    { href: '#rewards', label: 'Rewards', icon: Coins },
    { href: '#citations', label: 'Citations', icon: BookMarked },
    { href: '#history', label: 'History', icon: History },
    { href: '#contributors', label: 'Contributors', icon: Users2 },
    { href: '#share', label: 'Share', icon: Share2 },
  ]

  return (
    <div className="sticky top-16 bg-white border-b z-10">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex space-x-8 overflow-x-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={`${basePath}${href}`}
              className={`
                flex items-center space-x-2 py-4 px-1 border-b-2 
                ${pathname.includes(href) 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                whitespace-nowrap text-sm font-medium
              `}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
} 