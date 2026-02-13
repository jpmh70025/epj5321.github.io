const chat = document.getElementById("chat");
const select = document.getElementById("characterSelect");

let characters = JSON.parse(localStorage.getItem("characters")) || {};
let current = null;


// ===== GUARDAR =====
function save(){
 localStorage.setItem("characters", JSON.stringify(characters));
}


// ===== ACCIONES *texto* =====
function parseNarrator(text){
 return text.replace(/\*(.*?)\*/g,'<span class="action">*$1*</span>');
}


// ===== MENSAJE VISUAL =====
function addMessage(text,type,index){

 const div=document.createElement("div");
 div.className="msg "+type;

 const span=document.createElement("span");
 span.innerHTML=parseNarrator(text);

 div.appendChild(span);

 const del=document.createElement("button");
 del.textContent="✖";

 del.onclick=()=>{
   characters[current].messages.splice(index,1);
   save();
   loadChat();
 };

 div.appendChild(del);
 chat.appendChild(div);
}


// ===== CREAR PERSONAJE =====
function createCharacter(){

 const name=document.getElementById("charName").value.trim();
 const avatar=document.getElementById("charAvatar").value.trim();
 const bg=document.getElementById("charBg").value.trim();
 const desc=document.getElementById("charDesc").value.trim();
 const start=document.getElementById("charStart").value.trim();

 if(!name || !start) return;

 characters[name]={
   avatar:avatar,
   bg:bg,
   desc:desc,
   messages:[{role:"bot",text:start}]
 };

 current=name;

 save();
 refreshCharacters();
 loadChat();
}


// ===== ELIMINAR PERSONAJE =====
function deleteCharacter(){
 if(!current) return;
 delete characters[current];
 current=null;
 save();
 refreshCharacters();
 loadChat();
}


// ===== SELECTOR =====
function refreshCharacters(){

 select.innerHTML="";

 const base=document.createElement("option");
 base.value="";
 base.textContent="Selecciona personaje";
 select.appendChild(base);

 Object.keys(characters).forEach(name=>{
   const opt=document.createElement("option");
   opt.value=name;
   opt.textContent=name;
   select.appendChild(opt);
 });

 if(Object.keys(characters).length>0){
   current=Object.keys(characters)[0];
   select.value=current;
 }
}


// ===== CARGAR CHAT =====
function loadChat(){

 chat.innerHTML="";

 if(!current) return;

 const data=characters[current];

 // fondo personalizado
 if(data.bg){
   chat.style.backgroundImage=`url(${data.bg})`;
 }else{
   chat.style.backgroundImage="none";
 }

 data.messages.forEach((m,i)=>{
   addMessage(m.text,m.role==="user"?"user":"bot",i);
 });
}


// ===== CAMBIAR PERSONAJE =====
select.onchange=()=>{
 current=select.value || null;
 loadChat();
};


// ===== IA TEMPORAL =====
function fakeAI(text){
 return "*El personaje te observa en silencio* Dijiste: "+text;
}


// ===== ENVIAR =====
function send(){

 const input=document.getElementById("msg");
 const text=input.value.trim();

 if(!text || !current) return;

 characters[current].messages.push({role:"user",text:text});

 const reply=fakeAI(text);

 characters[current].messages.push({role:"bot",text:reply});

 save();
 loadChat();

 input.value="";
}


// ===== INIT =====
refreshCharacters();
loadChat();
