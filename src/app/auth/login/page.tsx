'use client'
import { useState } from 'react'
import { createBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login'|'signup'>('login')
  const router = useRouter()
  const sb = createBrowser()

  const S = {
    wrap: { minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'#060608', padding:'20px' } as React.CSSProperties,
    card: { width:'100%', maxWidth:380, background:'rgba(15,16,22,0.9)', border:'1px solid rgba(0,212,255,0.15)', borderRadius:16, padding:'32px 28px' } as React.CSSProperties,
    input: { width:'100%', padding:'10px 14px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#f0f0f8', fontSize:14, outline:'none', fontFamily:"'Space Grotesk',sans-serif" } as React.CSSProperties,
    btn: (active: boolean) => ({ width:'100%', padding:'12px', borderRadius:10, border:'none', background:active?'#00d4ff':'#333', color:active?'#000':'#888', fontSize:14, fontWeight:600, cursor:active?'pointer':'default', fontFamily:"'Outfit',sans-serif", marginTop:20 }) as React.CSSProperties,
  }

  const handle = async () => {
    if (!email || !password) return
    setLoading(true); setError('')
    try {
      if (mode === 'signup') {
        const { error: e } = await sb.auth.signUp({ email, password })
        if (e) throw e
        setError('Check your email to confirm your account!')
      } else {
        const { error: e } = await sb.auth.signInWithPassword({ email, password })
        if (e) throw e
        router.push('/')
      }
    } catch(e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <div style={S.wrap}>
      <div style={S.card}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:48, height:48, borderRadius:12, background:'linear-gradient(135deg,#00d4ff,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, margin:'0 auto 10px', boxShadow:'0 0 20px rgba(0,212,255,0.3)' }}>⚡</div>
          <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, fontWeight:700, color:'#f0f0f8' }}>FIXMINE</div>
          <div style={{ fontSize:13, color:'#8888aa', marginTop:4 }}>{mode==='login'?'Sign in to your account':'Create your account'}</div>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:'#8888aa', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:6 }}>Email</label>
          <input style={S.input} type="email" value={email} placeholder="you@email.com" onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()} />
        </div>
        <div>
          <label style={{ display:'block', fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:'#8888aa', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:6 }}>Password</label>
          <input style={S.input} type="password" value={password} placeholder="••••••••" onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()} />
        </div>
        {error && <div style={{ fontSize:12, color:'#ff6b6b', marginTop:10, textAlign:'center' }}>{error}</div>}
        <button onClick={handle} disabled={loading||!email||!password} style={S.btn(!loading&&!!email&&!!password)}>
          {loading?'...':`${mode==='login'?'Sign In':'Create Account'}`}
        </button>
        <div style={{ textAlign:'center', marginTop:16, fontSize:13, color:'#8888aa' }}>
          {mode==='login'?<>No account? <span style={{ color:'#00d4ff', cursor:'pointer' }} onClick={()=>setMode('signup')}>Sign up free</span></>
          :<>Have account? <span style={{ color:'#00d4ff', cursor:'pointer' }} onClick={()=>setMode('login')}>Sign in</span></>}
        </div>
      </div>
    </div>
  )
}
