'use client'
import { STRINGS, type Lang } from './LanguageSelect'

export function ProblemCategories({ onSelect, lang }: { onSelect: (p: string) => void; lang: Lang }) {
  const cats = STRINGS[lang].categories
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, width:'100%', maxWidth:580 }}>
      {cats.map(c => (
        <button key={c.title} onClick={() => onSelect(c.prompt)}
          style={{ background:'var(--bg-float)', border:'1px solid var(--border-mid)', borderRadius:12, padding:'14px 12px', cursor:'pointer', textAlign:'left', display:'flex', flexDirection:'column', gap:6, transition:'all .2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(0,212,255,0.3)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.4),0 0 16px var(--cyan-glow)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-mid)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}>
          <span style={{ fontSize:20 }}>{c.icon}</span>
          <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:600, color:'var(--text-primary)', letterSpacing:'-.01em' }}>{c.title}</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'var(--text-tertiary)', letterSpacing:'.04em', textTransform:'uppercase', lineHeight:1.4 }}>{c.hint}</span>
        </button>
      ))}
    </div>
  )
}
