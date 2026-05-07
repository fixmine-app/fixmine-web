'use client'
import { useState, useRef, useEffect } from 'react'
import { createBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Lang } from './LanguageSelect'

export function AuthButton({ user, lang }: { user: User|null; lang: Lang }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const sb = createBrowser()

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const signOut = async () => {
    setLoading(true); await sb.auth.signOut(); setLoading(false); setOpen(false); router.refresh()
  }

  const S = {
    btn: { padding:'5px 12px', borderRadius:8, border:'1px solid rgba(0,212,255,0.2)', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:'.04em', transition:'all .15s' } as React.CSSProperties,
    dropdown: { position:'absolute' as const, top:'100%', right:0, marginTop:6, background:'rgba(15,16,22,0.98)', border:'1px solid rgba(0,212,255,0.15)', borderRadius:10, padding:8, minWidth:180, zIndex:100, backdropFilter:'blur(20px)' },
    item: { display:'block', width:'100%', padding:'8px 12px', borderRadius:6, background:'transparent', border:'none', cursor:'pointer', textAlign:'left' as const, fontSize:13, fontFamily:"'Space Grotesk',sans-serif", transition:'all .1s' },
  }

  if (!user) return (
    <button onClick={() => router.push('/auth/login')} style={{ ...S.btn, color:'#00d4ff' }}
      onMouseEnter={e => { e.currentTarget.style.background='rgba(0,212,255,0.08)'; e.currentTarget.style.borderColor='rgba(0,212,255,0.4)' }}
      onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(0,212,255,0.2)' }}>
      {lang==='id'?'MASUK':'LOGIN'}
    </button>
  )

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ ...S.btn, color:'#f0f0f8', gap:8 }}
        onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)' }}
        onMouseLeave={e => { e.currentTarget.style.background='transparent' }}>
        <div style={{ width:22, height:22, borderRadius:'50%', background:'linear-gradient(135deg,#00d4ff,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:'#000' }}>
          {(user.email||'U').slice(0,2).toUpperCase()}
        </div>
        <span style={{ maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email?.split('@')[0]}</span>
        <span style={{ fontSize:8, opacity:.5 }}>{open?'▲':'▼'}</span>
      </button>
      {open && (
        <div style={S.dropdown}>
          <span style={{ fontSize:11, color:'#8888aa', fontFamily:"'JetBrains Mono',monospace", padding:'6px 12px 10px', borderBottom:'1px solid rgba(255,255,255,0.06)', marginBottom:4, display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:180 }}>{user.email}</span>
          <button style={{ ...S.item, color:'#f0f0f8' }} onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)' }} onMouseLeave={e => { e.currentTarget.style.background='transparent' }} onClick={() => { setOpen(false); router.push('/auth/login') }}>
            {lang==='id'?'⚙ Akun saya':'⚙ My account'}
          </button>
          <button style={{ ...S.item, color:'#ff6b6b' }} onMouseEnter={e => { e.currentTarget.style.background='rgba(255,107,107,0.08)' }} onMouseLeave={e => { e.currentTarget.style.background='transparent' }} onClick={signOut} disabled={loading}>
            {loading?'...':lang==='id'?'↩ Keluar':'↩ Sign out'}
          </button>
        </div>
      )}
    </div>
  )
}
