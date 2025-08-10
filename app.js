const el = (q, root=document) => root.querySelector(q);
const els = (q, root=document) => [...root.querySelectorAll(q)];

const structureSel = el('#structure');
const valuesInput = el('#values');
const btnLoad = el('#btn-load');
const btnAdd = el('#btn-add');
const btnRemove = el('#btn-remove');
const btnClear = el('#btn-clear');
const algoSel = el('#algo');
const targetInput = el('#target');
const btnRun = el('#btn-run');
const btnStop = el('#btn-stop');
const btnStep = el('#btn-step');
const btnReset = el('#btn-reset');
const viz = el('#viz');
const zoomContainer = el('#zoom');
const vizWrapper = el('#vizWrapper');
const status = el('#status');
const speedSlider = el('#speed');
const speedLabel = el('#speedLabel');
const zoomInBtn = el('#zoomIn');
const zoomOutBtn = el('#zoomOut');
const zoomResetBtn = el('#zoomReset');

let data = [];
let displayData = null; // optional temp view for certain algorithms
let tree = null; // level-order array based tree
let stepping = false;
let playing = false;
let currentIterator = null;
let visitedSet = new Set();
let target = null;
let zoomLevel = 1; // 0.5–2

const parseValues = (str) => str.split(/[\s,]+/).map(s=>s.trim()).filter(Boolean).map(v=>isNaN(+v)?v:+v);

const setStatus = (text) => status.textContent = text;

function render() {
  viz.innerHTML = '';
  visitedSet.clear();
  const type = structureSel.value;
  const src = displayData ?? data;
  if (type === 'Stack') return renderStack(src);
  if (type === 'Queue') return renderQueue(src);
  if (type === 'Linked List') return renderList(src);
  if(!tree || displayData) tree = buildTreeFromArray(src);
  return renderTree();
}

function nodeEl(value){
  const n = document.createElement('div');
  n.className = 'node';
  n.textContent = value;
  return n;
}

// ===== Stack =====
function renderStack(arr){
  const wrap = document.createElement('div');
  wrap.className = 'stack';
  (arr||[]).slice().forEach(v=>wrap.appendChild(nodeEl(v)));
  viz.appendChild(wrap);
}

// ===== Queue =====
function renderQueue(arr){
  const wrap = document.createElement('div');
  wrap.className = 'queue';
  (arr||[]).forEach(v=>wrap.appendChild(nodeEl(v)));
  viz.appendChild(wrap);
}

// ===== Linked List =====
function renderList(arr){
  const wrap = document.createElement('div');
  wrap.className = 'list';
  (arr||[]).forEach((v,i)=>{
    const cell = nodeEl(v); cell.style.setProperty('--c','#9aa8ff');
    wrap.appendChild(cell);
    if(i !== (arr?.length||0)-1){
      const p = document.createElement('div'); p.className='pointer'; wrap.appendChild(p);
    }
  });
  viz.appendChild(wrap);
}

// ===== Binary Tree (level-order array) =====
function buildTreeFromArray(arr){
  return arr.slice();
}

function layoutTree(arr){
  const canvas = document.createElement('div');
  canvas.className = 'tree-canvas';
  const depth = Math.floor(Math.log2(arr.length)) + 1;
  const widthPerLeaf = 80;
  const totalLeaves = Math.max(1, 1 << (depth-1));
  const totalWidth = Math.max(600, totalLeaves * widthPerLeaf);
  canvas.style.minWidth = totalWidth + 120 + 'px';

  const pos = new Map();
  const place = (idx, x1, x2, y)=>{
    if(idx >= arr.length || arr[idx]===null || arr[idx]===undefined) return;
    const x = (x1+x2)/2;
    pos.set(idx,{x,y});
    const left = 2*idx+1, right = 2*idx+2;
    place(left, x1, x, y+110);
    place(right, x, x2, y+110);
  };
  place(0, 40, totalWidth+40, 40);

  pos.forEach((p, idx)=>{
    const left = 2*idx+1, right = 2*idx+2;
    [left,right].forEach(ch=>{
      if(pos.has(ch)){
        const a = p, b = pos.get(ch);
        const dx = b.x - a.x, dy = b.y - a.y; const len = Math.hypot(dx,dy); const ang = Math.atan2(dy,dx)*180/Math.PI;
        const e = document.createElement('div');
        e.className='edge';
        e.style.left = a.x+24+ 'px';
        e.style.top = a.y+24 + 'px';
        e.style.width = len + 'px';
        e.style.transform = `rotate(${ang}deg)`;
        canvas.appendChild(e);
      }
    })
  });

  pos.forEach((p, idx)=>{
    const n = nodeEl(arr[idx]);
    n.classList.add('tree-node');
    n.style.left = (p.x)+'px';
    n.style.top = (p.y)+'px';
    n.dataset.index = idx;
    canvas.appendChild(n);
  });

  return canvas;
}

function renderTree(){
  if(!tree) tree = buildTreeFromArray(data);
  const canvas = layoutTree(tree);
  viz.appendChild(canvas);
}

// ===== Traversals =====
function *bfs(arr){
  const q=[0];
  const seen = new Set();
  while(q.length){
    const i=q.shift();
    if(i>=arr.length || arr[i]==null || seen.has(i)) continue;
    seen.add(i);
    yield i;
    q.push(2*i+1,2*i+2);
  }
}
function *dfsPre(arr, i=0){ if(i>=arr.length || arr[i]==null) return; yield i; yield* dfsPre(arr,2*i+1); yield* dfsPre(arr,2*i+2); }
function *dfsIn(arr, i=0){ if(i>=arr.length || arr[i]==null) return; yield* dfsIn(arr,2*i+1); yield i; yield* dfsIn(arr,2*i+2); }
function *dfsPost(arr, i=0){ if(i>=arr.length || arr[i]==null) return; yield* dfsPost(arr,2*i+1); yield* dfsPost(arr,2*i+2); yield i; }

function highlight(idx){ const n = el(`.tree-node[data-index="${idx}"]`); if(n){ n.classList.add('visited'); } }
function markTarget(idx){ const n = el(`.tree-node[data-index="${idx}"]`); if(n){ n.classList.add('target'); } }
function clearHighlights(){ els('.node').forEach(n=>n.classList.remove('visited','target')); }
function highlightLinear(i){ const nodes = els('#viz .node'); const n = nodes[i]; if(n) n.classList.add('visited'); }

// ===== Controls =====
btnLoad.addEventListener('click', ()=>{
  const vals = parseValues(valuesInput.value);
  data = vals; displayData=null;
  if(structureSel.value === 'Binary Tree'){ tree = buildTreeFromArray(vals); }
  setStatus('Loaded ' + vals.length + ' value' + (vals.length!==1?'s':''));
  render();
});

btnAdd.addEventListener('click', ()=>{
  const [v] = parseValues(valuesInput.value);
  if(v===undefined) return;
  displayData=null;
  if(structureSel.value==='Stack') data.push(v);
  else if(structureSel.value==='Queue' || structureSel.value==='Linked List') data.push(v);
  else { if(!tree) tree=[]; tree.push(v); data = tree.slice(); tree=data; }
  render();
});

btnRemove.addEventListener('click', ()=>{
  displayData=null;
  if(structureSel.value==='Stack') data.pop();
  else if(structureSel.value==='Queue' || structureSel.value==='Linked List') data.shift();
  else { if(tree && tree.length) tree.pop(); data = tree.slice(); }
  render();
});

btnClear.addEventListener('click', ()=>{ data=[]; tree=null; displayData=null; render(); setStatus('Cleared'); });

structureSel.addEventListener('change', ()=>{ clearHighlights(); displayData=null; setStatus('Ready'); render(); });

btnReset.addEventListener('click', ()=>{ stepping=false; playing=false; clearHighlights(); setStatus('Reset'); });

speedSlider.addEventListener('input', ()=>{ speedLabel.textContent = speedSlider.value + '×'; });

function getAlgo(){
  const a = algoSel.value;
  if(a==='bfs') return bfs;
  if(a==='dfs-pre') return dfsPre;
  if(a==='dfs-in') return dfsIn;
  if(a==='dfs-post') return dfsPost;
  if(a==='lin') return null;
  if(a==='bin') return null;
  return bfs;
}

function ensureTree(){
  if(structureSel.value!=='Binary Tree'){
    setStatus('Traversal runs on Binary Tree. Switching.');
    structureSel.value = 'Binary Tree';
    tree = buildTreeFromArray(displayData ?? (data.length?data:parseValues(valuesInput.value)));
    render();
  }
}

function *runner(){
  const mode = algoSel.value;
  target = targetInput.value.trim();
  const numericTarget = target!=='' && !isNaN(+target) ? +target : (target||null);

  if(mode==='lin' || mode==='bin'){
    let arr = (displayData ?? data).slice();
    if(mode==='bin'){
      arr = arr.slice().filter(v=>v!==null && v!==undefined);
      if(arr.some(v=>typeof v!=='number')){ setStatus('Binary Search needs numeric, sorted data.'); return; }
      arr.sort((a,b)=>a-b);
      displayData = arr.slice();
      if(structureSel.value==='Binary Tree') structureSel.value='Linked List';
      clearHighlights();
      render();
    }
    function* linear(){ for(let i=0;i<arr.length;i++){ yield i; } }
    function* binary(){ let lo=0, hi=arr.length-1; while(lo<=hi){ const mid=Math.floor((lo+hi)/2); yield mid; if(numericTarget==null) break; if(arr[mid]===numericTarget) return; if(arr[mid] < numericTarget) lo=mid+1; else hi=mid-1; } }
    const iter = mode==='lin' ? linear() : binary();
    for(const i of iter){
      highlightLinear(i);
      setStatus(`${mode==='lin'?'Linear':'Binary'} search visiting index ${i}${arr[i]!==undefined?` (value ${arr[i]})`:''}`);
      if(numericTarget!=null && arr[i]===numericTarget){ setStatus(`Found target ${numericTarget} at index ${i}`); playing=false; return; }
      if(stepping){ yield 'step'; }
      else { const delay = 700 / parseFloat(speedSlider.value); yield new Promise(r=>setTimeout(r, delay)); }
    }
    setStatus('Search complete');
    playing=false; stepping=false; return;
  }

  // Tree traversals
  ensureTree();
  const arr = tree || [];
  const algo = getAlgo();
  currentIterator = algo(arr);
  if(numericTarget!==null){ arr.forEach((v,i)=>{ if(v===numericTarget) markTarget(i); }); }
  for(const idx of currentIterator){
    highlight(idx);
    setStatus(`${algoSel.options[algoSel.selectedIndex].text} visiting index ${idx} (value ${arr[idx]})`);
    if(numericTarget!==null && arr[idx]===numericTarget){ setStatus(`Found target ${numericTarget} at index ${idx}`); playing=false; return; }
    if(stepping){ yield 'step'; }
    else { const delay = 700 / parseFloat(speedSlider.value); yield new Promise(r=>setTimeout(r, delay)); }
  }
  setStatus('Traversal complete');
  playing=false; stepping=false;
}

async function play(){ if(playing) return; playing=true; stepping=false; clearHighlights(); const gen = runner(); for(let n = gen.next(); !n.done; n = gen.next()){ if(!playing){ break; } if(n.value==='step'){ } else if(n.value instanceof Promise){ await n.value; } } playing=false; }

function prepareStep(){ if(currentIterator==null){ clearHighlights(); stepping=true; const mode=algoSel.value; if(mode==='lin' || mode==='bin'){ currentIterator = runner(); } else { ensureTree(); currentIterator = getAlgo()(tree||[]); } } }

btnRun.addEventListener('click', play);
btnStop.addEventListener('click', ()=>{ playing=false; stepping=false; setStatus('Stopped'); });

btnStep.addEventListener('click', ()=>{
  prepareStep();
  const n = currentIterator.next();
  if(!n.done){
    const idx = n.value;
    if(idx==='step') return;
    if(algoSel.value==='lin' || algoSel.value==='bin') highlightLinear(idx); else highlight(idx);
    if(tree && (algoSel.value!=='lin' && algoSel.value!=='bin')) setStatus(`Step → index ${idx} (value ${tree[idx]})`);
  } else { setStatus('No more steps'); }
});

// Zoom controls & pan-to-scroll drag
function applyZoom(){ zoomContainer.style.setProperty('--scale', zoomLevel.toFixed(2)); zoomResetBtn.textContent = Math.round(zoomLevel*100) + '%'; }
zoomInBtn.addEventListener('click', ()=>{ zoomLevel = Math.min(2, zoomLevel + 0.1); applyZoom(); });
zoomOutBtn.addEventListener('click', ()=>{ zoomLevel = Math.max(0.5, zoomLevel - 0.1); applyZoom(); });
zoomResetBtn.addEventListener('click', ()=>{ zoomLevel = 1; applyZoom(); });

let isPanning=false, panStartX=0, panStartY=0, startScrollL=0, startScrollT=0;
vizWrapper.addEventListener('mousedown', (e)=>{ isPanning=true; vizWrapper.classList.add('panning'); panStartX=e.clientX; panStartY=e.clientY; startScrollL=vizWrapper.scrollLeft; startScrollT=vizWrapper.scrollTop; e.preventDefault(); });
window.addEventListener('mousemove', (e)=>{ if(!isPanning) return; vizWrapper.scrollLeft = startScrollL - (e.clientX - panStartX); vizWrapper.scrollTop = startScrollT - (e.clientY - panStartY); });
window.addEventListener('mouseup', ()=>{ isPanning=false; vizWrapper.classList.remove('panning'); });

vizWrapper.addEventListener('wheel', (e)=>{ if(e.ctrlKey || e.metaKey){ e.preventDefault(); const delta = e.deltaY<0? 0.1 : -0.1; zoomLevel = Math.min(2, Math.max(0.5, zoomLevel + delta)); applyZoom(); } }, { passive:false });

// Initial demo values
valuesInput.value = '5, 3, 8, 1, 4, 7, 9, 0';
data = parseValues(valuesInput.value);
tree = buildTreeFromArray(data);
render();
applyZoom();