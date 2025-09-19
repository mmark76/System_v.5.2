/* =========================
   Markellos CMS v5.2 — Core Script (Associations fix)
   ========================= */

let libs = null;
let gameMoves = [];
let selectedLang = 'el';

/* ---------- UI helpers ---------- */
function sideGR(side){ return side==='White' ? 'Λευκό' : 'Μαύρο'; }
const PIECE_GREEK = {P:'Στρατιώτης', N:'Ίππος', B:'Αξιωματικός', R:'Πύργος', Q:'Βασίλισσα', K:'Βασιλιάς'};
function pieceGreek(letter){ return PIECE_GREEK[letter] || letter; }
function escapeHtml(s){ return String(s==null?'':s).replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

/* ---------- mappings ---------- */
const PIECE_TO_P = {P:1, N:2, B:3, R:4, Q:5, K:6};
const FILE_TO_NUM = {a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8};

/* ---------- Libraries accessors ---------- */
function t1Label(idx){
  const node = libs?.Temporal?.LibraryT1?.[String(idx)];
  if(!node) return '';
  return (node[selectedLang] || node.el || node.en || '');
}
function t2Label(idx){
  const node = libs?.Temporal?.LibraryT2?.[String(idx)];
  if(!node) return '';
  return (node[selectedLang] || node.el || node.en || '');
}
function s1Square(square){
  const node = libs?.Spatial?.LibraryS1?.[square];
  if(!node) return '';
  return (node[selectedLang] || node.el || node.en || '');
}
function p1PAO(d){
  const P = String(d.P-1), A = String(d.F-1), O = String(d.R-1);
  const lib = libs?.["PAO 0-9"]?.LibraryP1;
  if(!lib) return {person:'',action:'',object:''};
  const person = lib?.Persons?.[P]?.[selectedLang] || lib?.Persons?.[P]?.el || '';
  const action = lib?.Actions?.[A]?.[selectedLang] || lib?.Actions?.[A]?.el || '';
  const object = lib?.Objects?.[O]?.[selectedLang] || lib?.Objects?.[O]?.el || '';
  return {person, action, object};
}
function p2p3Get(idx2, collection){
  const lib = libs?.["PAO 00-99"]?.[collection];
  if(!lib) return {person:'',action:'',object:''};
  const node = lib?.[idx2];
  if(!node) return {person:'',action:'',object:''};
  return {person: node.person||'', action: node.action||'', object: node.object||''};
}
function v1Verse(pieceLetter, file, rank, side, moveNo){
  const V = libs?.Verses?.LibraryV1;
  if(!V) return {piece:'',file:'',rank:'',closing:''};
  const piece = V.Pieces?.[pieceLetter]?.[selectedLang] || V.Pieces?.[pieceLetter]?.el || '';
  const fileTxt = V.Files?.[file]?.[selectedLang] || V.Files?.[file]?.el || '';
  const rankTxt = V.Ranks?.[String(rank)]?.[selectedLang] || V.Ranks?.[String(rank)]?.el || '';
  const closings = (side==='White' ? V.Closings?.White : V.Closings?.Black) || [];
  const idx = ((moveNo-1) % Math.max(1, closings.length));
  const closing = closings[idx]?.[selectedLang] || closings[idx]?.el || '';
  return {piece, file:fileTxt, rank:rankTxt, closing};
}

/* ---------- Locus / Anchor ---------- */
function locusForMovePair(n){ const label = t1Label(n); return label?`${n} — ${label}`:''; }
function anchorForMovePair(n){
  const label = t2Label(n);
  const fallback = `Αγκύρα ${Math.ceil(n/7)}`;
  return `${n} — ${label || fallback}`;
}

/* ---------- PGN parsing ---------- */
function parsePGN(pgn){
  const chess = new Chess();
  chess.load_pgn(pgn, { sloppy: true });
  const hist = chess.history({ verbose:true });
  const tmp = new Chess();
  let out=[];
  hist.forEach((mv,i)=>{
    tmp.move(mv);
    const fen = tmp.fen();
    const side = (i%2===0)?'White':'Black';
    const moveNumber = Math.floor(i/2)+1;
    const moveNumDisplay = (side==='White')?`${moveNumber}.`:`${moveNumber}...`;
    const pieceLetter = mv.piece ? mv.piece.toUpperCase() : (mv.san[0]?.toUpperCase()||'P');
    out.push({
      index:i, moveNumber, moveNumDisplay, movePair:moveNumber,
      side, san:mv.san, piece:pieceLetter, from:mv.from, to:mv.to, fen,
      flags: mv.flags || '', promotion: mv.promotion || null
    });
  });
  return out;
}

/* ---------- SAN TABLE ---------- */
function fillSanTable(moves){
  const body = document.getElementById('sanBody'); if(!body) return;
  body.innerHTML='';
  moves.forEach(m=>{
    const locus  = (m.side==='White') ? locusForMovePair(m.movePair) : '';
    const anchor = (m.movePair % 7 === 0) ? anchorForMovePair(m.movePair) : '';
	const pieceDisplay = `${m.piece} — ${pieceGreek(m.piece)}`;
    const tr=document.createElement('tr'); tr.dataset.index=m.index;
    tr.innerHTML =
      `<td>${escapeHtml(m.moveNumDisplay)}</td>`+
      `<td>${escapeHtml(m.san)}</td>`+
      `<td>${escapeHtml(locus)}</td>`+
      `<td>${escapeHtml(anchor)}</td>`+
      `<td>${escapeHtml(sideGR(m.side))}</td>`+
      `<td>${escapeHtml(pieceDisplay)}</td>`+
      `<td>${escapeHtml(m.to)}</td>`+
      `<td>${escapeHtml(m.fen)}</td>`;
    body.appendChild(tr);
  });
}

/* ---------- ASSOCIATIONS TABLE (labels move with pieces) ---------- */
function fillAssociationsTable(moves){
  const body = document.getElementById('assocBody'); if(!body) return;
  body.innerHTML='';

  // Libraries used:
  const Lpieces = libs?.Characters?.LibraryC2 || {};     // "Pa2", "Ng1", "R", "a2" κ.λπ.
  const Ltarget = libs?.Spatial?.LibraryS1   || {};      // "a1".."h8"

  // Strategy: χτίζουμε mapping "τετράγωνο -> ετικέτα" σε ΟΛΕΣ τις κινήσεις (from→to),
  // ώστε οι ετικέτες να μετακινούνται με το κομμάτι. Έτσι το pieceAssoc δεν μένει κενό.
  const assocBySquare = Object.create(null);

  // Βρες περιγραφή κομματιού: προτεραιότητα "P+a2" > "a2" > "P" > όνομα κομματιού στα ελληνικά
  const getAssocFor = (pieceLetter, fromSq) =>
    (Lpieces[`${pieceLetter}${fromSq||''}`] || Lpieces[fromSq||''] || Lpieces[pieceLetter] || pieceGreek(pieceLetter));

  moves.forEach(m=>{
    // locus/anchor
    const locus  = (m.side==='White') ? locusForMovePair(m.movePair) : '';
    const anchor = (m.movePair % 7 === 0) ? anchorForMovePair(m.movePair) : '';

    // πάρε την «τρέχουσα» ετικέτα από το FROM ή φτιάξε την αρχική από το library
    let pieceAssoc = assocBySquare[m.from] || getAssocFor(m.piece, m.from);

    // αφαίρεσε ό,τι υπήρχε στο FROM
    if(m.from) delete assocBySquare[m.from];

    // ειδικοί κανόνες

    // 1) Ροκέ: κούνα και την ετικέτα του πύργου στα σωστά τετράγωνα
    const sanClean = (m.san||'').replace(/[+#?!]+/g,'');
    if(sanClean.startsWith('O-O')){ // O-O ή O-O-O
      const long = sanClean.startsWith('O-O-O');
      const white = (m.side==='White');
      const rookFrom = white ? (long ? 'a1':'h1') : (long ? 'a8':'h8');
      const rookTo   = white ? (long ? 'd1':'f1') : (long ? 'd8':'f8');
      if(assocBySquare[rookFrom]){
        assocBySquare[rookTo] = assocBySquare[rookFrom];
        delete assocBySquare[rookFrom];
      }else{
        // αν δεν υπήρχε, φτιάξε από βιβλιοθήκη με βάση το αρχικό τετράγωνο του ρουκ
        assocBySquare[rookTo] = getAssocFor('R', rookFrom);
      }
    }

    // 2) En passant: αν η σημαία περιέχει 'e', η αιχμαλωτισμένη ετικέτα είναι πίσω από το "to"
    if((m.flags||'').includes('e') && /^[a-h][1-8]$/.test(m.to)){
      const toFile = m.to[0], toRank = parseInt(m.to[1],10);
      const capRank = (m.side==='White') ? (toRank-1) : (toRank+1);
      const capSq = `${toFile}${capRank}`;
      if(assocBySquare[capSq]) delete assocBySquare[capSq];
    }

    // 3) Προαγωγή: η ίδια ετικέτα συνεχίζει στο νέο τετράγωνο (η «ταυτότητα» του πιονιού κρατιέται)
    // Δεν χρειάζεται ειδικός χειρισμός εδώ — απλώς θα καθίσει στο to.

    // Κάθισε την ετικέτα στο TO (αντικαθιστά τυχόν ετικέτα αντιπάλου σε capture)
    assocBySquare[m.to] = pieceAssoc;

    const targetAssoc = Ltarget[m.to]
      ? ((Ltarget[m.to][selectedLang] || Ltarget[m.to].el || Ltarget[m.to].en) || m.to)
      : m.to;

    const tr=document.createElement('tr'); tr.dataset.index=m.index;
    tr.innerHTML =
      `<td>${escapeHtml(m.moveNumDisplay)}</td>`+
      `<td>${escapeHtml(m.san)}</td>`+
      `<td>${escapeHtml(locus)}</td>`+
      `<td>${escapeHtml(anchor)}</td>`+
      `<td>${escapeHtml(sideGR(m.side))}</td>`+
      `<td>${escapeHtml(pieceAssoc)}</td>`+
      `<td>${escapeHtml(targetAssoc)}</td>`;
    body.appendChild(tr);
  });
}

/* ---------- PAO 0–9 TABLE ---------- */
function toPFR(m){
  const P = PIECE_TO_P[m.piece] || 0;
  const F = FILE_TO_NUM[m.to?.[0]] || 0;
  const R = Number(m.to?.[1]||0);
  return {P,F,R};
}
function formatPFR(pfr){ return `${pfr.P}${pfr.F}${pfr.R}`; }

function fillPaoTable_0_9(moves){
  const body = document.getElementById('paoBody'); if(!body) return;
  body.innerHTML='';
  moves.forEach(m=>{
    const locus  = (m.side==='White') ? locusForMovePair(m.movePair) : '';
    const anchor = (m.movePair % 7 === 0) ? anchorForMovePair(m.movePair) : '';
    const pfr = toPFR(m);
    const code = formatPFR(pfr);
    const {person,action,object} = p1PAO(pfr);
    const tr=document.createElement('tr'); tr.dataset.index=m.index;
    tr.innerHTML =
      `<td>${escapeHtml(m.moveNumDisplay)}</td>`+
      `<td>${escapeHtml(m.san)}</td>`+
      `<td>${escapeHtml(locus)}</td>`+
      `<td>${escapeHtml(anchor)}</td>`+
      `<td>${escapeHtml(sideGR(m.side))}</td>`+
      `<td>${escapeHtml(`${code} (${m.san})`)}</td>`+
      `<td>${escapeHtml(`Κωδικός: ${code}`)}<br>`+
        `${escapeHtml('P: '+person)} | ${escapeHtml('A: '+action)} | ${escapeHtml('O: '+object)}</td>`;
    body.appendChild(tr);
  });
}

/* ---------- PAO 00–99 TABLE ---------- */
function weave6Digits(pfrW, pfrB){
  const a = `${pfrW.P}${pfrW.F}`;
  const b = `${pfrW.R}${pfrB.P}`;
  const c = `${pfrB.F}${pfrB.R}`;
  return {a,b,c,all:`${a}${b}${c}`};
}
function twoDigit(str){ return String(str).padStart(2,'0'); }

function fillPaoTable_00_99(moves){
  const body = document.getElementById('pao99Body'); if(!body) return;
  const collSel = document.getElementById('pao99CollectionSelect');
  const collection = (collSel && collSel.value) ? collSel.value : 'LibraryP2';
  body.innerHTML='';
  for(let i=0;i<moves.length;i+=2){
    const wm=moves[i], bm=moves[i+1]; if(!wm||!bm) break;
    const movePair=wm.movePair;
    const locus  = locusForMovePair(movePair);
    const anchor = (m.movePair % 7 === 0) ? anchorForMovePair(m.movePair) : '';
    const parts = weave6Digits(toPFR(wm), toPFR(bm));
    const P = p2p3Get(twoDigit(parts.a), collection).person;
    const A = p2p3Get(twoDigit(parts.b), collection).action;
    const O = p2p3Get(twoDigit(parts.c), collection).object;
    const tr=document.createElement('tr'); tr.dataset.index=wm.index;
    tr.innerHTML =
      `<td>${escapeHtml(`${movePair}.`)}</td>`+
      `<td>${escapeHtml(`${wm.san}  ${bm.san}`)}</td>`+
      `<td>${escapeHtml(locus)}</td>`+
      `<td>${escapeHtml(anchor)}</td>`+
      `<td>${escapeHtml('Πλήρης κίνηση')}</td>`+
      `<td>${escapeHtml(parts.all)}</td>`+
      `<td>${escapeHtml(`Person: ${P}`)}<br>`+
          `${escapeHtml(`Action: ${A}`)}<br>`+
          `${escapeHtml(`Object: ${O}`)}</td>`;
    body.appendChild(tr);
  }
}

/* ---------- VERSE TABLE ---------- */
function fillVerseTable(moves){
  const body = document.getElementById('verseBody'); if(!body) return;
  body.innerHTML='';
  moves.forEach(m=>{
    const locus  = (m.side==='White') ? locusForMovePair(m.movePair) : '';
    const anchor = (m.movePair % 7 === 0) ? anchorForMovePair(m.movePair) : '';
    const file = m.to?.[0]; const rank = Number(m.to?.[1]||0);
    const v = v1Verse(m.piece, file, rank, m.side, m.moveNumber);
    const tr=document.createElement('tr'); tr.dataset.index=m.index;
    tr.innerHTML =
      `<td>${escapeHtml(m.moveNumDisplay)}</td>`+
      `<td>${escapeHtml(m.san)}</td>`+
      `<td>${escapeHtml(locus)}</td>`+
      `<td>${escapeHtml(anchor)}</td>`+
      `<td>${escapeHtml(sideGR(m.side))}</td>`+
      `<td>${escapeHtml(`Piece: ${v.piece}`)}<br>`+
          `${escapeHtml(`File: ${v.file}`)}<br>`+
          `${escapeHtml(`Rank: ${v.rank}`)}<br>`+
          `${escapeHtml(`Closing: ${v.closing}`)}</td>`;
    body.appendChild(tr);
  });
}

/* ---------- Render All ---------- */
function renderAll(){
  fillSanTable(gameMoves);
  fillAssociationsTable(gameMoves);
  fillPaoTable_0_9(gameMoves);
  fillPaoTable_00_99(gameMoves);
  fillVerseTable(gameMoves);
}

/* ---------- CSV Export ---------- */
function downloadTableAsCSV(sectionId, filename){
  const section = document.getElementById(sectionId);
  if(!section){ alert('Δεν βρέθηκε ο πίνακας.'); return; }
  const table = section.querySelector('table');
  if(!table){ alert('Δεν βρέθηκε table.'); return; }
  let csv=[];
  for(const row of table.querySelectorAll('tr')){
    const cells=[...row.children].map(td=>{
      const raw=td.innerText.replace(/\r?\n/g,' ').trim();
      return `"${raw.replace(/"/g,'""')}"`;
    });
    if(cells.length) csv.push(cells.join(','));
  }
  const blob=new Blob([csv.join('\n')],{type:'text/csv;charset=utf-8;'});
  saveAs(blob, filename||'table.csv');
}

/* ---------- Table switcher ---------- */
function showOnlySection(idToShow){
  const ids=['sanSection','assocSection','paoSection','pao99Section','verseSection'];
  ids.forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.style.display = (id===idToShow)?'block':'none';
  });
}
function wireTableSelect(){
  const sel=document.getElementById('tableSelect');
  if(!sel) return;
  showOnlySection(sel.value || 'sanSection');
  sel.addEventListener('change', ()=> showOnlySection(sel.value));
}

/* ---------- Libraries viewer ---------- */
function buildLibrariesBar(){
  const host=document.getElementById('librariesBar'); if(!host) return;
  const cats=[
    {key:'Temporal',  title:'Temporal',  libs: libs?.Temporal},
    {key:'Characters',title:'Characters',libs: libs?.Characters},
    {key:'Spatial',   title:'Spatial',   libs: libs?.Spatial},
    {key:'PAO 0-9',   title:'PAO 0–9',   libs: libs?.['PAO 0-9']},
    {key:'PAO 00-99', title:'PAO 00–99', libs: libs?.['PAO 00-99']},
    {key:'Verses',    title:'Verses',    libs: libs?.Verses},
  ];
  host.innerHTML='';
  cats.forEach(cat=>{
    const names = Object.keys(cat.libs||{});
    if(!names.length) return;
    const wrap=document.createElement('div'); wrap.className='lib-group'; wrap.style.display='inline-block'; wrap.style.margin='0 8px';
    const btn=document.createElement('button'); btn.className='minimal-btn'; btn.textContent=cat.title+' ▼';
    const menu=document.createElement('div'); menu.className='lib-menu'; menu.style.display='none'; menu.style.position='absolute';
    menu.style.background='#111'; menu.style.border='1px solid #333'; menu.style.padding='6px';
    names.forEach(n=>{
      const a=document.createElement('a'); a.href='#'; a.textContent=n; a.style.display='block'; a.style.padding='4px 8px';
      a.addEventListener('click', ev=>{
        ev.preventDefault();
        const data = libs?.[cat.key]?.[n];
        const w = window.open('','_blank','width=700,height=700,noopener');
        if(w) w.document.write(`<pre style="white-space:pre-wrap;word-break:break-word;background:#0b0b0b;color:#ddd;padding:12px;margin:0;">${escapeHtml(JSON.stringify(data,null,2))}</pre>`);
      });
      menu.appendChild(a);
    });
    btn.addEventListener('click', ()=>{
      menu.style.display = (menu.style.display==='none') ? 'block' : 'none';
    });
    wrap.appendChild(btn); wrap.appendChild(menu); host.appendChild(wrap);
  });
  document.addEventListener('click', (e)=>{
    if(!host.contains(e.target)){
      host.querySelectorAll('.lib-menu').forEach(m=> m.style.display='none');
    }
  });
}

/* ---------- Init ---------- */
async function loadLibraries(){
  const res = await fetch('libraries_v3.2.json');
  libs = await res.json();
}
function wirePGN(){
  const ta = document.getElementById('pgnText');
  const fileInput = document.getElementById('pgnFileInput');
  const parseBtn = document.getElementById('parsePgnBtn');
  const clearBtn = document.getElementById('clearBtn');

  if(fileInput){
    fileInput.addEventListener('change', ev=>{
      const f = ev.target.files?.[0]; if(!f) return;
      const r = new FileReader();
      r.onload = ()=>{ 
        if(ta) ta.value = r.result; 
        gameMoves = parsePGN(r.result);
        renderAll();
      };
      r.readAsText(f);
    });
  }
  if(parseBtn){
    parseBtn.addEventListener('click', ()=>{
      const pgn = ta ? ta.value : '';
      gameMoves = parsePGN(pgn);
      renderAll();
    });
  }
  if(clearBtn){
    clearBtn.addEventListener('click', ()=>{
      if(ta) ta.value='';
      if(fileInput) fileInput.value='';
      gameMoves=[]; 
      renderAll();
    });
  }
}

document.addEventListener('DOMContentLoaded', async ()=>{
  const langSel = document.getElementById('langSelect');
  if(langSel){
    selectedLang = (langSel.value || 'el');
    langSel.addEventListener('change', ()=>{ selectedLang = langSel.value || 'el'; renderAll(); });
  }
  await loadLibraries();
  buildLibrariesBar();
  wirePGN();
  wireTableSelect();

  const ta=document.getElementById('pgnText');
  if(ta && ta.value.trim()){ gameMoves = parsePGN(ta.value); }
  renderAll();

  const fenBtn=document.getElementById('openFenBuilderBtn');
  if(fenBtn){ fenBtn.addEventListener('click', ()=> window.open('http://chess-api.online','_blank')); }

  // Κλειδώνουμε τα dropdowns ώστε να ταιριάζουν με τις βιβλιοθήκες του v3.2
  lockDropdown('sanLocusSelect','LibraryT1');
  lockDropdown('sanAnchorSelect','LibraryT2');
  lockDropdown('assocLocusSelect','LibraryT1');
  lockDropdown('assocAnchorSelect','LibraryT2');
  lockDropdown('assocCharactersSelect','LibraryC2');
  lockDropdown('assocTargetsSelect','LibraryS1');
  lockDropdown('paoLocusSelect','LibraryT1');
  lockDropdown('paoAnchorSelect','LibraryT2');
  lockDropdown('paoCodesSelect','LibraryP1');
  lockDropdown('pao99LocusSelect','LibraryT1');
  lockDropdown('pao99AnchorSelect','LibraryT2');
  lockDropdown('verseLocusSelect','LibraryT1');
  lockDropdown('verseAnchorSelect','LibraryT2');
  lockDropdown('verseLibrarySelect','LibraryV1');
});

/* ---------- Fixed dropdown locker ---------- */
function lockDropdown(id, value){
  const el=document.getElementById(id); if(!el) return;
  el.innerHTML = `<option>${value}</option>`;
  el.value=value; el.disabled=true;
}
