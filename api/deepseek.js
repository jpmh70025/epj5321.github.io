// api/deepseek.js
import fetch from "node-fetch";

const API_KEY = "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";
const HOST = "https://openrouter.ai/deepseek/deepseek-v3.2";

export default async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({error:"Solo POST"});
  try {
    const { prompt } = req.body;
    if(!prompt) return res.status(400).json({error:"Falta prompt"});

    const apiRes = await fetch(HOST, {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({ model:"deepseek-v3.2", input: prompt, max_output_tokens:2000 })
    });

    const data = await apiRes.json();
    res.status(200).json({output: data.output_text || "Sin respuesta"});
  } catch(err){
    console.error("Error Deepseek:", err);
    res.status(500).json({error: err.message});
  }
}

