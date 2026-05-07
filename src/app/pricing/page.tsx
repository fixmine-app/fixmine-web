'use client'
import { useState, useEffect } from 'react'
import { createBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [userPlan, setUserPlan] = useState('free')
  const [planExpires, setPlanExpires] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const router = useRouter()

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (p.get('status') === 'cancelled') setNotice('Pembayaran dibatalkan. Silakan coba lagi.')
    fetch('/api/payment/status')
      .then(r => r.json())
      .then(d => { setUserPlan(d.plan || 'free'); setPlanExpires(d.expires) })
  }, [])

  const buy = async (planId: string) => {
    setLoading(planId)
    setNotice('')
    try {
      const sb = createBrowser()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()
      if (data.payment_url) window.location.href = data.payment_url
      else setNotice('Gagal membuat pembayaran. Coba lagi.')
    } catch { setNotice('Terjadi kesalahan. Coba lagi.') }
    finally { setLoading(null) }
  }

  const W = { minHeight:'100dvh', background:'#060608', backgroundImage:'linear-gradient(rgba(0,212,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.02) 1px,transparent 1px)', backgroundSize:'32px 32px', padding:'60px 20px', fontFamily:"'Space Grotesk',sans-serif", color:'#f0f0f8' }
  const card = (hi: boolean): React.CSSProperties => ({ background:hi?'rgba(0,212,255,0.05)':'rgba(15,16,22,0.8)', border:`1px solid ${hi?'rgba(0,212,255,0.4)':'rgba(255,255,255,0.08)'}`, borderRadius:16, padding:'32px 28px', position:'relative' })
  const btn = (primary: boolean, disabled: boolean): React.CSSProperties => ({ display:'block', width:'100%', padding:'13px', borderRadius:10, border:`1px solid ${primary?'#00d4ff':'rgba(255,255,255,0.15)'}`, background:disabled?'#1a1a2a':primary?'#00d4ff':'transparent', color:disabled?'#555':primary?'#000':'#f0f0f8', fontSize:14, fontWeight:600, cursor:disabled?'default':'pointer', textAlign:'center', marginBottom:28, transition:'all .15s', fontFamily:"'Outfit',sans-serif" })
  const feat: React.CSSProperties = { display:'flex', alignItems:'flex-start', gap:10, marginBottom:12, fontSize:14, color:'#c0c0d8', lineHeight:1.5 }

  return (
    <div style={W}>
      <div style={{ maxWidth:940, margin:'0 auto' }}>

        {/* Header */}
        <a href="/" style={{ display:'inline-flex', alignItems:'center', gap:10, textDecoration:'none', marginBottom:48 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#00d4ff,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>⚡</div>
          <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:700, color:'#f0f0f8' }}>FIXMINE</span>
        </a>

        <div style={{ textAlign:'center', marginBottom:52 }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#00d4ff', letterSpacing:'.12em', textTransform:'uppercase', marginBottom:16 }}>Harga transparan · Transparent pricing</div>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'clamp(28px,5vw,48px)', fontWeight:700, letterSpacing:'-.03em', marginBottom:16, lineHeight:1.1 }}>
            Fix your PC.<br/>
            <span style={{ background:'linear-gradient(90deg,#00d4ff,#7c3aed)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Pay only if you need more.</span>
          </h1>
          <p style={{ color:'#8888aa', fontSize:15 }}>Mulai gratis — tanpa kartu kredit · Start free — no credit card required</p>
          {notice && <div style={{ marginTop:16, padding:'10px 20px', borderRadius:8, background:'rgba(255,100,100,0.08)', border:'1px solid rgba(255,100,100,0.2)', color:'#ff8888', fontSize:13, display:'inline-block' }}>{notice}</div>}
          {userPlan === 'pro' && <div style={{ marginTop:16, padding:'10px 20px', borderRadius:8, background:'rgba(0,212,255,0.06)', border:'1px solid rgba(0,212,255,0.25)', color:'#00d4ff', fontSize:13, display:'inline-block' }}>✓ Kamu sudah Pro{planExpires ? ` · Aktif sampai ${new Date(planExpires).toLocaleDateString('id-ID')}` : ''}</div>}
        </div>

        {/* Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:24, marginBottom:52 }}>

          {/* FREE */}
          <div style={card(false)}>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:700, marginBottom:8 }}>Free / Gratis</div>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:42, fontWeight:800, color:'#00d4ff', lineHeight:1 }}>Rp0</div>
            <div style={{ fontSize:13, color:'#8888aa', margin:'6px 0 24px' }}>Selamanya · Forever</div>
            <a href="/" style={{ ...btn(false, false), textDecoration:'none' }}>Mulai Gratis →</a>
            {['3 diagnosa AI per bulan','Bahasa Indonesia + English','Analisis screenshot & video','Semua kategori masalah PC','Tanpa daftar akun'].map(f=><div key={f} style={feat}><span style={{ color:'#7c3aed', fontWeight:700, flexShrink:0 }}>✓</span>{f}</div>)}
          </div>

          {/* ONE-TIME */}
          <div style={card(false)}>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:700, marginBottom:8 }}>One-Time Fix</div>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:42, fontWeight:800, color:'#00d4ff', lineHeight:1 }}>Rp50.000</div>
            <div style={{ fontSize:13, color:'#8888aa', margin:'6px 0 24px' }}>Bayar sekali · Tidak kadaluarsa</div>
            <button onClick={() => buy('one_time')} disabled={loading !== null} style={btn(false, loading !== null)}>
              {loading==='one_time' ? '⏳ Memproses...' : 'Beli Sekarang / Buy Now'}
            </button>
            {['1 diagnosa AI tambahan','Full AI diagnosis + fix steps','Analisis gambar & video','Model AI canggih','Tidak kadaluarsa / Never expires'].map(f=><div key={f} style={feat}><span style={{ color:'#7c3aed', fontWeight:700, flexShrink:0 }}>✓</span>{f}</div>)}
          </div>

          {/* PRO */}
          <div style={card(true)}>
            <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:'#00d4ff', color:'#000', fontSize:10, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', padding:'4px 14px', borderRadius:20, whiteSpace:'nowrap' }}>PALING POPULER</div>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:700, marginBottom:8 }}>Pro Monthly</div>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:42, fontWeight:800, color:'#00d4ff', lineHeight:1 }}>Rp160.000</div>
            <div style={{ fontSize:13, color:'#8888aa', margin:'6px 0 24px' }}>per bulan · batal kapan saja</div>
            <button onClick={() => buy('pro')} disabled={loading !== null || userPlan==='pro'} style={btn(true, loading !== null || userPlan==='pro')}>
              {loading==='pro' ? '⏳ Memproses...' : userPlan==='pro' ? '✓ Sudah Pro' : 'Mulai Pro / Get Pro'}
            </button>
            {['Diagnosa AI unlimited','Bahasa Indonesia + English','Analisis gambar & video','Model AI canggih (Claude Opus)','Riwayat percakapan tersimpan','Support prioritas'].map(f=><div key={f} style={feat}><span style={{ color:'#00d4ff', fontWeight:700, flexShrink:0 }}>✓</span>{f}</div>)}
          </div>
        </div>

        {/* Payment methods */}
        <div style={{ background:'rgba(0,212,255,0.04)', border:'1px solid rgba(0,212,255,0.12)', borderRadius:16, padding:'28px 32px', textAlign:'center', marginBottom:48 }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#00d4ff', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:16 }}>METODE PEMBAYARAN · PAYMENT METHODS</div>
          <div style={{ fontSize:14, color:'#a8a8c0', lineHeight:2 }}>
            QRIS · GoPay · OVO · DANA · ShopeePay · LinkAja<br/>
            Transfer Bank: BCA · Mandiri · BNI · BRI · CIMB · BTN<br/>
            Kartu Kredit / Debit (Visa, Mastercard) · Alfamart · Indomaret
          </div>
          <div style={{ marginTop:12, fontSize:11, color:'#606080', fontFamily:"'JetBrains Mono',monospace" }}>
            DIPROSES OLEH DOKU · PT. GLOBAL OPERASI MINERS · AMAN & TERPERCAYA
          </div>
        </div>

        {/* Cost comparison */}
        <div style={{ background:'rgba(15,16,22,0.8)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:32, marginBottom:48 }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#00d4ff', letterSpacing:'.1em', textTransform:'uppercase', textAlign:'center', marginBottom:24 }}>PERBANDINGAN BIAYA · COST COMPARISON</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:24, textAlign:'center' }}>
            {[
              { label:'Tukang Servis PC', price:'Rp200rb–500rb', note:'Per kunjungan', col:'#ff6b6b' },
              { label:'IT Consultant', price:'Rp500rb+/jam', note:'Mahal · tidak selalu ada', col:'#ffaa44' },
              { label:'FixMine Pro', price:'Rp160rb/bulan', note:'Unlimited · instan · 24/7', col:'#00d4ff' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize:13, color:'#8888aa', marginBottom:6 }}>{item.label}</div>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:20, fontWeight:700, color:item.col }}>{item.price}</div>
                <div style={{ fontSize:11, color:'#666680', marginTop:4 }}>{item.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth:640, margin:'0 auto 56px' }}>
          <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:20, fontWeight:700, textAlign:'center', marginBottom:28 }}>FAQ</div>
          {[
            { q:'Metode pembayaran apa yang tersedia?', a:'QRIS, GoPay, OVO, DANA, ShopeePay, LinkAja, transfer bank (BCA, Mandiri, BNI, BRI, CIMB, BTN), kartu kredit/debit Visa & Mastercard, Alfamart, dan Indomaret. Semua diproses oleh DOKU.' },
            { q:'What payment methods are accepted?', a:'QRIS, GoPay, OVO, DANA, ShopeePay, bank transfer, credit/debit cards (Visa, Mastercard), Alfamart, Indomaret. Processed by DOKU.' },
            { q:'Apakah Pro otomatis diperpanjang?', a:'Tidak. Tidak ada perpanjangan otomatis. Setiap bulan kamu memilih apakah ingin lanjut berlangganan atau tidak.' },
            { q:'Apakah ada refund?', a:'Untuk produk digital tidak ada refund setelah pembayaran berhasil. Gunakan Free plan terlebih dahulu sebelum upgrade.' },
            { q:'Bagaimana akun saya diupgrade setelah bayar?', a:'Otomatis dalam hitungan detik setelah pembayaran dikonfirmasi oleh DOKU. Tidak perlu konfirmasi manual.' },
          ].map(item => (
            <div key={item.q} style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', paddingBottom:20, marginBottom:20 }}>
              <div style={{ fontSize:15, fontWeight:600, marginBottom:8 }}>{item.q}</div>
              <div style={{ fontSize:14, color:'#8888aa', lineHeight:1.7 }}>{item.a}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign:'center', fontSize:13, color:'#606080', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:28 }}>
          <div style={{ marginBottom:12 }}>
            <a href="/" style={{ color:'#8888aa', textDecoration:'none', margin:'0 12px' }}>Home</a>
            <a href="/privacy" style={{ color:'#8888aa', textDecoration:'none', margin:'0 12px' }}>Privacy Policy</a>
            <a href="mailto:hello@fixmine.app" style={{ color:'#8888aa', textDecoration:'none', margin:'0 12px' }}>hello@fixmine.app</a>
          </div>
          © 2026 FixMine · AI PC Problem Solver<br/>
          <span style={{ fontSize:11 }}>Pembayaran diproses oleh DOKU · PT. Global Operasi Miners · MID: BRN-0280-1777102334281</span>
        </div>

      </div>
    </div>
  )
}
