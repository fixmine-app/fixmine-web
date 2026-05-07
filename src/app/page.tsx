'use client'
import { useState, useEffect } from 'react'
import { LanguageSelect, type Lang } from '@/components/LanguageSelect'
import ChatInterface from '@/components/ChatInterface'
import { createBrowser } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Home() {
  const [lang, setLang] = useState<Lang | null>(null)
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('fixmine_lang') as Lang | null
    if (saved === 'en' || saved === 'id') setLang(saved)
    const sb = createBrowser()
    sb.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLangSelect = (l: Lang) => {
    localStorage.setItem('fixmine_lang', l)
    setLang(l)
  }

  if (!mounted) return null
  if (!lang) return <LanguageSelect onSelect={handleLangSelect} />
  return (
    <main className="grid-bg min-h-screen">
      <ChatInterface lang={lang} onChangeLang={() => setLang(null)} user={user} />
    </main>
  )
}
