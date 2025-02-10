import { useState } from "react";
import axios from "axios";
import "./App.css"; 

function App() {
  const [theme, setTheme] = useState("");
  const [protagonist, setProtagonist] = useState("");
  const [voice, setVoice] = useState("es-ES-Standard-A");
  const [story, setStory] = useState("");
  const [audioSrc, setAudioSrc] = useState("");

  const generateStory = async (e) => {
    e.preventDefault();

    try {
      // Llamada a la API para generar el cuento
      const generateResponse = await axios.post("/api/generate", {
        theme,
        protagonist,
      });
      setStory(generateResponse.data.story);

      // Llamada a la API para convertir el cuento a voz
      const ttsResponse = await axios.post("/api/tts", {
        text: generateResponse.data.story,
        voice,
      });

      // Convertir base64 a audio reproducible
      setAudioSrc(`data:audio/mp3;base64,${ttsResponse.data.audioContent}`);
    } catch (error) {
      console.error("Error:", error);
      alert("Ocurrió un error al generar el cuento.");
    }
  };

  return (
    <div className="container">
      <h1>Crea tu Cuento Personalizado</h1>
      <form onSubmit={generateStory}>
        <label htmlFor="theme">Tema:</label>
        <input
          type="text"
          id="theme"
          name="theme"
          required
          placeholder="Ejemplo: Aventura en el bosque"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        />

        <label htmlFor="protagonist">Nombre del Protagonista:</label>
        <input
          type="text"
          id="protagonist"
          name="protagonist"
          required
          placeholder="Ejemplo: Luna"
          value={protagonist}
          onChange={(e) => setProtagonist(e.target.value)}
        />

        <label htmlFor="voice">Selecciona la voz:</label>
        <select
          id="voice"
          name="voice"
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
        >
          <option value="es-ES-Standard-A">Voz A</option>
          <option value="es-ES-Standard-B">Voz B</option>
          <option value="es-ES-Standard-C">Voz C</option>
        </select>

        <button type="submit">Generar Cuento</button>
      </form>

      {story && (
        <>
          <h2>Tu Cuento:</h2>
          <textarea id="storyOutput" rows="10" readOnly value={story} />

          {audioSrc && (
            <>
              <button onClick={() => document.getElementById("audioPlayer").play()}>
                Escuchar Cuento
              </button>
              <audio id="audioPlayer" controls>
                <source src={audioSrc} type="audio/mp3" />
                Tu navegador no soporta audio.
              </audio>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
