const $=s=>document.querySelector(s);
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CL={'6A':{n:'6º A',se:'6º ano'},'7B':{n:'7º B',se:'7º ano'},'8A':{n:'8º A',se:'8º ano'},'9C':{n:'9º C',se:'9º ano'},'1A':{n:'1º A EM',se:'1º ano EM'}};
const DISC=['Matemática','Português','Ciências','História','Geografia','Inglês'];
const U=[{r:'prof',id:'PROF01',pin:'1234',name:'Profª Marina'},{r:'prof',id:'PROF02',pin:'5678',name:'Prof. Carlos'},{r:'alu',id:'A1001',pin:'1111',name:'Aluno A1001',c:'7B'},{r:'alu',id:'A1002',pin:'2222',name:'Aluno A1002',c:'7B'},{r:'coord',id:'COORD',pin:'9999',name:'Coordenação',lvl:'coord'},{r:'coord',id:'DIR01',pin:'0000',name:'Direção',lvl:'dir'},{r:'coord',id:'SEC01',pin:'0001',name:'Secretaria',lvl:'sec'}];
const SEEDV=[['PROF01','7B','Matemática'],['PROF01','7B','Ciências'],['PROF01','8A','Ciências'],['PROF02','7B','Português'],['PROF02','9C','Português'],['PROF02','1A','Matemática']].map((x,i)=>({id:i+1,p:x[0],c:x[1],s:x[2]}));
const SEED={'7B|Matemática':[31,58,{'Frações equivalentes':[26,31],'Comparar frações':[20,31],'Operações com frações':[13,31]}],'7B|Ciências':[31,62,{'Ecossistemas':[19,31],'Cadeia alimentar':[24,31]}],'7B|Português':[31,52,{'Interpretação de texto':[17,31],'Pontuação':[12,31]}],'8A|Ciências':[30,66,{'Células':[22,30],'Fotossíntese':[15,30]}],'9C|Português':[28,49,{'Interpretação de texto':[18,28],'Concordância verbal':[12,28]}],'1A|Matemática':[33,55,{'Funções afins':[14,33],'Equações do 2º grau':[20,33]}]};
const SIZE={'6A':30,'7B':34,'8A':33,'9C':45,'1A':40};
const HIST={'7B|Matemática':[46,48,50,52,54,56,58],'7B|Ciências':[55,57,58,60,59,61,62],'7B|Português':[48,49,50,52,51,52,52],'8A|Ciências':[54,57,59,61,63,64,66],'9C|Português':[58,56,55,53,51,50,49],'1A|Matemática':[50,51,52,52,54,55,55]};
const SKPREV={'7B|Matemática':{'Frações equivalentes':76,'Comparar frações':77,'Operações com frações':50},'7B|Ciências':{'Ecossistemas':58,'Cadeia alimentar':72},'7B|Português':{'Interpretação de texto':50,'Pontuação':44},'8A|Ciências':{'Células':65,'Fotossíntese':52},'9C|Português':{'Interpretação de texto':66,'Concordância verbal':40},'1A|Matemática':{'Funções afins':45,'Equações do 2º grau':66}};
const PREV={};Object.entries(HIST).forEach(([k,v])=>PREV[k]=v[v.length-1]);
const fresh=()=>({q:{},d:{},res:Object.entries(SEED).map(([k,v])=>({k,s:v[2],seed:v[0]})),doubts:[],rev:[],v:SEEDV.map(x=>({...x})),nid:20});
let pv='plan',cv='geral',S=fresh(),me=null,pf={},cf={se:'',c:'',s:''},lrole='prof',stu={D:{}},busy='',err='';
try{const j=JSON.parse(localStorage.getItem('edu3')||'null');if(j)S=Object.assign(S,j)}catch(e){}
const save=()=>{try{localStorage.setItem('edu3',JSON.stringify(S))}catch(e){}};
const fmt='Responda SOMENTE com JSON válido, sem texto extra.';
const qfmt='"questions":[{"skill":"habilidade curta","level":2,"q":"enunciado","options":["A","B","C","D"],"answer":0,"why":"explicação curta (1 a 2 frases) de por que a correta está certa e qual erro comum leva às outras"}]';
const valid=qs=>Array.isArray(qs)&&qs.length&&qs.every(x=>x.q&&Array.isArray(x.options)&&x.options.length>=2&&Number.isInteger(x.answer));
const API_URL='https://requiz.arthurpomini1.workers.dev/';
const hasApi=()=>API_URL.startsWith('https://')||API_URL.startsWith('http://');
async function ai(p){
  if(!hasApi())throw new Error('IA não configurada: coloque a URL do Worker em API_URL no código.');
  const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:p})});
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(j.error||'A IA não respondeu ('+r.status+'). Tente de novo.');
  const m=String(j.text||'').replace(/```json|```/g,'').trim();
  try{return JSON.parse(m)}catch(e){throw new Error('Resposta da IA fora do formato. Tente de novo.')}
}
async function run(l,fn){busy=l;err='';render();try{await fn()}catch(e){err=(e&&e.message)||'A IA não respondeu. Tente de novo.'}busy='';render()}
const kn=k=>{const[c,s]=k.split('|');return `${CL[c].n} · ${s}`};
const pname=id=>(U.find(u=>u.id===id)||{}).name||id;
const sel=(id,opts,val,lbl)=>`<div class="g"><label class="mut" for="${id}">${lbl}</label><select id="${id}">${opts.map(([v,t])=>`<option value="${esc(v)}" ${v===val?'selected':''}>${esc(t)}</option>`).join('')}</select></div>`;

function agg(k){const a={};let ok=0,t=0,n=0;S.res.filter(r=>r.k===k).forEach(r=>{n+=r.seed||(r.q?1:0);Object.entries(r.s).forEach(([sk,v])=>{const x=a[sk]||(a[sk]=[0,0]);x[0]+=v[0];x[1]+=v[1];ok+=v[0];t+=v[1]})});return{a,n,p:t?Math.round(ok/t*100):null}}
const lab=p=>p>=70?'dominada':p>=50?'atenção':'reforçar';
const skillRows=a=>Object.keys(a).length?Object.entries(a).map(([k,[x,y]])=>{const p=y?Math.round(x/y*100):0;return `<div class="row"><p class="g">${esc(k)}</p><div class="bar"><i style="width:${p}%"></i></div><span class="chip">${p}% · ${lab(p)}</span></div>`}).join(''):'<p class="mut">Ainda sem respostas.</p>';

function login(){
  const id=$('#lid').value.trim().toUpperCase(),pin=$('#lpin').value.trim();
  const u=U.find(x=>x.r===lrole&&x.id===id&&x.pin===pin);
  if(!u){err='Código ou PIN incorreto.';return render()}
  me=u;pf={};stu={D:{}};err='';render();
}
function genQuiz(k){
  const plan=$('#plan').value.trim();
  if(!plan){err='Cole o planejamento da semana.';return render()}
  const[c,s]=k.split('|');
  run('Gerando questionário…',async()=>{
    const r=await ai(`Você é um assistente pedagógico para a rede pública brasileira. Crie 5 questões de múltipla escolha (4 alternativas, só uma correta) com dificuldade variada (campo "level": 1 fácil, 2 médio, 3 difícil; use 2 de nível 1, 2 de nível 2 e 1 de nível 3) para a turma ${CL[c].n} (${CL[c].se}), disciplina ${s}, alinhadas à BNCC e ao planejamento abaixo. Linguagem clara. ${fmt} Formato: {${qfmt}}\nPlanejamento: ${plan}`);
    if(!valid(r.questions))throw new Error('Resposta da IA fora do formato. Tente de novo.');
    S.d[k]=r.questions;save();
  });
}
const st=()=>stu.rv?stu.rv:(stu.D[stu.o]||(stu.D[stu.o]={}));
function startRun(){st().run={items:S.q[stu.o].map(x=>({x,orig:true})),pos:0,sel:null,fb:null,xp:0,streak:0,wr:[],rec:0,ph:'play',n:S.q[stu.o].length,lvl:2};render()}
function checkAns(){
  const r=st().run,it=r.items[r.pos],ok=r.sel===it.x.answer;it.ok=ok;r.fb=ok;
  if(ok){r.xp+=it.orig?10:5;r.streak++;if(!it.orig)r.rec++}else{r.streak=0;if(it.orig)r.wr.push(it)}
  if(ok&&r.streak>=2)r.lvl=Math.min(3,r.lvl+1);if(!ok)r.lvl=Math.max(1,r.lvl-1);
  render();
}
function nextQ(){
  const r=st().run;r.pos++;r.sel=null;r.fb=null;
  if(r.pos<r.n){let b=r.pos;for(let j=r.pos;j<r.n;j++)if(Math.abs((r.items[j].x.level||2)-r.lvl)<Math.abs((r.items[b].x.level||2)-r.lvl))b=j;[r.items[r.pos],r.items[b]]=[r.items[b],r.items[r.pos]]}
  if(r.pos<r.items.length)return render();
  if(!r.retried&&r.wr.length){r.retried=true;r.ph='gen';render();return genVariants()}
  finish();
}
function genVariants(){
  const r=st().run,src=r.wr.map(i=>({skill:i.x.skill,q:i.x.q,options:i.x.options,answer:i.x.answer}));
  run('Criando versões novas das que você errou…',async()=>{
    const o=await ai(`Para cada questão abaixo, crie UMA questão nova do mesmo estilo, mesma habilidade e mesmo nível de dificuldade, mas com números, valores ou exemplos DIFERENTES (ex.: 1/2 + 1/4 vira 1/3 + 1/6). Mantenha 4 alternativas, só uma correta, e a mesma ordem das questões. ${fmt} Formato: {${qfmt}}\nQuestões originais: ${JSON.stringify(src)}`);
    if(!valid(o.questions)||o.questions.length<src.length)throw new Error('Não consegui criar as versões novas. Tente de novo ou pule a revisão.');
    o.questions.slice(0,src.length).forEach((x,i)=>{x.skill=src[i].skill;r.items.push({x,orig:false})});
    r.ph='play';
  });
}
function finish(){
  const d=st(),r=d.run,res={};
  r.items.filter(i=>i.orig).forEach(i=>{const a=res[i.x.skill]||(res[i.x.skill]=[0,0]);a[1]++;if(i.ok)a[0]++});
  r.items.filter(i=>!i.orig&&i.ok).forEach(i=>{const a=res[i.x.skill];if(a)a[0]=Math.min(a[1],a[0]+1)});
  if(d.e){const ok=r.items.filter(i=>i.ok).length,e=d.e;e.st=ok>=2?Math.min(e.st+1,3):0;e.due=Date.now()+[1,3,7,21][e.st]*864e5;d.res={};r.ph='done';save();render();return}
  d.res=res;r.ph='done';S.res.push({k:stu.o,sid:me.id,s:res,q:1});Object.entries(res).forEach(([sk,v])=>{if(v[1]&&v[0]/v[1]>=.7)schedule(stu.o,sk)});save();render();
}
function schedule(k,sk){if(!S.rev.some(e=>e.sid===me.id&&e.k===k&&e.s===sk))S.rev.push({sid:me.id,k,s:sk,st:0,due:Date.now()+864e5})}
function genReview(i){
  const e=S.rev[i];
  run('Preparando sua revisão…',async()=>{
    const o=await ai(`Crie 3 questões de revisão de múltipla escolha (4 alternativas, só uma correta) sobre a habilidade "${e.s}" (${e.k.split('|')[1]}) para aluno do ensino público brasileiro, com explicação curta. ${fmt} Formato: {${qfmt}}`);
    if(!valid(o.questions))throw new Error('Resposta da IA fora do formato. Tente de novo.');
    const qs=o.questions.slice(0,3);qs.forEach(x=>x.skill=e.s);
    stu.rv={e,run:{items:qs.map(x=>({x,orig:true})),pos:0,n:qs.length,sel:null,fb:null,xp:0,streak:0,wr:[],rec:0,ph:'play',retried:true,lvl:2}};
  });
}
function revCard(){
  const m=S.rev.map((e,i)=>({e,i})).filter(x=>x.e.sid===me.id),due=m.filter(x=>x.e.due<=Date.now());
  if(!m.length)return '';
  if(due.length)return `<div class="bx"><h2>Revisão do dia</h2><p class="mut">Rever no tempo certo ajuda a fixar o conteúdo.</p>${due.map(x=>`<div class="row"><p class="g">${esc(x.e.s)} <span class="mut">· ${esc(x.e.k.split('|')[1])}</span></p><button class="btn2" data-act="rev" data-i="${x.i}" ${busy?'disabled':''}>Revisar</button></div>`).join('')}</div>`;
  const nx=Math.max(1,Math.ceil((Math.min(...m.map(x=>x.e.due))-Date.now())/864e5));
  return `<div class="bx"><h2>Revisões agendadas</h2><p class="mut">Próxima revisão em ${nx} dia(s).</p><button class="btn2" data-act="sim">Simular +1 dia (teste)</button></div>`;
}
function introHTML(){return `<div class="bx"><h2>Pronto para começar?</h2><p class="mut">${S.q[stu.o].length} questões, uma de cada vez. Se errar, a questão volta no final com números diferentes.</p><button class="btn" data-act="start">Começar</button></div>`}
function sumHTML(r){const o=r.items.filter(i=>i.orig),f=o.filter(i=>i.ok).length;return `<div class="bx"><h2>Lição concluída!</h2><div class="row"><span class="chip">${f}/${o.length} de primeira</span><span class="chip">${r.rec} recuperada(s) na revisão</span><span class="chip">${r.xp} XP</span></div></div>`}
function playHTML(d){
  const r=d.run;
  if(r.ph==='gen')return `<div class="bx"><h2>Quase lá!</h2><p>Vamos rever o que você errou, com números diferentes.</p><div class="row"><button class="btn" data-act="retryv" ${busy?'disabled':''}>Criar novas versões</button><button class="btn2" data-act="skip" ${busy?'disabled':''}>Pular revisão</button></div></div>`;
  const it=r.items[r.pos],x=it.x,done=r.fb!==null;
  return `<div class="row"><div class="bar"><i style="width:${Math.round(r.pos/r.items.length*100)}%"></i></div><span class="chip">Sequência ${r.streak}</span><span class="chip">${r.xp} XP</span></div><div class="bx">${it.orig?'<span class="chip" style="align-self:flex-start">Nível '+(x.level||2)+'</span>':'<span class="chip" style="align-self:flex-start">Revisão · mesmo estilo, números novos</span>'}<h2>${esc(x.q)}</h2>${x.options.map((o,j)=>`<label class="oc ${done?(j===x.answer?'good':j===r.sel?'wrong':''):(r.sel===j?'sel':'')}"><input type="radio" name="dq" data-p="d" data-j="${j}" ${r.sel===j?'checked':''} ${done?'disabled':''}>${esc(o)}</label>`).join('')}</div>${done?`<div class="fb ${r.fb?'ok':'bad'}">${r.fb?'✓ Muito bem!':'✗ Quase! Resposta certa: '+esc(x.options[x.answer])}${x.why?'<p style="font-weight:400;margin-top:6px">'+esc(x.why)+'</p>':''}</div><button class="btn" data-act="next">Continuar</button>`:`<button class="btn" data-act="check" ${r.sel==null?'disabled':''}>Verificar</button>`}`;
}
function genRef(skill){
  const k=stu.o;
  run('Criando reforço…',async()=>{
    const orig=S.q[k].filter(x=>x.skill===skill).map(x=>x.q).join(' | ');
    const r=await ai(`Aluno do ensino público brasileiro com dificuldade na habilidade "${skill}" (${k.split('|')[1]}). Escreva uma explicação curta e acolhedora (máx. 6 frases, com um exemplo) e crie 3 questões NOVAS de múltipla escolha, diferentes destas: ${orig}. ${fmt} Formato: {"explicacao":"texto",${qfmt}}`);
    if(!valid(r.questions))throw new Error('Resposta da IA fora do formato. Tente de novo.');
    st().ref={skill,text:r.explicacao,qs:r.questions,ans:{},done:null};
  });
}
function checkRef(){
  const d=st(),R=d.ref,ok=R.qs.filter((x,i)=>R.ans[i]===x.answer).length;
  R.done=ok;d.res[R.skill]=[ok,R.qs.length];S.res.push({k:stu.o,sid:me.id,s:{[R.skill]:[ok,R.qs.length]}});if(ok/R.qs.length>=.7)schedule(stu.o,R.skill);save();render();
}
function sendDoubt(){
  const t=$('#doubt').value.trim(),s=$('#dsub').value;if(!t)return;
  S.doubts.unshift({k:me.c+'|'+s,t,d:new Date().toLocaleDateString('pt-BR')});save();stu.sent=true;render();
}
const PLIM=5000,PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',PDFW='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
let pdfMsg='';
const loadJs=u=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=u;s.onload=ok;s.onerror=()=>no(new Error('Não consegui carregar o leitor de PDF. Cole o texto manualmente.'));document.head.appendChild(s)});
async function pdfText(f){
  if(!window.pdfjsLib){await loadJs(PDFJS);pdfjsLib.GlobalWorkerOptions.workerSrc=PDFW}
  const doc=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;let t='';
  for(let i=1;i<=doc.numPages&&t.length<PLIM*2;i++){const p=await doc.getPage(i),c=await p.getTextContent();t+=c.items.map(x=>x.str).join(' ')+'\n'}
  return t.replace(/[ \t]+/g,' ').replace(/\n\s*\n+/g,'\n').trim();
}
function addPdfs(files){
  const fs=[...files].filter(f=>/\.pdf$/i.test(f.name)||f.type==='application/pdf');
  if(!fs.length){err='Envie arquivos em PDF.';return render()}
  run('Lendo PDF…',async()=>{
    let txt='',empty=[];pdfMsg='';
    for(const f of fs){
      if(f.size>15e6){empty.push(f.name+' (maior que 15 MB)');continue}
      let t='';try{t=await pdfText(f)}catch(e){if(/carregar o leitor/.test(e.message))throw e;empty.push(f.name+' (não consegui abrir)');continue}
      if(t.length<20){empty.push(f.name+' (sem texto, talvez seja um PDF escaneado)');continue}
      txt+=(txt?'\n\n':'')+t;
    }
    if(!txt)throw new Error('Não encontrei texto nos PDFs: '+empty.join('; ')+'. Cole o conteúdo manualmente.');
    const el=$('#plan'),cur=el?el.value.trim():'',all=(cur?cur+'\n\n':'')+txt,cut=all.length>PLIM;
    if(el)el.value=all.slice(0,PLIM);
    pdfMsg=`${fs.length-empty.length} PDF(s) lido(s)`+(cut?`; usei só os primeiros ${PLIM} caracteres`:'')+(empty.length?'; ignorados: '+empty.join('; '):'')+'. Revise o texto antes de gerar.';
  });
}
function addLink(){
  const p=$('#np').value,c=$('#nc').value,s=$('#ns').value;
  if(S.v.some(x=>x.p===p&&x.c===c&&x.s===s)){err='Esse vínculo já existe.';return render()}
  S.v.push({id:S.nid++,p,c,s});err='';save();render();
}

function quizHTML(qs,ans,p,lock){
  return qs.map((x,i)=>`<div class="bx"><h3>${i+1}. ${esc(x.q)}</h3><span class="chip" style="align-self:flex-start">${esc(x.skill||'')}</span>${x.options.map((o,j)=>`<label class="opt"><input type="radio" name="${p}${i}" data-p="${p}" data-i="${i}" data-j="${j}" ${ans&&ans[i]===j?'checked':''} ${lock?'disabled':''}>${esc(o)}</label>`).join('')}</div>`).join('');
}
function loginView(){
  const T=[['prof','Professor'],['alu','Aluno'],['coord','Coordenação']];
  return `<div class="bx" style="max-width:420px;margin:30px auto;width:100%"><div class="ph">[Logo e nome da escola]</div><h1>Entrar</h1><div class="row">${T.map(([k,v])=>`<button class="tab ${lrole===k?'on':''}" data-act="role" data-k="${k}">${v}</button>`).join('')}</div><label class="mut" for="lid">${lrole==='alu'?'Matrícula':'Código de acesso'}</label><input type="text" id="lid" autocomplete="off"><label class="mut" for="lpin">PIN</label><input type="password" id="lpin" inputmode="numeric" autocomplete="off"><button class="btn" data-act="login">Entrar</button><p class="mut">Contas de teste: PROF01 · 1234 | PROF02 · 5678 | A1001 · 1111 | A1002 · 2222 | COORD · 9999 | DIR01 · 0000 | SEC01 · 0001</p></div>`;
}
const stuOf=c=>U.filter(u=>u.r==='alu'&&u.c===c);
function stuData(sid,k){
  const rs=S.res.filter(r=>r.sid===sid&&r.k===k),sk={};
  rs.forEach(r=>Object.entries(r.s).forEach(([n,v])=>{sk[n]=v}));
  return{done:rs.length>0,sk};
}
const needOf=sk=>Object.entries(sk).filter(([,[a,b]])=>b&&a/b<.7).map(([n])=>n);
const totP=sk=>{let a=0,b=0;Object.values(sk).forEach(v=>{a+=v[0];b+=v[1]});return b?Math.round(a/b*100):null};
function indView(c,k){
  const L=stuOf(c).map(u=>{const d=stuData(u.id,k);return{u,...d,need:needOf(d.sk)}});
  if(!pf.stu||!L.some(x=>x.u.id===pf.stu))pf.stu=null;
  const groups={};L.forEach(x=>x.need.forEach(n=>(groups[n]=groups[n]||[]).push(x.u.name)));
  let h=`<div class="bx"><h2>Quem precisa de reforço</h2><p class="mut">Alunos agrupados por habilidade abaixo de 70%, para organizar o apoio.</p>`;
  h+=Object.keys(groups).length?Object.entries(groups).map(([n,l])=>`<div class="row"><p class="g">${esc(n)}</p><span class="chip">${l.length} aluno(s)</span><p class="mut" style="flex-basis:100%">${l.map(esc).join(', ')}</p></div>`).join(''):'<p class="mut">Nenhum aluno com habilidade abaixo de 70% por enquanto.</p>';
  h+=`</div><div class="bx"><h2>Desempenho individual</h2><p class="mut">Visível apenas para o professor vinculado a esta turma. A coordenação e a direção continuam vendo só dados agregados.</p>`;
  h+=L.length?L.map(x=>{
    const p=totP(x.sk),open=pf.stu===x.u.id;
    const tag=!x.done?'sem atividade':x.need.length?x.need.length+' p/ reforçar':'em dia';
    return `<div class="rk" style="grid-template-columns:1.6fr 1fr 1fr auto"><span>${esc(x.u.name)}</span><span>${p==null?'—':p+'%'}</span><span class="chip" style="justify-self:start">${tag}</span><button class="btn2" data-act="stu" data-i="${esc(x.u.id)}" aria-expanded="${open}">${open?'Fechar':'Ver detalhes'}</button></div>`+(open?`<div style="padding:4px 0 12px">${x.done?skillRows(x.sk):'<p class="mut">Este aluno ainda não fez a atividade.</p>'}</div>`:'');
  }).join(''):'<p class="mut">Nenhum aluno cadastrado nesta turma.</p>';
  return h+'</div>';
}
function profView(off){
  const V=S.v.filter(x=>x.p===me.id),cs=[...new Set(V.map(x=>x.c))];
  const nav=navHTML('Professor',[['plan','Planejamento'],['painel','Painel da turma'],['duv','Dúvidas']],pv,'p');
  if(!cs.length)return shell(nav,stat()+`<div class="bx"><h2>Sem turmas vinculadas</h2><p class="mut">A coordenação ainda não vinculou turmas e disciplinas ao seu acesso.</p></div>`);
  if(!cs.includes(pf.c))pf.c=cs[0];
  const ss=V.filter(x=>x.c===pf.c).map(x=>x.s);if(!ss.includes(pf.s))pf.s=ss[0];
  const k=pf.c+'|'+pf.s,q=S.q[k],d=S.d[k],A=agg(k),ds=S.doubts.filter(x=>x.k===k);
  let h=stat()+`<div class="row">${sel('fc',cs.map(c=>[c,CL[c].n]),pf.c,'Turma')}${sel('fs',ss.map(s=>[s,s]),pf.s,'Disciplina')}</div>`;
  if(pv==='plan'){
    h+=`<div class="bx"><h2>1. Planejamento da semana</h2><label id="pdfdrop" class="ph" style="cursor:pointer;position:relative">Arraste PDFs do conteúdo aqui (ou clique para escolher). O texto vai para o campo abaixo.<input type="file" id="pdfin" accept=".pdf,application/pdf" multiple style="position:absolute;opacity:0;width:1px;height:1px"></label>${pdfMsg?`<p class="chip" style="align-self:flex-start;white-space:normal">${esc(pdfMsg)}</p>`:''}<textarea id="plan" aria-label="Planejamento" placeholder="Cole o planejamento semanal e o conteúdo ensinado…"></textarea><button class="btn" style="align-self:flex-start" data-act="gen" ${off}>Gerar questionário com IA</button></div>`;
    if(d)h+=`<div class="bx"><h2>2. Revisar e aprovar</h2>${d.map((x,i)=>`<div class="row"><p class="g"><b>${i+1}.</b> ${esc(x.q)}<br><span class="mut">Gabarito: ${esc(x.options[x.answer])} · ${esc(x.skill||'')}</span></p><span class="chip">Nível ${x.level||2}</span><button class="btn2" data-act="del" data-i="${i}">Excluir</button></div>`).join('')}<div class="row"><button class="btn2" data-act="gen" ${off}>Gerar de novo</button><span class="g"></span><button class="btn" data-act="ok" ${d.length?'':'disabled'}>Aprovar e aplicar</button></div></div>`;
    if(q)h+=`<p class="chip" style="align-self:flex-start">Questionário ativo: ${q.length} questões</p>`;
  }else if(pv==='painel'){
    const low=Object.values(A.a).filter(([a,b])=>b&&a/b<.7).length;
    h+=`<div class="row"><div class="bx g"><p class="mut">Responderam</p><p class="kpi">${A.n}/${SIZE[pf.c]||30}</p></div><div class="bx g"><p class="mut">Domínio médio</p><p class="kpi">${A.p==null?'—':A.p+'%'}</p></div><div class="bx g"><p class="mut">Habilidades em reforço</p><p class="kpi">${low}</p></div></div><div class="bx"><h2>Habilidades da semana</h2>${skillRows(A.a)}</div><p class="mut">Visão agregada da turma, sem nomes de alunos.</p>`;
    h+=indView(pf.c,k);
  }else h+=`<div class="bx"><h2>Dúvidas anônimas</h2>${ds.length?ds.map(x=>`<p>• ${esc(x.t)} <span class="mut">(${x.d})</span></p>`).join(''):'<p class="mut">Nenhuma dúvida enviada.</p>'}</div>`;
  return shell(nav,h);
}
function aluView(off){
  const c=me.c,ss=[...new Set(S.v.filter(x=>x.c===c).map(x=>x.s))];
  let h=`<p class="mut">Turma ${CL[c].n}</p>`;
  if(stu.rv){const v=stu.rv;h+=`<div class="row"><button class="btn2" data-act="rvx">← Voltar</button><h2>Revisão: ${esc(v.e.s)}</h2></div>`+(v.res?`<div class="bx"><h2>Revisão concluída!</h2><p class="mut">Próxima revisão em ${Math.max(1,Math.round((v.e.due-Date.now())/864e5))} dia(s).</p><button class="btn" data-act="rvx">Voltar às disciplinas</button></div>`:playHTML(v));return h}
  if(!stu.o){
    h+=revCard()+`<h2>Suas disciplinas</h2>`+ss.map(s=>{const k=c+'|'+s,d=stu.D[k]||{};const t=!S.q[k]?'sem atividade':d.res?'concluída':'atividade disponível';return `<div class="bx"><div class="row"><h3 class="g">${esc(s)}</h3><span class="chip">${t}</span><button class="btn2" data-act="open" data-k="${esc(k)}" ${S.q[k]?'':'disabled'}>Abrir</button></div></div>`}).join('');
    h+=`<div class="bx"><h2>Dúvida anônima</h2>${stu.sent?'<p class="mut">Dúvida enviada. Ninguém vê quem mandou.</p>':`<div class="row">${sel('dsub',ss.map(s=>[s,s]),ss[0],'Disciplina')}</div><textarea id="doubt" aria-label="Sua dúvida" placeholder="Escreva sua dúvida sem se identificar…"></textarea><button class="btn2" data-act="doubt">Enviar</button>`}</div>`;
    return h;
  }
  const k=stu.o,d=st();
  h+=`<div class="row"><button class="btn2" data-act="back">← Disciplinas</button><h2>${esc(k.split('|')[1])}</h2></div>`;
  if(!d.res)h+=d.run?playHTML(d):introHTML();
  else{
    if(d.run)h+=sumHTML(d.run);
    h+=`<div class="bx"><h2>Seu resultado</h2>${Object.entries(d.res).map(([sk,[a,b]])=>{const ok=a/b>=.7;return `<div class="row"><p class="g">${esc(sk)}</p><span class="chip">${a}/${b} · ${ok?'dominada':'precisa de reforço'}</span>${ok?'':`<button class="btn2" data-act="ref" data-k="${esc(sk)}" ${off}>Reforço</button>`}</div>`}).join('')}</div>`;
    const R=d.ref;
    if(R)h+=`<div class="bx"><h2>Reforço: ${esc(R.skill)}</h2><p>${esc(R.text)}</p></div>${quizHTML(R.qs,R.ans,'r',R.done!==null)}`+(R.done===null?`<button class="btn" data-act="chk">Verificar o que aprendi</button>`:`<div class="bx"><h3>Nova avaliação: ${R.done}/${R.qs.length}</h3><p class="mut">${R.done/R.qs.length>=.7?'Domínio alcançado! Revisões opcionais seguem disponíveis.':'Quase lá! Gere outro reforço quando quiser.'}</p></div>`);
  }
  return h;
}
const KS=()=>[...new Set(S.v.map(x=>x.c+'|'+x.s))];
function stats(k){
  const a=agg(k),size=SIZE[k.split('|')[0]]||30,ser=[...(HIST[k]||[]),...(a.p==null?[]:[a.p])],part=Math.min(100,Math.round(a.n/size*100));
  const collab=S.res.filter(r=>r.k===k&&!r.q&&!r.seed).length+S.doubts.filter(d=>d.k===k).length;
  const evo=a.p!=null&&PREV[k]!=null?a.p-PREV[k]:null,hid=a.n<5,al=[],L=ser.length;
  if(!S.q[k]&&a.n===0)al.push('questionário não aplicado');
  if(!hid){if(L>=3&&ser[L-1]<ser[L-2]&&ser[L-2]<ser[L-3])al.push('queda por 2 semanas seguidas');if(part<50)al.push('participação abaixo de 50%');if(a.p!=null&&a.p<50)al.push('domínio abaixo de 50%')}
  return{k,...a,size,ser,part,collab,evo,hid,al};
}
function dl(name,text){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/csv;charset=utf-8'}));a.download=name;document.body.appendChild(a);a.click();a.remove()}
function exportCsv(){
  const rows=KS().map(stats).map(x=>[kn(x.k).replace(' · ',','),x.hid?'oculta':x.p+'%',x.hid||x.evo==null?'':x.evo,x.part+'%',x.n]);
  dl('resultados-agregados.csv','Turma,Disciplina,Dominio,Evolucao (pp),Participacao,Respondentes\n'+rows.map(r=>r.join(',')).join('\n'));
}
function impFile(f){
  const rd=new FileReader();
  rd.onload=()=>{let ok=0,bad=0;
    rd.result.split(/\r?\n/).slice(1).forEach(l=>{
      if(!l.trim())return;const[c1,c2,c3]=l.split(/[;,]/).map(x=>(x||'').trim());
      const u=U.find(x=>x.r==='prof'&&(x.id.toLowerCase()===c1.toLowerCase()||x.name.toLowerCase()===c1.toLowerCase()));
      const c=Object.keys(CL).find(x=>x.toLowerCase()===c2.toLowerCase()||CL[x].n.toLowerCase()===c2.toLowerCase());
      if(!u||!c||!c3||S.v.some(v=>v.p===u.id&&v.c===c&&v.s===c3)){bad++;return}
      S.v.push({id:S.nid++,p:u.id,c,s:c3});ok++;
    });
    S.msg=`${ok} vínculo(s) importado(s), ${bad} linha(s) ignorada(s).`;save();render();
  };
  rd.readAsText(f);
}
function genRes(){
  run('Escrevendo o resumo…',async()=>{
    const data=KS().map(stats).filter(x=>!x.hid).map(x=>`${kn(x.k)}: domínio ${x.p}%, evolução ${x.evo==null?'n/d':x.evo+' pp'}, participação ${x.part}%${x.al.length?', alertas: '+x.al.join('; '):''}`).join('\n');
    const o=await ai(`Você apoia a coordenação pedagógica de uma escola pública brasileira. Com os dados agregados abaixo (sem nomes de alunos), escreva um resumo semanal de até 130 palavras, em português claro: 2 destaques (positivos ou de atenção) e 2 sugestões práticas de ação em sala. Não invente dados. ${fmt} Formato: {"resumo":"texto"}\n${data}`);
    if(!o.resumo)throw new Error('Resposta da IA fora do formato. Tente de novo.');
    S.resumo=String(o.resumo);S.resumoOk=false;save();
  });
}
function chartHTML(sel,all){
  const avg=l=>Array.from({length:8},(_,i)=>{const v=l.map(x=>x.ser[i]).filter(y=>y!=null);return v.length?Math.round(v.reduce((m,y)=>m+y,0)/v.length):null});
  const pts=a=>a.map((v,i)=>v==null?null:`${60+i*76},${180-v*1.6}`).filter(Boolean).join(' ');
  const a=avg(sel),b=avg(all);
  return `<svg viewBox="0 0 640 205" width="100%" height="205" role="img" aria-label="Gráfico de linha do domínio médio por semana, da semana 5 à 12, comparando a seleção com a média da escola"><g stroke="#E4E0D4"><line x1="40" y1="20" x2="630" y2="20"/><line x1="40" y1="100" x2="630" y2="100"/><line x1="40" y1="180" x2="630" y2="180"/></g><g fill="#5A6577" font-size="12"><text x="6" y="24">100%</text><text x="12" y="104">50%</text><text x="22" y="184">0%</text>${[5,6,7,8,9,10,11,12].map((w,i)=>`<text x="${52+i*76}" y="199">S${w}</text>`).join('')}</g><polyline fill="none" stroke="#5A6577" stroke-width="2" stroke-dasharray="6 5" points="${pts(b)}"/><polyline fill="none" stroke="#1F3A5F" stroke-width="3" points="${pts(a)}"/></svg>`;
}
function cadHTML(){
  const profs=U.filter(u=>u.r==='prof');
  return `<div class="bx"><h2>Importar planilha de vínculos</h2><p class="mut">Arquivo .csv com as colunas professor, turma e disciplina (código ou nome do professor; código da turma, como 7B).</p><div class="row"><label id="drop" class="ph" style="cursor:pointer">Arraste aqui a planilha de vínculos (.csv) ou clique para escolher<input type="file" id="imp" accept=".csv,text/csv" style="position:absolute;opacity:0;width:1px;height:1px"></label><div class="row"><button class="btn2" data-act="tpl">Baixar modelo</button></div>${S.msg?`<p class="chip" style="align-self:flex-start">${esc(S.msg)}</p>`:''}</div>
<div class="bx"><h2>Vínculos: professor × turma × disciplina</h2><p class="mut">O professor só enxerga o que for vinculado aqui.</p><div class="row">${sel('np',profs.map(p=>[p.id,p.name]),profs[0].id,'Professor')}${sel('nc',Object.keys(CL).map(c=>[c,CL[c].n]),'7B','Turma')}${sel('ns',DISC.map(x=>[x,x]),DISC[0],'Disciplina')}<button class="btn" data-act="addv">Adicionar</button></div>${S.v.map(x=>`<div class="row"><p class="g">${esc(pname(x.p))} · ${esc(kn(x.c+'|'+x.s))}</p><button class="btn2" data-act="delv" data-i="${x.id}" aria-label="Remover vínculo">Remover</button></div>`).join('')}</div>
<div class="bx"><h2>Níveis de acesso</h2><div class="row"><p class="g">Direção (DIR01)</p><span class="chip">Todos os resultados e cadastro</span></div><div class="row"><p class="g">Coordenação (COORD)</p><span class="chip">Todos os resultados e cadastro</span></div><div class="row"><p class="g">Secretaria (SEC01)</p><span class="chip">Cadastro, sem resultados</span></div></div>`;
}
const shell=(nav,c)=>`<div class="app">${nav}<div class="m">${c}</div></div>`;
const RST='<button class="btn2" data-act="reset" style="align-self:flex-start">Zerar dados de teste</button>';
const stat=()=>(busy?`<p class="chip" style="align-self:flex-start">${esc(busy)}</p>`:'')+(err?`<p class="err">${esc(err)}</p>`:'')+(me&&!hasApi()?`<p class="mut">A IA não está configurada: defina API_URL no código.</p>`:'');
function navHTML(title,items,cur,key){return `<nav class="sb"><b>${title}</b>${items.map(([k,t])=>`<button class="n ${cur===k?'on':''}" data-act="nav" data-w="${key}" data-k="${k}">${t}</button>`).join('')}<span class="g"></span><p class="mut">${esc(me.name)}</p><button class="btn2" data-act="out">Sair</button></nav>`}
function coordView(){
  const items=me.lvl==='sec'?[['cad','Cadastro']]:[['geral','Visão geral'],['hist','Histórico'],['rank','Ranking'],['res','Resumo semanal'],['cad','Cadastro']];
  if(!items.some(i=>i[0]===cv))cv=items[0][0];
  const nav=navHTML(me.lvl==='sec'?'Secretaria':'Coordenação',items,cv,'c');
  if(cv==='cad')return shell(nav,stat()+(me.lvl==='sec'?'<p class="mut">Acesso da secretaria: cadastro, sem resultados de alunos.</p>':'<h1>Cadastro e acessos</h1>')+cadHTML()+RST);
  if(cv==='res')return shell(nav,stat()+`<div class="row"><h1 class="g">Resumo semanal</h1><span class="chip">${S.resumoOk?'Aprovado':'Rascunho da IA · revise antes de usar'}</span></div><div class="bx"><h2>Texto do resumo</h2><textarea id="resumo" aria-label="Resumo semanal" placeholder="Gere o resumo com a IA e edite antes de aprovar.">${esc(S.resumo||'')}</textarea></div><div class="bx"><h2>Dados usados</h2><div class="row"><span class="chip">Participação</span><span class="chip">Domínio</span><span class="chip">Evolução</span><span class="chip">Sem nomes de alunos</span></div></div><div class="row"><button class="btn2" data-act="gres" ${busy?'disabled':''}>${S.resumo?'Regerar':'Gerar com IA'}</button><span class="g"></span><button class="btn2" data-act="csv">Exportar planilha</button><button class="btn2" data-act="prt">Exportar PDF</button><button class="btn" data-act="aprov" ${S.resumo?'':'disabled'}>Aprovar resumo</button></div><p class="mut">Em Exportar PDF, escolha "Salvar como PDF".</p>`);
  const ALL=KS().map(stats),L=ALL.filter(x=>{const[c,s]=x.k.split('|');return(!cf.se||CL[c].se===cf.se)&&(!cf.c||c===cf.c)&&(!cf.s||s===cf.s)});
  const V=L.filter(x=>!x.hid),W=V.filter(x=>x.p!=null);
  const ses=[...new Set(Object.values(CL).map(x=>x.se))],all=['','Todas'];
  const fh=`<div class="row">${sel('fse',[all,...ses.map(x=>[x,x])],cf.se,'Série')}${sel('fcc',[all,...Object.keys(CL).map(c=>[c,CL[c].n])],cf.c,'Turma')}${sel('fcs',[all,...DISC.map(x=>[x,x])],cf.s,'Disciplina')}</div>`;
  let h=stat();
  if(cv==='geral'){
    const avg=W.length?Math.round(W.reduce((m,x)=>m+x.p,0)/W.length)+'%':'—';
    const tn=L.reduce((m,x)=>m+x.n,0),ts=L.reduce((m,x)=>m+x.size,0),part=ts?Math.min(100,Math.round(tn/ts*100)):0;
    const alerts=[];L.forEach(x=>x.al.forEach(a=>alerts.push([x.k,a])));
    h+=`<div class="row"><h1 class="g">Visão geral</h1><button class="btn2" data-act="csv">Exportar</button></div>${fh}<div class="row"><div class="bx g"><p class="mut">Participação</p><p class="kpi">${part}%</p><p class="mut">${tn} de ${ts} alunos</p></div><div class="bx g"><p class="mut">Domínio médio</p><p class="kpi">${avg}</p></div><div class="bx g"><p class="mut">Turmas em alerta</p><p class="kpi">${new Set(alerts.map(a=>a[0])).size}</p></div></div>`;
    h+=`<div class="bx"><h2>Participação por professor</h2>${S.v.filter(v=>L.some(x=>x.k===v.c+'|'+v.s)).map(v=>{const x=L.find(y=>y.k===v.c+'|'+v.s);return `<div class="row"><p class="g">${esc(pname(v.p))} · ${esc(kn(x.k))}</p><div class="bar"><i style="width:${x.part}%"></i></div><span class="chip">${x.n?x.part+'% · '+x.n+'/'+x.size:'Não aplicou'}</span></div>`}).join('')||'<p class="mut">Nada neste filtro.</p>'}</div>`;
    h+=`<div class="bx"><h2>Alertas</h2>${alerts.length?alerts.map(([k,a])=>`<div class="row"><p class="g">${esc(kn(k))}: ${esc(a)}</p><span class="chip">Atenção</span></div>`).join(''):'<p class="mut">Nenhum alerta neste filtro.</p>'}</div>`;
  }else if(cv==='hist'){
    const vr=[];V.forEach(x=>Object.entries(x.a).forEach(([sk,[a,b]])=>{const pv0=(SKPREV[x.k]||{})[sk];if(pv0!=null&&b)vr.push({k:x.k,sk,d:Math.round(a/b*100)-pv0})}));
    h+=`<h1>Histórico de evolução</h1>${fh}<div class="bx"><div class="row"><h2 class="g">Domínio médio por semana</h2><span class="chip">Seleção atual</span><span class="chip">Média da escola (tracejado)</span></div>${V.length?chartHTML(V,ALL.filter(x=>!x.hid)):'<p class="mut">Sem dados suficientes neste filtro.</p>'}</div><div class="bx"><h2>Variação por habilidade</h2>${vr.length?vr.map(x=>`<div class="row"><p class="g">${esc(x.sk)} <span class="mut">· ${esc(kn(x.k))}</span></p><span class="chip">${x.d>=0?'+':''}${x.d} pp</span></div>`).join(''):'<p class="mut">Sem dados neste filtro.</p>'}</div>`;
  }else{
    const rk=[...L].sort((a,b)=>(a.hid-b.hid)||((b.evo==null)-(a.evo==null))||b.evo-a.evo);
    h+=`<h1>Ranking de evolução</h1><p class="mut">Mede evolução, não a qualidade do professor. Turmas com menos de 5 respondentes ficam ocultas.</p>${fh}<div class="bx"><div class="rk mut"><span>#</span><span>Turma · disciplina</span><span>Evolução</span><span>Participação</span><span>Colaboração</span></div>${rk.length?rk.map((x,i)=>`<div class="rk"><b>${x.hid?'-':i+1}</b><span>${esc(kn(x.k))}</span><span class="chip" style="justify-self:start">${x.hid?'Oculta':x.evo==null?'sem dados':(x.evo>=0?'+':'')+x.evo+' pp'}</span><span>${x.hid?x.n+' respondentes':x.part+'%'}</span><span class="mut">${x.hid?'dados insuficientes':x.collab+' ação(ões)'}</span></div>`).join(''):'<p class="mut">Nada neste filtro.</p>'}</div><div class="bx"><h2>Colaboração</h2><p class="mut">Soma de reforços concluídos e dúvidas enviadas pela turma.</p></div>`;
  }
  return shell(nav,h);
}
function render(){
  const off=busy?'disabled':'',keep={};
  document.querySelectorAll('#plan,#doubt,#dsub,#np,#nc,#ns,#resumo').forEach(e=>keep[e.id]=e.value);
  let h='';
  if(!me)h=loginView()+stat();
  else if(me.r==='alu')h=`<div class="row"><div class="g"><h1>Plataforma Educacional</h1><p class="mut">${esc(me.name)} · Aluno</p></div><button class="btn2" data-act="out">Sair</button></div>`+stat()+aluView(off);
  else h=me.r==='prof'?profView(off):coordView();
  $('#app').innerHTML=h;
  Object.entries(keep).forEach(([k,v])=>{const e=document.getElementById(k);if(e)e.value=v});
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,k=pf.c+'|'+pf.s;
  if(a==='role'){lrole=b.dataset.k;err='';render()}
  else if(a==='login')login();
  else if(a==='out'){me=null;stu={D:{}};err='';render()}
  else if(a==='gen')genQuiz(k);
  else if(a==='del'){S.d[k].splice(+b.dataset.i,1);save();render()}
  else if(a==='ok'){S.q[k]=S.d[k];delete S.d[k];save();render()}
  else if(a==='open'){stu.o=b.dataset.k;render()}
  else if(a==='back'){stu.o=null;render()}
  else if(a==='nav'){if(b.dataset.w==='p')pv=b.dataset.k;else cv=b.dataset.k;err='';render()}
  else if(a==='gres')genRes();
  else if(a==='aprov'){S.resumoOk=true;save();render()}
  else if(a==='prt')window.print();
  else if(a==='csv')exportCsv();
  else if(a==='tpl')dl('modelo-vinculos.csv','professor,turma,disciplina\nPROF01,7B,Matemática\n');
  else if(a==='rev')genReview(+b.dataset.i);
  else if(a==='rvx'){stu.rv=null;render()}
  else if(a==='sim'){S.rev.forEach(e=>{if(e.sid===me.id)e.due-=864e5});save();render()}
  else if(a==='start')startRun();
  else if(a==='check')checkAns();
  else if(a==='next')nextQ();
  else if(a==='retryv')genVariants();
  else if(a==='skip')finish();
  else if(a==='ref')genRef(b.dataset.k);
  else if(a==='chk')checkRef();
  else if(a==='doubt')sendDoubt();
  else if(a==='addv')addLink();
  else if(a==='stu'){pf.stu=pf.stu===b.dataset.i?null:b.dataset.i;render()}
  else if(a==='delv'){S.v=S.v.filter(x=>x.id!==+b.dataset.i);save();render()}
  else if(a==='reset'){S=fresh();save();render()}
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.id==='imp'){if(t.files[0])impFile(t.files[0])}
  else if(t.id==='pdfin'){if(t.files.length)addPdfs(t.files);t.value=''}
  else if(t.id==='resumo'){S.resumo=t.value;S.resumoOk=false;save()}
  else if(t.id==='fc'){pf.c=t.value;pf.s='';pf.stu=null;render()}
  else if(t.id==='fs'){pf.s=t.value;pf.stu=null;render()}
  else if(t.id==='fse'){cf.se=t.value;render()}
  else if(t.id==='fcc'){cf.c=t.value;render()}
  else if(t.id==='fcs'){cf.s=t.value;render()}
  else if(t.type==='radio'){const i=+t.dataset.i,j=+t.dataset.j,d=st();if(t.dataset.p==='d'){d.run.sel=j;render()}else if(d.ref)d.ref.ans[i]=j}
});
document.addEventListener('dragover',e=>{e.preventDefault()});
document.addEventListener('drop',e=>{
  e.preventDefault();const z=e.target.closest&&e.target.closest('#drop,#pdfdrop');if(!z)return;
  if(z.id==='drop'){const f=e.dataTransfer.files[0];if(f)impFile(f)}else if(e.dataTransfer.files.length)addPdfs(e.dataTransfer.files);
});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&!me&&e.target.id==='lpin')login()});
render();
