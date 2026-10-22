'use client';
export default function GlobalError({reset}:{reset:()=>void}) {
 return <html lang="en"><body style={{margin:0,fontFamily:'Arial, sans-serif',background:'#f7f8f6',color:'#19372a'}}><main style={{maxWidth:480,margin:'10vh auto',padding:32,textAlign:'center'}}><h1>Seedly is temporarily unavailable</h1><p style={{lineHeight:1.6}}>We could not load the store. Please try again shortly. Your saved basket has not been cleared.</p><button type="button" onClick={reset} style={{marginTop:16,padding:'12px 24px',background:'#19372a',color:'white',border:0,borderRadius:8,cursor:'pointer'}}>Try again</button></main></body></html>;
}
