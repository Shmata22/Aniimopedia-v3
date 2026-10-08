let DB, state={filter:"all",search:"",element:"",role:"",favorites:new Set(),captured:new Set()};
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
async function boot(){
  const r=await fetch("aniimo.json"); DB=await r.json();
  const saved=JSON.parse(localStorage.getItem("aniimopedia-progress")||"null");
  if(saved){state.captured=new Set(saved.captured||[]);state.favorites=new Set(saved.favorites||[])}
  else state.captured=new Set(DB.aniimo.filter(x=>x.captured).map(x=>x.id));
  render(); bind();
}
function save(){localStorage.setItem("aniimopedia-progress",JSON.stringify({captured:[...state.captured],favorites:[...state.favorites],savedAt:new Date().toISOString()}));}
function current(){return DB.aniimo.filter(x=>{
  const q=state.search.toLowerCase();
  const text=(x.name+" "+x.id+" "+(x.element||"")+" "+(x.role||"")).toLowerCase();
  if(q&&!text.includes(q))return false;
  if(state.element&&x.element!==state.element)return false;
  if(state.role&&x.role!==state.role)return false;
  if(state.filter==="captured"&&!state.captured.has(x.id))return false;
  if(state.filter==="missing"&&state.captured.has(x.id))return false;
  if(state.filter==="favorite"&&!state.favorites.has(x.id))return false;
  return true;
});}
function imgTag(x,detail=false){
  return `<img src="${esc(x.image)}" alt="${esc(x.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling?.classList.remove('hidden')"><div class="silhouette ${detail?'detail-sil':''}"></div>`;
}
function render(){
  const all=DB.aniimo, got=all.filter(x=>state.captured.has(x.id)).length, total=all.length, pct=Math.round(got/total*100);
  $("#progressText").textContent=`${got} / ${total}`;$("#progressPercent").textContent=pct+" %";$("#remainingText").textContent=`${total-got} à découvrir`;$("#progressFill").style.width=pct+"%";
  const list=current();$("#resultCount").textContent=list.length;
  $("#grid").innerHTML=list.map(card).join("");
  $("#specialGrid").innerHTML=DB.special.map(x=>`<button class="special" data-id="${x.id}">#${x.id} · ${esc(x.name)}</button>`).join("");
  document.querySelectorAll(".card").forEach(e=>e.onclick=()=>openDetail(+e.dataset.id));
  document.querySelectorAll(".fav").forEach(e=>e.onclick=ev=>{ev.stopPropagation();toggleFav(+e.dataset.id)});
  document.querySelectorAll(".special").forEach(e=>e.onclick=()=>openDetail(+e.dataset.id,true));
}
function card(x){
  const got=state.captured.has(x.id),fav=state.favorites.has(x.id);
  return `<article class="card ${got?'captured':'unknown'}" data-id="${x.id}">
   <div class="card-media">${imgTag(x)}<span class="num">#${String(x.id).padStart(3,"0")}</span><button class="fav ${fav?'on':''}" data-id="${x.id}" aria-label="Favori">${fav?'★':'☆'}</button></div>
   <div class="card-body"><h3>${got?esc(x.name):"???"}</h3><div class="card-meta">${x.element?`<span class="tag">${esc(x.element)}</span>`:""}${x.role?`<span class="tag">${esc(x.role)}</span>`:""}</div><div class="status">${got?"✓ CAPTURÉ":"NON DÉCOUVERT"}</div></div>
  </article>`;
}
function getById(id,special=false){return (special?DB.special:DB.aniimo).find(x=>x.id===id)}
function openDetail(id,special=false){
 const x=getById(id,special),got=state.captured.has(x.id),fav=state.favorites.has(x.id);
 $("#sheet").innerHTML=`<div class="sheet-top"><span class="eyebrow">${special?"ENTRÉE SPÉCIALE":"FICHE ANIIMO"}</span><button class="close" data-close>×</button></div>
 <div class="detail-hero"><div class="detail-image">${imgTag(x,true)}</div><div class="detail-info"><div class="detail-number">NO.${String(x.id).padStart(3,"0")}</div><h2>${got||special?esc(x.name):"???"}</h2><div class="detail-tags">${x.element?`<span class="big-tag">${esc(x.element)}</span>`:""}${x.role?`<span class="big-tag">${esc(x.role)}</span>`:""}<span class="big-tag">${got?"CAPTURÉ":"NON DÉCOUVERT"}</span></div>${!special?`<button class="collect">${got?"✓ DANS MA COLLECTION":"＋ AJOUTER À MA COLLECTION"}</button><button class="fav-detail">${fav?"★ Retirer des favoris":"☆ Ajouter aux favoris"}</button>`:""}<a class="official" target="_blank" rel="noopener" href="${x.officialUrl}">Consulter la fiche officielle ↗</a></div></div>
 <div class="detail-section"><h3>INFORMATIONS</h3><div class="facts">${fact("Élément",x.element)}${fact("Rôle",x.role)}${fact("Rareté",x.rarity)}${fact("Habitat",x.habitats?.length?x.habitats.join(", "):null)}${fact("Évolution",x.evolution?.length?x.evolution.join(" → "):null)}${fact("Compétences",x.abilities?.length?x.abilities.join(", "):null)}</div></div>
 <div class="detail-section"><h3>DESCRIPTION</h3><div class="description">${esc(x.description||"??? — Information non renseignée dans cette base personnelle.")}</div></div>
 <div class="detail-section"><h3>NOTES PERSONNELLES</h3><div class="description">${esc(x.notes||"Aucune note.")}</div></div>`;
 $("#modal").classList.remove("hidden");
 const c=$(".collect"),f=$(".fav-detail"); if(c)c.onclick=()=>{toggleCaptured(x.id);openDetail(x.id,special)};if(f)f.onclick=()=>{toggleFav(x.id);openDetail(x.id,special)};
 document.querySelectorAll("[data-close]").forEach(e=>e.onclick=closeOverlays);
}
function fact(a,b){return `<div class="fact"><small>${a}</small><b>${esc(b||"???")}</b></div>`}
function toggleCaptured(id){if(state.captured.has(id))state.captured.delete(id);else state.captured.add(id);save();render()}
function toggleFav(id){if(state.favorites.has(id))state.favorites.delete(id);else state.favorites.add(id);save();render()}
function closeOverlays(){$("#modal").classList.add("hidden");$("#drawer").classList.add("hidden")}
function bind(){
 $("#search").oninput=e=>{state.search=e.target.value;render()};
 document.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{document.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));b.classList.add("active");state.filter=b.dataset.filter;render()});
 $("#elementFilter").onchange=e=>{state.element=e.target.value;render()};$("#roleFilter").onchange=e=>{state.role=e.target.value;render()};
 $("#menuBtn").onclick=()=>$("#drawer").classList.remove("hidden");$("#settingsBtn").onclick=()=>$("#drawer").classList.remove("hidden");$("#dataBtn").onclick=()=>$("#drawer").classList.remove("hidden");
 document.querySelectorAll("[data-close]").forEach(e=>e.onclick=closeOverlays);
 $("#exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify({captured:[...state.captured],favorites:[...state.favorites]},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="ma-collection-aniimopedia.json";a.click();URL.revokeObjectURL(a.href)};
 $("#importFile").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);state.captured=new Set(d.captured||[]);state.favorites=new Set(d.favorites||[]);save();render();closeOverlays()}catch{alert("Fichier de progression invalide.")}};r.readAsText(f)};
 $("#resetBtn").onclick=()=>{if(confirm("Réinitialiser toute la progression ?")){state.captured=new Set();state.favorites=new Set();save();render();closeOverlays()}};
}
boot();
