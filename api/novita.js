// api/novita.js
import fetch from "node-fetch";

const API_KEY = "sk_aN3FIA4Sex0DlnYlp2XxSp92ZbeDcEeS9P1OHy9URr8";
const HOST = "https://api.novita.ai/v3/text2img";

export default async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({error:"Solo POST"});
  try {
    const { prompt } = req.body;
    if(!prompt) return res.status(400).json({error:"Falta prompt"});

    const finalPrompt = `score_9, score_8_up, score_7_up, rating_explicit, ${prompt}`;
    const negativePrompt = "score_6, score_5, score_4, low quality, bad anatomy";

    const apiRes = await fetch(HOST, {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "ponydiffusionv6xl_v6_321454.safetensors",
        prompt: finalPrompt,
        negative_prompt: negativePrompt,
        width:512,
        height:512,
        steps:20
      })
    });

    const data = await apiRes.json();
    res.status(200).json({image_url: data.output?.[0]?.url || ""});
  } catch(err){
    console.error("Error Novita:", err);
    res.status(500).json({error: err.message});
  }
}

