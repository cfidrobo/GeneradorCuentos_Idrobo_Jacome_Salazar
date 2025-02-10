const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Key y URL de Cohere
const COHERE_API_KEY = "i0JgXyGUGMEFJLWDpqgLGz43SQfqeZNtwxNFwZz4";
const COHERE_URL = "https://api.cohere.ai/v1/generate";

/**
 * Endpoint para generar el cuento personalizado en español.
 * Recibe en el body: { theme: '...', protagonist: '...' }
 */
app.post('/api/generate', async (req, res) => {
  const { theme, protagonist } = req.body;
  if (!theme || !protagonist) {
    return res.status(400).json({ error: "Faltan parámetros: 'theme' y 'protagonist'" });
  }

  // Prompt en español optimizado para Cohere
  const prompt = `Escribe un cuento infantil de 50 palabras en **español** sobre "${theme}" con un protagonista llamado "${protagonist}". 
  La historia debe ser creativa, educativa y entretenida para niños. La narración debe estar completamente en español.`;

  try {
    const response = await axios.post(
      COHERE_URL,
      {
        model: "command",
        prompt: prompt,
        max_tokens: 300,
        temperature: 0.8,
        k: 0,
        p: 0.75,
        stop_sequences: [],
        frequency_penalty: 0.5,
        presence_penalty: 0.5
      },
      {
        headers: {
          "Authorization": `Bearer ${COHERE_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Extraer el cuento generado
    const generatedText = response.data.generations[0].text.trim();

    res.json({ story: generatedText });
  } catch (error) {
    console.error('Error al generar cuento:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al generar el cuento' });
  }
});

// API Key de Google TTS
const GOOGLE_TTS_API_KEY = "AIzaSyD0IUVU3MJqTC0rBKCZVmcFK3YJ1IJvuAU";

/**
 * Endpoint para convertir el cuento a voz.
 * Recibe en el body: { text: '...', voice: 'opcional' }
 */
app.post('/api/tts', async (req, res) => {
  const { text, voice } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Falta el parámetro 'text'" });
  }

  const selectedVoice = voice || 'es-ES-Standard-A';
  const googleTTSUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`;

  const requestBody = {
    input: { text },
    voice: { languageCode: 'es-ES', name: selectedVoice },
    audioConfig: { audioEncoding: 'MP3' }
  };

  try {
    const response = await axios.post(googleTTSUrl, requestBody, {
      headers: { 'Content-Type': 'application/json' }
    });

    res.json({ audioContent: response.data.audioContent });
  } catch (error) {
    console.error('Error en TTS:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error en la conversión de texto a voz' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
