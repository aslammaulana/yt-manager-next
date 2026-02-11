"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { IoMdMoon, IoMdSunny } from "react-icons/io"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)
    const [isOpen, setIsOpen] = React.useState(false)
    const dropdownRef = React.useRef<HTMLDivElement>(null)

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    // Click outside handler
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    if (!mounted) {
        return <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-lg hover:bg-[#fafafa15] text-white transition-all duration-200 flex items-center justify-center relative z-20"
                title="Change Theme"
                aria-label="Change Theme"
            >
                {theme === 'light' ? (
                    <IoMdSunny className="h-5 w-5" />
                ) : theme === 'dark' ? (
                    <IoMdMoon className="h-5 w-5" />
                ) : (
                    <Monitor className="h-5 w-5" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-[#101116] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-100">
                    <button
                        onClick={() => { setTheme("light"); setIsOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${theme === 'light' ? 'text-blue-500 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                        <IoMdSunny size={16} />
                        Terang
                    </button>
                    <button
                        onClick={() => { setTheme("dark"); setIsOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${theme === 'dark' ? 'text-blue-500 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                        <IoMdMoon size={16} />
                        Gelap
                    </button>
                    <button
                        onClick={() => { setTheme("system"); setIsOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${theme === 'system' ? 'text-blue-500 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                        <Monitor size={16} />
                        Sistem
                    </button>
                </div>
            )}
        </div>
    )
}
