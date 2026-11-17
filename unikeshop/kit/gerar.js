// Gera o PDF de um material: node gerar.js materiais/<slug>.html [--a4]
// Padrão: 1 página longa de celular (430px), ideal para WhatsApp. --a4: páginas A4 para imprimir.
const {chromium}=require('playwright');const path=require('path');
(async()=>{
  const src=path.resolve(process.argv[2]);const a4=process.argv.includes('--a4');
  const out=src.replace(/\.html$/,'.pdf');
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:a4?794:430,height:900}});
  await p.goto('file://'+src,{waitUntil:'networkidle'});
  await p.evaluate(()=>document.fonts.ready);
  if(a4){await p.pdf({path:out,format:'A4',printBackground:true,margin:{top:'14mm',bottom:'14mm',left:'0',right:'0'}});}
  else{const h=await p.evaluate(()=>Math.ceil(document.documentElement.scrollHeight));
    await p.pdf({path:out,width:'430px',height:(h+2)+'px',printBackground:true,pageRanges:'1'});}
  await p.screenshot({path:src.replace(/\.html$/,'.png'),fullPage:true});
  await b.close();console.log(out);
})();
