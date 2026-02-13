const chat = document.getElementById("chat");
const select = document.getElementById("characterSelect");

let characters = JSON.parse(localStorage.getItem("characters")) || {};
let current = null;


// ===== GUARDAR =====
function save(){
 localStorage.setItem("characters", JSON.stringify(characters));
}


// ===== TEXTO ACCIONES =====
function parseNarrator(text){
 return text.replace(/\*(.*?)\*/g,
 '<span class="action">*$1*</span>');
}


// ===== MENSAJES =====
function addMessage(text,type,index){

 const div=document.createElement("div");
 div.className="msg "+type;

 const content=document.createElement("span");
 content.innerHTML=parseNarrator(text);

 div.appendChild(content);

 // botón borrar mensaje
 const del=document.createElement("button");
 del.textContent="✖";
 del.style.marginLeft="8px";

 del.onclick=()=>{
   characters[current].messages.splice(index,1);
   save();
   loadChat();
 };

 div.appendChild(del);

 chat.appendChild(div);
 chat.scrollTop=chat.scrollHeight;
}


// ===== CREAR PERSONAJE =====
function createCharacter(){

 const name=document.getElementById("charName").value.trim();
 const desc=document.getElementById("charDesc").value.trim();
 const start=document.getElementById("charStart").value.trim();

 if(!name || !start) return;

 characters[name]={
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

 if(!confirm("Eliminar personaje?")) return;

 delete characters[current];

 current=null;

 save();
 refreshCharacters();
 loadChat();
}


// ===== REFRESCAR SELECTOR =====
function refreshCharacters(){

 select.innerHTML="";

 const first=document.createElement("option");
 first.textContent="Selecciona personaje";
 first.value="";
 select.appendChild(first);

 const names=Object.keys(characters);

 names.forEach(name=>{
   const opt=document.createElement("option");
   opt.value=name;
   opt.textContent=name;
   select.appendChild(opt);
 });

 if(names.length>0){
   current=names[0];
   select.value=current;
 }
}


// ===== CARGAR CHAT =====
function loadChat(){

 chat.innerHTML="";

 if(!current || !characters[current]) return;

 characters[current].messages.forEach((m,i)=>{
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
 return "*El personaje piensa un momento* Dijiste: "+text;
}


// ===== ENVIAR =====
function send(){

 const input=document.getElementById("msg");
 const text=input.value.trim();

 if(!text || !current) return;

 addMessage(text,"user");

 characters[current].messages.push({
   role:"user",
   text:text
 });

 input.value="";

 setTimeout(()=>{

   const reply=fakeAI(text);

   characters[current].messages.push({
     role:"bot",
     text:reply
   });

   save();
   loadChat();

 },400);
}


// ===== INIT =====
refreshCharacters();
loadChat();
