'use client'
import { useState } from 'react'
import type { Message } from './ChatInterface'
import { STRINGS, type Lang } from './LanguageSelect'

function renderMarkdown(text: string): string {
  let h = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/```(\w*)\n?([^`]*?)```/g,(_,l,c)=>`<pre><code>${c.trim()}</code></pre>`)
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/^---$/gm,'<hr />')
  const lines = h.split('\n'); const out: string[] = []; let inOL=false,inUL=false,para=''
  const flushPara = () => {
    if (!para.trim()) return
    if (para.includes('Confidence:') || para.includes('Keyakinan:')) out.push(`<p class="confidence-badge">◈ ${para.replace(/##\s*(Confidence:|Tingkat Keyakinan:)\s*/g,'')}</p>`)
    else out.push(`<p>${para}</p>`); para=''
  }
  for (const line of lines) {
    const ol=line.match(/^\d+\.\s+(.+)/); const ul=line.match(/^[-*]\s+(.+)/); const h2=line.match(/^##\s+(.+)/)
    if (h2) { flushPara(); if(inOL){out.push('</ol>');inOL=false}; if(inUL){out.push('</ul>');inUL=false}; const txt=h2[1]; if(txt.includes('Confidence:')||txt.includes('Keyakinan:')) out.push(`<p class="confidence-badge">◈ ${txt.replace(/(Confidence:|Tingkat Keyakinan:)/,'').trim()}</p>`); else out.push(`<h2>${txt}</h2>`) }
    else if (ol) { flushPara(); if(inUL){out.push('</ul>');inUL=false}; if(!inOL){out.push('<ol>');inOL=true}; out.push(`<li>${ol[1]}</li>`) }
    else if (ul) { flushPara(); if(inOL){out.push('</ol>');inOL=false}; if(!inUL){out.push('<ul>');inUL=true}; out.push(`<li>${ul[1]}</li>`) }
    else if (!line.trim()||line==='<hr />') { flushPara(); if(inOL){out.push('</ol>');inOL=false}; if(inUL){out.push('</ul>');inUL=false}; if(line==='<hr />') out.push('<hr />') }
    else { if(inOL){out.push('</ol>');inOL=false}; if(inUL){out.push('</ul>');inUL=false}; para=para?para+' '+line.trim():line.trim() }
  }
  flushPara(); if(inOL) out.push('</ol>'); if(inUL) out.push('</ul>')
  return out.join('\n')
}

export function MessageBubble({ message, onFeedback, lang }: { message: Message; onFeedback: (id: string, fixed: boolean) => void; lang: Lang }) {
  const [fbDone, setFbDone] = useState(false)
  const t = STRINGS[lang]
  const isUser = message.role === 'user'
  if (isUser) return (
    <div className="animate-stream-in" style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
      <div style={{ maxWidth:'75%', padding:'11px 16px', borderRadius:14, borderTopRightRadius:4, background:'var(--bg-hover)', border:'1px solid var(--border-strong)', fontSize:14, lineHeight:1.65, color:'var(--text-primary)', whiteSpace:'pre-wrap' }}>
        {message.hasAttachment && <div style={{ fontSize:11, color:'var(--cyan)', fontFamily:"'JetBrains Mono',monospace", marginBottom:6, opacity:.7 }}>📎 {lang==='id'?'Lampiran dilampirkan':'Attachment included'}</div>}
        {message.content}
      </div>
      <div style={{ width:28, height:28, borderRadius:8, background:'var(--bg-active)', border:'1px solid var(--border-strong)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'var(--text-tertiary)', flexShrink:0, marginTop:3, fontFamily:"'JetBrains Mono',monospace" }}>{lang==='id'?'SAYA':'YOU'}</div>
    </div>
  )
  return (
    <div className="animate-stream-in" style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
      <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, marginTop:2, background:'linear-gradient(135deg,var(--cyan),var(--violet))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, boxShadow:'0 0 10px var(--cyan-glow)' }}>⚡</div>
      <div style={{ maxWidth:'80%', padding:'14px 16px', borderRadius:14, borderTopLeftRadius:4, background:'var(--bg-raised)', border:'1px solid var(--border-soft)' }}>
        {message.content ? (
          <>
            <div className={`ai-content${message.streaming?' streaming-cursor':''}`} dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }} />
            {message.showFeedback && !fbDone && !message.feedbackDone && (
              <div style={{ display:'flex', gap:8, marginTop:14, paddingTop:12, borderTop:'1px solid var(--border-soft)' }}>
                <button onClick={() => { setFbDone(true); onFeedback(message.id, true) }} style={{ padding:'7px 14px', borderRadius:7, border:'1px solid rgba(0,255,157,.25)', background:'var(--green-dim)', color:'var(--green)', fontSize:11, fontFamily:"'JetBrains Mono',monospace", cursor:'pointer' }}>{t.fixedBtn}</button>
                <button onClick={() => { setFbDone(true); onFeedback(message.id, false) }} style={{ padding:'7px 14px', borderRadius:7, border:'1px solid rgba(255,68,68,.25)', background:'var(--red-dim)', color:'var(--red)', fontSize:11, fontFamily:"'JetBrains Mono',monospace", cursor:'pointer' }}>{t.brokenBtn}</button>
              </div>
            )}
            {(fbDone||message.feedbackDone) && message.showFeedback && <div style={{ marginTop:10, fontSize:11, color:'var(--text-tertiary)', fontFamily:"'JetBrains Mono',monospace" }}>{t.feedbackLogged}</div>}
          </>
        ) : (
          <div style={{ display:'flex', gap:4, alignItems:'center', padding:'2px 0' }}>
            {[0,150,300].map(d => <div key={d} style={{ width:4, height:4, borderRadius:'50%', background:'var(--cyan)', animation:`bounceDot 1.2s ease ${d}ms infinite` }}/>)}
          </div>
        )}
      </div>
    </div>
  )
}
