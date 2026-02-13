const BACKEND_URL = "https://rp-ai-ten.vercel.app";

let personajes = {};
let personajeActual = null;

// --- Chat ---
async function callDeepseek(prompt){
  try {
    const res = await fetch(`${BACKEND_URL}/api/deepseek`, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    return data.output || "Error: sin respuesta";
  } catch(err){ return "Error al generar respuesta"; }
}

// --- Imágenes ---
async function generateCharacterImage(prompt){
  try{
    const res = await fetch(`${BACKEND_URL}/api/novita`, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    return data.image_url || "";
  } catch(err){ return ""; }
}

// --- Personajes ---
function actualizarSelector(){
  const sel = document.getElementById("selectorPersonaje");
  sel.innerHTML = `<option value="">Selecciona un personaje</option>`;
  for(let n in personajes){
    const o = document.createElement("option");
    o.value = n; o.textContent = n;
    sel.appendChild(o);
  }
}

function crearPersonaje(){
  const nombre = document.getElementById("nombrePersonaje").value.trim();
  if(!nombre) return alert("Ponle un nombre al personaje");
  const desc = document.getElementById("descripcionPersonaje").value;
  const mensaje = document.getElementById("mensajeInicial").value;
  const avatarURL = document.getElementById("avatarURL").value;
  const avatarFile = document.getElementById("avatarArchivo").files[0];

  personajes[nombre] = {descripcion:desc, mensajeInicial:mensaje, avatar:avatarURL, memoria:[]};

  if(avatarFile){
    const reader = new FileReader();
    reader.onload = e => personajes[nombre].avatar = e.target.result;
    reader.readAsDataURL(avatarFile);
  }

  actualizarSelector();
  alert(`Personaje ${nombre} creado`);
}

function eliminarPersonaje(){
  const sel = document.getElementById("selectorPersonaje");
  const nombre = sel.value;
  if(!nombre) return alert("Selecciona un personaje");
  delete personajes[nombre];
  personajeActual=null;
  document.getElementById("chatMensajes").innerHTML="";
  actualizarSelector();
}

// --- Chat ---
async function enviarMensaje(){
  if(!personajeActual) return alert("Selecciona un personaje");
  const input = document.getElementById("mensajeUsuario");
  const msg = input.value.trim();
  if(!msg) return;
  input.value="";

  personajes[personajeActual].memoria.push(`Usuario: ${msg}`);
  appendMensaje("Tú", msg);

  const memoria = personajes[personajeActual].memoria.join("\n");
  const prompt = `${personajeActual} (${personajes[personajeActual].descripcion})\n${memoria}\nMensaje:`;  

  const resp = await callDeepseek(prompt);
  personajes[personajeActual].memoria.push(`${personajeActual}: ${resp}`);
  appendMensaje(personajeActual, resp);
}

function appendMensaje(autor,mensaje){
  const cont = document.getElementById("chatMensajes");
  const div = document.createElement("div");
  div.innerHTML = `<b>${autor}:</b> ${mensaje}`;
  cont.appendChild(div);
  cont.scrollTop = cont.scrollHeight;
}

// --- Eventos ---
document.getElementById("btnCrearPersonaje").addEventListener("click",crearPersonaje);
document.getElementById("btnEliminarPersonaje").addEventListener("click",eliminarPersonaje);
document.getElementById("selectorPersonaje").addEventListener("change",e=>{
  personajeActual = e.target.value;
  document.getElementById("chatMensajes").innerHTML="";
  if(personajeActual && personajes[personajeActual].mensajeInicial){
    appendMensaje(personajeActual, personajes[personajeActual].mensajeInicial);
    personajes[personajeActual].memoria.push(`${personajeActual}: ${personajes[personajeActual].mensajeInicial}`);
  }
});
document.getElementById("btnEnviar").addEventListener("click",enviarMensaje);
