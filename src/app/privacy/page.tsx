export default function PrivacyPage() {
  const S = { wrap:{ minHeight:'100vh', background:'#060608', padding:'60px 24px', fontFamily:"'Space Grotesk',sans-serif", color:'#f0f0f8' }, inner:{ maxWidth:720, margin:'0 auto' }, h2:{ fontFamily:"'Outfit',sans-serif", fontSize:20, fontWeight:700, color:'#00d4ff', margin:'32px 0 12px' }, p:{ fontSize:14, lineHeight:1.8, color:'#a8a8c0', marginBottom:12 } }
  return (
    <div style={S.wrap}><div style={S.inner}>
      <a href="/" style={{ display:'inline-flex', alignItems:'center', gap:8, textDecoration:'none', marginBottom:40 }}>
        <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#00d4ff,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>⚡</div>
        <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:700, color:'#f0f0f8' }}>FIXMINE</span>
      </a>
      <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:36, fontWeight:700, marginBottom:8 }}>Privacy Policy</h1>
      <p style={{ ...S.p, color:'#6060780' }}>Last updated: April 2026</p>
      <h2 style={S.h2}>1. Data We Collect</h2>
      <p style={S.p}>We collect your email address when you create an account. We collect PC problem descriptions and screenshots you submit for diagnosis. We collect usage data (number of diagnoses per month) for rate limiting. We do NOT collect your name, phone number, location, or any personal identifying information beyond email.</p>
      <h2 style={S.h2}>2. How We Use Your Data</h2>
      <p style={S.p}>Your PC problem descriptions are sent to Anthropic's Claude AI for diagnosis. Conversations are used only to provide the service and are automatically deleted after 30 days. We never sell your data to third parties. We never use your data for advertising.</p>
      <h2 style={S.h2}>3. Data Storage</h2>
      <p style={S.p}>User accounts and usage data are stored securely in Supabase (Singapore region). Conversations are stored temporarily in memory only and deleted after your session ends or after 30 days.</p>
      <h2 style={S.h2}>4. Your Rights</h2>
      <p style={S.p}>You can request deletion of your account and all associated data at any time by emailing hello@fixmine.app. We will delete all your data within 7 days of your request.</p>
      <h2 style={S.h2}>5. Cookies</h2>
      <p style={S.p}>We use only essential cookies for authentication (Supabase session). We do not use tracking or advertising cookies.</p>
      <h2 style={S.h2}>6. Contact</h2>
      <p style={S.p}>For privacy questions: <a href="mailto:hello@fixmine.app" style={{ color:'#00d4ff' }}>hello@fixmine.app</a></p>
    </div></div>
  )
}
