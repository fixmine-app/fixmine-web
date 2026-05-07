'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { ProblemCategories } from './ProblemCategories'
import { MessageBubble } from './MessageBubble'
import { AttachmentInput, type Attachment } from './AttachmentInput'
import { AuthButton } from './AuthButton'
import { STRINGS, type Lang } from './LanguageSelect'
import type { User } from '@supabase/supabase-js'

export interface Message {
  id: string; role: 'user'|'assistant'; content: string
  showFeedback?: boolean; feedbackDone?: boolean; streaming?: boolean; hasAttachment?: boolean
}

function ThinkingIndicator() {
  return (
    <div style={{ display:'flex', gap:10, alignItems:'flex-start' }} className="animate-stream-in">
      <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, marginTop:2, background:'linear-gradient(135deg,var(--cyan),var(--violet))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, boxShadow:'0 0 12px var(--cyan-glow)' }}>⚡</div>
      <div style={{ padding:'12px 16px', borderRadius:14, borderTopLeftRadius:4, background:'var(--bg-float)', border:'1px solid var(--border-mid)', display:'flex', gap:5, alignItems:'center' }}>
        {[0,150,300].map(d => <div key={d} style={{ width:5, height:5, borderRadius:'50%', background:'var(--cyan)', animation:`bounceDot 1.2s ease ${d}ms infinite`, boxShadow:'0 0 4px var(--cyan)' }}/>)}
      </div>
    </div>
  )
}

interface Props { lang: Lang; onChangeLang: () => void; user: User|null }

export default function ChatInterface({ lang, onChangeLang, user }: Props) {
  const t = STRINGS[lang]
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [started, setStarted] = useState(false)
  const [modelBadge, setModelBadge] = useState('SONNET 4')
  const [sessionCount, setSessionCount] = useState(0)
  const [attachment, setAttachment] = useState<Attachment|null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController|null>(null)
  const messagesRef = useRef<Message[]>([])
  messagesRef.current = messages
  const isPro = false // TODO: check user plan from Supabase

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  const autoResize = (el: HTMLTextAreaElement) => { el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,120)+'px' }

  const callAPI = useCallback(async (text: string, history: Message[], attach: Attachment|null) => {
    setIsStreaming(true)
    const aiId = Date.now().toString()+'-ai'
    setMessages(prev => [...prev, { id:aiId, role:'assistant', content:'', streaming:true }])
    try {
      abortRef.current = new AbortController()
      let res: Response
      if (attach) {
        const fd = new FormData()
        fd.append('text', text)
        fd.append('file', attach.file)
        fd.append('history', JSON.stringify(history.slice(0,-1).map(m => ({ role:m.role, content:m.content }))))
        res = await fetch('/api/analyze', { method:'POST', body:fd, signal:abortRef.current.signal })
      } else {
        res = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ messages:history.map(m=>({role:m.role,content:m.content})), isPro }), signal:abortRef.current.signal })
      }
      if (!res.ok || !res.body) {
        const err = await res.json().catch(()=>({}))
        if (err.error === 'free_limit_reached') {
          setMessages(prev => prev.map(m => m.id===aiId ? { ...m, content: lang==='id' ? err.message_id||err.message : err.message, streaming:false } : m))
          return
        }
        throw new Error('API error')
      }
      const reader = res.body.getReader(); const dec = new TextDecoder(); let full = ''
      while (true) {
        const { done, value } = await reader.read(); if (done) break
        for (const line of dec.decode(value).split('\n')) {
          if (!line.startsWith('data: ')) continue
          try {
            const d = JSON.parse(line.slice(6))
            if (d.text) { full+=d.text; setMessages(prev => prev.map(m => m.id===aiId ? {...m,content:full} : m)) }
            if (d.done) {
              const hasFix = full.includes('step by step')||full.includes('langkah')||/\d+\./.test(full)
              if (d.model) setModelBadge(d.model==='triage'?'HAIKU 4.5':d.model==='deep'?'OPUS 4':'SONNET 4')
              setMessages(prev => prev.map(m => m.id===aiId ? {...m,streaming:false,showFeedback:hasFix} : m))
            }
          } catch { /**/ }
        }
      }
    } catch(e: unknown) {
      if (e instanceof Error && e.name==='AbortError') return
      setMessages(prev => prev.map(m => m.id===aiId ? {...m, content:lang==='id'?'Koneksi bermasalah. Coba lagi.':'Connection error. Please try again.', streaming:false} : m))
    } finally { setIsStreaming(false); inputRef.current?.focus() }
  }, [lang, isPro])

  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText??input).trim()
    if ((!text&&!attachment)||isStreaming) return
    if (!overrideText) setInput('')
    if (!started) setStarted(true)
    setSessionCount(c=>c+1)
    const displayText = attachment ? (text||(lang==='id'?`[Melampirkan ${attachment.type}: ${attachment.name}]`:`[Attaching ${attachment.type}: ${attachment.name}]`)) : text
    const userMsg: Message = { id:Date.now().toString(), role:'user', content:displayText, hasAttachment:!!attachment }
    const next = [...messagesRef.current, userMsg]
    setMessages(next)
    const attach = attachment; setAttachment(null)
    await callAPI(text, next, attach)
  }, [input, isStreaming, started, attachment, lang, callAPI])

  const handleFeedback = useCallback((id: string, fixed: boolean) => {
    setMessages(prev => prev.map(m => m.id===id ? {...m,feedbackDone:true} : m))
    if (!fixed) setTimeout(() => sendMessage(lang==='id'?'Perbaikan itu tidak berhasil. Coba pendekatan lain.':"That fix didn't work. Please try a different approach."), 400)
  }, [sendMessage, lang])

  const reset = () => { abortRef.current?.abort(); setMessages([]); setInput(''); setStarted(false); setIsStreaming(false); setSessionCount(0); setAttachment(null) }

  const S = {
    header: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid var(--border-soft)', background:'rgba(10,11,15,0.9)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', position:'sticky' as const, top:0, zIndex:50, gap:12 } as React.CSSProperties,
    sendBtn: (active: boolean) => ({ width:36, height:36, borderRadius:9, border:'none', cursor:active?'pointer':'default', background:active?'var(--cyan)':'var(--border-mid)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s', boxShadow:active?'0 0 16px var(--cyan-glow)':'none' }) as React.CSSProperties,
    inputWrap: { display:'flex', gap:8, alignItems:'flex-end', background:'var(--bg-float)', border:'1px solid var(--border-mid)', borderRadius:14, padding:'10px 14px' } as React.CSSProperties,
    textarea: { flex:1, background:'transparent', border:'none', outline:'none', color:'var(--text-primary)', fontSize:14, lineHeight:1.5, resize:'none' as const, fontFamily:"'Space Grotesk',sans-serif", maxHeight:100 } as React.CSSProperties,
  }
  const canSend = (!!input.trim()||!!attachment)&&!isStreaming

  return (
    <div className="grid-bg" style={{ display:'flex', flexDirection:'column', height:'100dvh', maxWidth:860, margin:'0 auto' }}>
      <header style={S.header}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, background:'linear-gradient(135deg,var(--cyan),var(--violet))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, boxShadow:'0 0 16px var(--cyan-glow)' }}>⚡</div>
          <div>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:700, letterSpacing:'-.02em', background:'linear-gradient(90deg,#fff,var(--cyan))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>FIXMINE</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'var(--text-tertiary)', letterSpacing:'.08em', marginTop:1 }}>AI PC REPAIR</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          {started && <button onClick={reset} style={{ padding:'6px 12px', borderRadius:7, background:'transparent', border:'1px solid var(--border-mid)', color:'var(--text-secondary)', fontSize:11, fontFamily:"'JetBrains Mono',monospace", cursor:'pointer' }}>{t.newBtn}</button>}
          <button onClick={onChangeLang} style={{ padding:'5px 10px', borderRadius:7, background:'var(--bg-float)', border:'1px solid var(--border-mid)', color:'var(--text-tertiary)', fontSize:10, fontFamily:"'JetBrains Mono',monospace", cursor:'pointer' }}>{lang==='id'?'🇮🇩 ID':'🇺🇸 EN'}</button>
          <div style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:7, background:'var(--cyan-dim)', border:'1px solid rgba(0,212,255,.2)', fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'var(--cyan)' }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--cyan)', animation:'pulseCyan 2s ease-in-out infinite' }}/>{modelBadge}
          </div>
          {started && <div style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:7, background:'var(--violet-dim)', border:'1px solid rgba(124,58,237,.25)', fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#a78bfa' }}>{Math.max(0,3-sessionCount)}/3 {lang==='id'?'GRATIS':'FREE'}</div>}
          <AuthButton user={user} lang={lang} />
        </div>
      </header>

      {!started && (
        <div className="animate-fade-up" style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'28px 20px', gap:28, overflowY:'auto' }}>
          <div style={{ textAlign:'center', maxWidth:520 }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'var(--cyan)', letterSpacing:'.14em', textTransform:'uppercase', marginBottom:14 }}>{t.tagline}</div>
            <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'clamp(28px,5vw,48px)', fontWeight:700, letterSpacing:'-.03em', lineHeight:1.08, marginBottom:12 }}>
              {t.headline1}<br/>
              <span style={{ background:'linear-gradient(90deg,var(--cyan),var(--violet))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{t.headline2}</span>
            </h1>
            <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.7, fontWeight:300, whiteSpace:'pre-line' }}>{t.sub}</p>
          </div>
          <ProblemCategories onSelect={p => sendMessage(p)} lang={lang} />
          <div style={{ width:'100%', maxWidth:580 }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'var(--text-tertiary)', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:8 }}>{t.orDescribe}</div>
            {attachment && <div style={{ marginBottom:6 }}><AttachmentInput onAttach={setAttachment} attachment={attachment} /></div>}
            <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
              <div style={{ ...S.inputWrap, flex:1 }}>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:'var(--cyan)', lineHeight:'22px', flexShrink:0 }}>{'>'}</div>
                <textarea ref={inputRef} value={input} onChange={e => { setInput(e.target.value); autoResize(e.target) }} onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()} }} placeholder={t.placeholder} rows={1} style={S.textarea}/>
                {!attachment && <AttachmentInput onAttach={setAttachment} attachment={attachment} />}
              </div>
              <button onClick={() => sendMessage()} disabled={!canSend} style={S.sendBtn(canSend)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={canSend?'#000':'var(--text-tertiary)'}><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </div>
          <div style={{ display:'flex', gap:18, flexWrap:'wrap', justifyContent:'center' }}>
            {t.stats.map(([n,l]) => (
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:700, color:'var(--cyan)' }}>{n}</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'var(--text-tertiary)', letterSpacing:'.08em', textTransform:'uppercase', marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {started && (
        <>
          <div style={{ flex:1, overflowY:'auto', padding:'20px 20px 0', display:'flex', flexDirection:'column', gap:12 }}>
            {messages.map(msg => <MessageBubble key={msg.id} message={msg} onFeedback={handleFeedback} lang={lang} />)}
            {isStreaming && messages[messages.length-1]?.role!=='assistant' && <ThinkingIndicator />}
            <div ref={bottomRef} style={{ height:16 }}/>
          </div>
          <div className="safe-bottom" style={{ borderTop:'1px solid var(--border-soft)', padding:'10px 20px 12px', background:'rgba(10,11,15,0.9)', backdropFilter:'blur(20px)' }}>
            {attachment && <div style={{ marginBottom:6 }}><AttachmentInput onAttach={setAttachment} attachment={attachment} /></div>}
            <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
              <div style={{ ...S.inputWrap, flex:1 }}>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:'var(--cyan)', lineHeight:'22px', flexShrink:0 }}>{'>'}</div>
                <textarea value={input} onChange={e => { setInput(e.target.value); autoResize(e.target) }} onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()} }} placeholder={t.inputPlaceholder} rows={1} style={S.textarea}/>
                {!attachment && <AttachmentInput onAttach={setAttachment} attachment={attachment} />}
              </div>
              <button onClick={() => sendMessage()} disabled={!canSend} style={S.sendBtn(canSend)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={canSend?'#000':'var(--text-tertiary)'}><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
            <div style={{ textAlign:'center', marginTop:6, fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'var(--text-tertiary)', letterSpacing:'.06em' }}>{t.hint}</div>
          </div>
        </>
      )}
    </div>
  )
}
