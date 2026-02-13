const chat = document.getElementById("chat");
const select = document.getElementById("characterSelect");

let characters = JSON.parse(localStorage.getItem("characters")) || {};
let current = null;


// ====== UTIL ======

function save(){
 localStorage.setItem("characters", JSON.stringify(characters));
}

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


// ====== PERSONAJES ======

function refreshCharacters(){

 select.innerHTML="";

 const names = Object.keys(characters);

 names.forEach(name=>{
   const opt = document.createElement("option");
   opt.value = name;
   opt.textContent = name;
   select.appendChild(opt);
 });

 if(names.length > 0){
   current = names[names.length-1];
   select.value = current;
 }

 loadChat();
}


 select.innerHTML="";

 for(let name in characters){
   const opt=document.createElement("option");
   opt.value=name;
   opt.textContent=name;
   select.appendChild(opt);
 }

 if(!current && Object.keys(characters).length>0){
   current = Object.keys(characters)[0];
 }

 loadChat();
}

function createCharacter(){

 const name = document.getElementById("charName").value;
 const desc = document.getElementById("charDesc").value;
 const start = document.getElementById("charStart").value;

 if(!name || !start) return;

 characters[name] = {
   desc: desc,
   messages:[
     {role:"bot", text:start}
   ]
 };

 current = name;

 save();
 refreshCharacters();

 document.getElementById("charName").value="";
 document.getElementById("charDesc").value="";
 document.getElementById("charStart").value="";
}


 const name = prompt("Nombre del personaje:");
 if(!name) return;

 const desc = prompt("Descripción general:");
 const start = prompt("Mensaje inicial:");

 characters[name] = {
   desc: desc,
   messages: [
     {role:"bot", text:start}
   ]
 };

 current = name;

 save();
 refreshCharacters();
}

select.onchange = ()=>{
 current = select.value;
 loadChat();
};


// ====== CHAT ======

function loadChat(){

 chat.innerHTML="";

 if(!current) return;

 characters[current].messages.forEach(m=>{
   addMessage(m.text, m.role==="user"?"user":"bot");
 });
}

function fakeAI(userText){

 return "*El personaje te observa* Dijiste: " + userText;
}

function send(){

 const input = document.getElementById("msg");
 const text = input.value;

 if(!text || !current) return;

 addMessage(text,"user");

 characters[current].messages.push({
   role:"user",
   text:text
 });

 input.value="";

 setTimeout(()=>{

   const reply = fakeAI(text);

   addMessage(reply,"bot");

   characters[current].messages.push({
     role:"bot",
     text:reply
   });

   save();

 },500);
}


// ====== INIT ======
refreshCharacters();


