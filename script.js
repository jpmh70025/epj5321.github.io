const chat = document.getElementById("chat");
const select = document.getElementById("characterSelect");

let characters = JSON.parse(localStorage.getItem("characters")) || {};
let current = null;


// ===== GUARDAR =====
function save(){
 localStorage.setItem("characters", JSON.stringify(characters));
}


// ===== TEXTO NARRADOR =====
function parseNarrator(text){
 return text.replace(/\*(.*?)\*/g,
 '<span class="action">*$1*</span>');
}

function addMessage(text,type){
 const div = document.createElement("div");
 div.className = "msg " + type;
 div.innerHTML = parseNarrator(text);
 chat.appendChild(div);
 chat.scrollTop = chat.scrollHeight;
}


// ===== CREAR PERSONAJE =====
function createCharacter(){

 const name = document.getElementById("charName").value.trim();
 const desc = document.getElementById("charDesc").value.trim();
 const start = document.getElementById("charStart").value.trim();

 if(!name || !start){
   alert("Falta nombre o mensaje inicial");
   return;
 }

 characters[name] = {
   desc: desc,
   messages:[
     {role:"bot", text:start}
   ]
 };

 current = name;

 save();
 refreshCharacters();
 loadChat();

 document.getElementById("charName").value="";
 document.getElementById("charDesc").value="";
 document.getElementById("charStart").value="";
}


// ===== REFRESCAR LISTA =====
function refreshCharacters(){

 select.innerHTML="";

 const names = Object.keys(characters);

 names.forEach(name=>{
   const opt=document.createElement("option");
   opt.value=name;
   opt.textContent=name;
   select.appendChild(opt);
 });

 if(names.length>0){
   current = names[names.length-1];
   select.value=current;
 }
}


// ===== CARGAR CHAT =====
function loadChat(){

 chat.innerHTML="";

 if(!current) return;

 characters[current].messages.forEach(m=>{
   addMessage(m.text, m.role==="user"?"user":"bot");
 });
}


// ===== CAMBIAR PERSONAJE =====
select.onchange = ()=>{
 current = select.value;
 loadChat();
};


// ===== IA FALSA (TEMPORAL) =====
function fakeAI(text){
 return "*El personaje te mira fijamente* Dijiste: " + text;
}


// ===== ENVIAR MENSAJE =====
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

   addMessage(reply,"bot");

   characters[current].messages.push({
     role:"bot",
     text:reply
   });

   save();

 },400);
}


// ===== INICIO =====
refreshCharacters();
loadChat();
