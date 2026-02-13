// ===== VARIABLES =====
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

// ===== LLAMAR NOVITA.AI PARA GENERAR AVATAR =====
async function generateCharacterImage(prompt) {
    const apiKey = "sk_aN3FIA4Sex0DlnYlp2XxSp92ZbeDcEeS9P1OHy9URr8";
    const url = "https://api.novita.ai/v3/text2img";

    const fullPrompt = `score_9, score_8_up, score_7_up, rating_explicit, ${prompt}`;
    const negativePrompt = "score_6, score_5, score_4, low quality, bad anatomy";

    const body = {
        model: "ponydiffusionv6xl_v6_321454.safetensors",
        prompt: fullPrompt,
        negative_prompt: negativePrompt,
        width: 512,
        height: 512,
        steps: 28
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        return data.image_url || "";
    } catch (err) {
        console.error("Error generando imagen:", err);
        return "";
    }
}

// ===== LLAMAR DEEPSEEK API PARA RESPUESTAS =====
async function callDeepseek(prompt){
  const apiKey = "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";

  try {
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
  } catch(err) {
      console.error("Error Deepseek:", err);
      return "Error al generar respuesta";
  }
}

// ===== CREAR PERSONAJE =====
async function createCharacter(){
  const name=document.getElementById("charName").value.trim();
  const desc=document.getElementById("charDesc").value.trim();
  const start=document.getElementById("charStart").value.trim();

  if(!name || !start) return;

  // Generar avatar automáticamente
  const avatarUrl = await generateCharacterImage(`${name}, anime character`);

  characters[name]={
    avatar: avatarUrl,
    bg:"",
    desc:desc,
    messages:[{role:"bot", text:start}]
  };

  current=name;
  save();
  refreshCharacters();
  loadChat();

  // limpiar inputs
  document.getElementById("charName").value="";
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
