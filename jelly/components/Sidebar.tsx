import React from 'react'
import { sidebarLinks } from '@/constants'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const pathname = usePathname()

  return (
    <section
      className={cn(
        'fixed left-0 top-0 flex h-screen flex-col justify-between bg-dark-1 p-2 pt-28 text-white transition-all duration-300 ease-in-out max-sm:hidden',
        isOpen ? 'w-[264px]' : 'w-[78px]'
      )}
    >
      <div className='flex flex-col gap-6 text-white'>
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.route || pathname.startsWith(`${link.route}/`)

          if (link.label === 'AI Jelly') {
            return (
              <a
                href={link.route}
                key={link.label}
                onClick={(e) => {
                  e.preventDefault();
                  window.open(link.route, '_blank', 'width=375,height=812,resizable=yes,scrollbars=yes,status=yes');
                }}
                className={cn('flex items-center gap-4 rounded-lg px-2 py-6', {
                  'bg-blue-1': isActive,
                  'justify-center': !isOpen,
                })}
              >
                <Image
                  src={link.imgUrl}
                  alt={link.label}
                  width={24}
                  height={24}
                  className={cn('transition-all duration-300', {
                    'brightness-0 invert': !isOpen,
                  })}
                />
                {isOpen && (
                  <p className="text-lg font-semibold">
                    {link.label}
                  </p>
                )}
              </a>
            )
          }

          return (
            <Link
              href={link.route}
              key={link.label}
              className={cn('flex items-center gap-4 rounded-lg px-2 py-6', {
                'bg-blue-1': isActive,
                'justify-center': !isOpen,
              })}
            >
              <Image
                src={link.imgUrl}
                alt={link.label}
                width={24}
                height={24}
                className={cn('transition-all duration-300', {
                  'brightness-0 invert': !isOpen,
                })}
              />
              {isOpen && (
                <p className="text-lg font-semibold">
                  {link.label}
                </p>
              )}
            </Link>
          )
        })}
      </div>
      <button
        onClick={toggleSidebar}
        className={cn(
          'absolute -right-3 top-1/5 flex h-8 w-8 -translate-y-3/4 items-center justify-center rounded-full bg-dark-1 text-white',
          isOpen ? 'rotate-0' : 'rotate-180'
        )}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
    </section>
  )
}

export default Sidebar