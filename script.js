const chat = document.getElementById("chat");
const select = document.getElementById("characterSelect");

let characters = JSON.parse(localStorage.getItem("characters")) || {};
let current = null;

// ===== GUARDAR MEMORIA =====
function save(){
  localStorage.setItem("characters", JSON.stringify(characters));
}

// ===== ACCIONES *texto* =====
function parseNarrator(text){
  return text.replace(/\*(.*?)\*/g,'<span class="action">*$1*</span>');
}

// ===== MOSTRAR MENSAJE =====
function addMessage(text,type,index){
  const div=document.createElement("div");
  div.className="msg "+type;

  const span=document.createElement("span");
  span.innerHTML=parseNarrator(text);
  div.appendChild(span);

  // botón borrar mensaje
  const del=document.createElement("button");
  del.textContent="✖";
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
  const avatar=document.getElementById("charAvatar").value.trim();
  const bg=document.getElementById("charBg").value.trim();
  const desc=document.getElementById("charDesc").value.trim();
  const start=document.getElementById("charStart").value.trim();

  if(!name || !start) return;

  characters[name]={
    avatar: avatar,
    bg: bg,
    desc: desc,
    messages:[{role:"bot", text:start}]
  };

  current=name;
  save();
  refreshCharacters();
  loadChat();

  // limpiar inputs
  document.getElementById("charName").value="";
  document.getElementById("charAvatar").value="";
  document.getElementById("charBg").value="";
  document.getElementById("charDesc").value="";
  document.getElementById("charStart").value="";
}

// ===== ELIMINAR PERSONAJE =====
function deleteCharacter(){
  if(!current) return;
  if(!confirm("¿Eliminar personaje?")) return;

  delete characters[current];
  current=null;
  save();
  refreshCharacters();
  loadChat();
}

// ===== REFRESCAR SELECTOR =====
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

  // fondo chat
  chat.style.backgroundImage = data.bg ? `url(${data.bg})` : "none";
  chat.style.backgroundSize = "cover";

  data.messages.forEach((m,i)=>{
    addMessage(m.text, m.role==="user"?"user":"bot", i);
  });
}

// ===== CAMBIAR PERSONAJE =====
select.onchange=()=>{
  current=select.value || null;
  loadChat();
}

// ===== LLAMAR DEEPSEEK API =====
async function callDeepseek(prompt){
  const apiKey = "TU_API_KEY"; // reemplaza con tu API Key

  const response = await fetch("https://openrouter.ai/deepseek/deepseek-v3.2", {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model:"deepseek-v3.2",
      input: prompt,
      max_tokens: 500
    })
  });

  const data = await response.json();
  return data.output || "Error: no se recibió respuesta";
}

// ===== ENVIAR MENSAJE =====
async function send(){
  const input=document.getElementById("msg");
  const text=input.value.trim();
  if(!text || !current) return;

  // guardar mensaje del usuario
  characters[current].messages.push({role:"user", text:text});
  addMessage(text,"user", characters[current].messages.length-1);

  input.value="";

  // preparar prompt con contexto y descripción
  const prompt = `Eres el personaje ${current}. Responde en español, incluyendo acciones entre *asteriscos*. Contexto: ${characters[current].desc}\nUsuario: ${text}`;

  // llamar a Deepseek
  const reply = await callDeepseek(prompt);

  // guardar respuesta de IA
  characters[current].messages.push({role:"bot", text:reply});
  save();
  loadChat();
}

// ===== INIT =====
refreshCharacters();
loadChat();
