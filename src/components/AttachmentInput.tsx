'use client'
import { useState, useRef, useCallback } from 'react'

export interface Attachment {
  file: File; preview: string; type: 'image'|'video'; name: string; size: string
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return bytes+'B'
  if (bytes < 1024*1024) return (bytes/1024).toFixed(0)+'KB'
  return (bytes/1024/1024).toFixed(1)+'MB'
}

export function AttachmentInput({ onAttach, attachment }: { onAttach: (a: Attachment|null) => void; attachment: Attachment|null }) {
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    if (!isImage && !isVideo) { alert('Please attach an image or video'); return }
    if (isImage && file.size > 5*1024*1024) { alert('Image must be under 5MB'); return }
    if (isVideo && file.size > 50*1024*1024) { alert('Video must be under 50MB'); return }
    onAttach({ file, preview: isImage ? URL.createObjectURL(file) : '', type: isImage?'image':'video', name: file.name, size: fmtSize(file.size) })
  }, [onAttach])

  if (attachment) return (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', background:'var(--bg-float)', border:'1px solid var(--border-mid)', borderRadius:8, marginBottom:6 }}>
      {attachment.type==='image' && attachment.preview ? <img src={attachment.preview} alt="" style={{ width:36, height:36, objectFit:'cover', borderRadius:5 }}/> : <div style={{ width:36, height:36, borderRadius:5, background:'var(--bg-active)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🎬</div>}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:11, color:'var(--text-primary)', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{attachment.name}</div>
        <div style={{ fontSize:10, color:'var(--text-tertiary)', fontFamily:'var(--font-mono)' }}>{attachment.size} · {attachment.type}</div>
      </div>
      <button onClick={() => onAttach(null)} style={{ width:24, height:24, borderRadius:6, color:'var(--red)', border:'none', background:'rgba(255,68,68,0.08)', fontSize:12, cursor:'pointer' }}>✕</button>
    </div>
  )

  return (
    <>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime" style={{ display:'none' }} onChange={e => { const f=e.target.files?.[0]; if(f) processFile(f); e.target.value='' }}/>
      <button onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f=e.dataTransfer.files[0]; if(f) processFile(f) }}
        title="Attach screenshot or video"
        style={{ width:34, height:34, borderRadius:8, border:`1px solid ${dragging?'var(--cyan)':'var(--border-mid)'}`, background: dragging?'var(--cyan-dim)':'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color: dragging?'var(--cyan)':'var(--text-secondary)' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
        </svg>
      </button>
    </>
  )
}
