'use client'

export type Lang = 'en' | 'id'

export const STRINGS = {
  en: {
    tagline: 'AI-POWERED DIAGNOSTICS v2.0',
    headline1: 'Your PC broke.',
    headline2: 'We fix it with AI.',
    sub: 'Describe the symptom. AI diagnoses root cause.\nStep-by-step fix in seconds — no tech knowledge needed.',
    orDescribe: '> OR DESCRIBE YOUR PROBLEM',
    placeholder: 'e.g. My laptop keeps freezing randomly...',
    stats: [['10K+','PCs fixed'],['94%','success rate'],['<3min','avg fix time'],['FREE','3 fixes/mo']] as [string,string][],
    newBtn: '+ NEW',
    inputPlaceholder: 'Reply or add more details...',
    hint: 'ENTER TO SEND · SHIFT+ENTER FOR NEW LINE',
    fixedBtn: '✓ FIXED',
    brokenBtn: '✗ STILL BROKEN',
    feedbackLogged: 'FEEDBACK LOGGED',
    categories: [
      { icon:'⚡', title:'Slow PC', hint:'Startup · lag · freeze', prompt:'My PC is really slow and takes forever to start up' },
      { icon:'💀', title:'Blue Screen', hint:'BSOD · crashes · reboots', prompt:'My PC keeps crashing or showing a blue screen error' },
      { icon:'⚠', title:'Error Code', hint:'Messages · codes · alerts', prompt:'I have an error message or error code on my PC' },
      { icon:'📡', title:'WiFi Issues', hint:'Drops · slow · no connect', prompt:'My WiFi or internet keeps dropping or is very slow' },
      { icon:'🦠', title:'Virus / Malware', hint:'Suspicious · slow · popups', prompt:'I think my PC might have a virus or malware' },
      { icon:'🔧', title:'Other Issue', hint:'Anything else', prompt:'I have a different PC problem I need help diagnosing' },
    ],
  },
  id: {
    tagline: 'DIAGNOSIS AI v2.0',
    headline1: 'PC kamu bermasalah.',
    headline2: 'AI yang benerin.',
    sub: 'Ceritain gejalanya. AI diagnosa penyebabnya.\nLangkah perbaikan dalam detik — tidak perlu paham teknologi.',
    orDescribe: '> ATAU CERITAKAN MASALAH KAMU',
    placeholder: 'contoh: Laptop saya sering hang tiba-tiba...',
    stats: [['10K+','PC diperbaiki'],['94%','tingkat sukses'],['<3 menit','rata-rata fix'],['GRATIS','3 diagnosa/bulan']] as [string,string][],
    newBtn: '+ BARU',
    inputPlaceholder: 'Balas atau tambah detail...',
    hint: 'ENTER UNTUK KIRIM · SHIFT+ENTER BARIS BARU',
    fixedBtn: '✓ SUDAH BERES',
    brokenBtn: '✗ MASIH BERMASALAH',
    feedbackLogged: 'FEEDBACK TERCATAT',
    categories: [
      { icon:'⚡', title:'PC Lemot', hint:'Booting lama · lag · hang', prompt:'PC saya sangat lambat dan lama sekali saat dinyalakan' },
      { icon:'💀', title:'Blue Screen', hint:'BSOD · crash · restart sendiri', prompt:'PC saya sering crash atau muncul layar biru error' },
      { icon:'⚠', title:'Kode Error', hint:'Pesan error · kode · alert', prompt:'Ada pesan error atau kode error di PC saya' },
      { icon:'📡', title:'WiFi Bermasalah', hint:'Putus-putus · lambat · tidak konek', prompt:'WiFi atau internet saya sering putus atau sangat lambat' },
      { icon:'🦠', title:'Virus / Malware', hint:'Perilaku mencurigakan · lemot', prompt:'Saya curiga PC saya kena virus atau malware' },
      { icon:'🔧', title:'Masalah Lain', hint:'Apapun masalahnya', prompt:'Ada masalah PC lain yang perlu saya diagnosa' },
    ],
  },
}

export function LanguageSelect({ onSelect }: { onSelect: (lang: Lang) => void }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, background:'#060608', backgroundImage:'linear-gradient(rgba(0,212,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.02) 1px,transparent 1px)', backgroundSize:'32px 32px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:32 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:52, height:52, borderRadius:14, background:'linear-gradient(135deg,#00d4ff,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, boxShadow:'0 0 24px rgba(0,212,255,.3)' }}>⚡</div>
        <div>
          <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:28, fontWeight:700, letterSpacing:'-.02em', background:'linear-gradient(90deg,#fff,#00d4ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>FIXMINE</div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#44445a', letterSpacing:'.08em' }}>AI PC REPAIR</div>
        </div>
      </div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#00d4ff', letterSpacing:'.12em', textTransform:'uppercase' }}>// SELECT LANGUAGE · PILIH BAHASA</div>
      <div style={{ display:'flex', gap:16, flexWrap:'wrap', justifyContent:'center' }}>
        {(['en','id'] as Lang[]).map(l => (
          <button key={l} onClick={() => onSelect(l)} style={{ width:200, padding:'20px 24px', borderRadius:16, background:'rgba(15,16,22,0.8)', border:'1px solid rgba(0,212,255,0.2)', cursor:'pointer', transition:'all .2s', textAlign:'left' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(0,212,255,.5)'; e.currentTarget.style.boxShadow='0 0 20px rgba(0,212,255,.2)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(0,212,255,.2)'; e.currentTarget.style.boxShadow='none' }}>
            <div style={{ fontSize:28, marginBottom:8 }}>{l==='en'?'🇺🇸':'🇮🇩'}</div>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:600, color:'#f0f0f8', marginBottom:4 }}>{l==='en'?'English':'Bahasa Indonesia'}</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#8888aa', letterSpacing:'.04em' }}>{l==='en'?'CONTINUE IN ENGLISH':'LANJUT DALAM BAHASA'}</div>
          </button>
        ))}
      </div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'#44445a', letterSpacing:'.06em' }}>YOU CAN CHANGE THIS LATER · BISA DIGANTI NANTI</div>
    </div>
  )
}
