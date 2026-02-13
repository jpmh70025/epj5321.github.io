// script.js

// URL de tu backend Vercel
const BACKEND_URL = "https://rp-ai-ten.vercel.app";

let personajes = {};  // Guarda personajes {nombre: {descripcion, mensajeInicial, avatar, memoria}}
let personajeActual = null;

// --- Funciones de backend ---
async function callDeepseek(prompt){
  try {
    const res = await fetch(`${BACKEND_URL}/api/deepseek`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    return data.output || "Error: no se recibió respuesta";
  } catch(err) {
    console.error("Error Deepseek:", err);
    return "Error al generar respuesta";
  }
}

async function generateCharacterImage(prompt){
  try {
    const res = await fetch(`${BACKEND_URL}/api/novita`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    return data.image_url || "";
  } catch(err) {
    console.error("Error generando imagen:", err);
    return "";
  }
}

// --- Manejo de personajes ---
function actualizarSelector() {
  const selector = document.getElementById("selectorPersonaje");
  selector.innerHTML = `<option value="">Selecciona un personaje</option>`;
  for (let nombre in personajes){
    const option = document.createElement("option");
    option.value = nombre;
    option.textContent = nombre;
    selector.appendChild(option);
  }
}

function crearPersonaje() {
  const nombre = document.getElementById("nombrePersonaje").value.trim();
  if(!nombre) return alert("Ponle un nombre al personaje");
  const descripcion = document.getElementById("descripcionPersonaje").value;
  const mensajeInicial = document.getElementById("mensajeInicial").value;
  const avatarURL = document.getElementById("avatarURL").value;
  const avatarArchivo = document.getElementById("avatarArchivo").files[0];

  personajes[nombre] = {
    descripcion,
    mensajeInicial,
    avatar: avatarURL,
    memoria: []
  };

  if(avatarArchivo){
    const reader = new FileReader();
    reader.onload = e => {
      personajes[nombre].avatar = e.target.result;
    }
    reader.readAsDataURL(avatarArchivo);
  }

  actualizarSelector();
  alert(`Personaje ${nombre} creado`);
}

function eliminarPersonaje() {
  const selector = document.getElementById("selectorPersonaje");
  const nombre = selector.value;
  if(!nombre) return alert("Selecciona un personaje para eliminar");
  delete personajes[nombre];
  personajeActual = null;
  actualizarSelector();
  document.getElementById("chatMensajes").innerHTML = "";
}

// --- Manejo de chat ---
async function enviarMensaje() {
  if(!personajeActual) return alert("Selecciona un personaje");
  const input = document.getElementById("mensajeUsuario");
  const mensaje = input.value.trim();
  if(!mensaje) return;
  input.value = "";

  // Guardar mensaje en memoria
  personajes[personajeActual].memoria.push(`Usuario: ${mensaje}`);
  appendMensaje("Tú", mensaje);

  // Construir prompt con memoria
  const memoria = personajes[personajeActual].memoria.join("\n");
  const prompt = `${personajeActual} (${personajes[personajeActual].descripcion})\n${memoria}\nMensaje:`;  

  const respuesta = await callDeepseek(prompt);
  personajes[personajeActual].memoria.push(`${personajeActual}: ${respuesta}`);
  appendMensaje(personajeActual, respuesta);
}

function appendMensaje(autor, mensaje){
  const cont = document.getElementById("chatMensajes");
  const div = document.createElement("div");
  div.innerHTML = `<b>${autor}:</b> ${mensaje}`;
  cont.appendChild(div);
  cont.scrollTop = cont.scrollHeight;
}

// --- Eventos ---
document.getElementById("btnCrearPersonaje").addEventListener("click", crearPersonaje);
document.getElementById("btnEliminarPersonaje").addEventListener("click", eliminarPersonaje);
document.getElementById("selectorPersonaje").addEventListener("change", e => {
  personajeActual = e.target.value;
  document.getElementById("chatMensajes").innerHTML = "";
  if(personajeActual && personajes[personajeActual].mensajeInicial){
    appendMensaje(personajeActual, personajes[personajeActual].mensajeInicial);
    personajes[personajeActual].memoria.push(`${personajeActual}: ${personajes[personajeActual].mensajeInicial}`);
  }
});
document.getElementById("btnEnviar").addEventListener("click", enviarMensaje);
