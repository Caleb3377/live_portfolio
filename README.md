# AI Developer & Web Builder — Portfolio

¡Bienvenido a mi portfolio interactivo de Inteligencia Artificial! Este repositorio contiene una aplicación web completa desarrollada en **React (Vite + TypeScript)** combinada con un backend serverless robusto en **Supabase** (Postgres + pgvector + Deno Edge Functions).

La plataforma demuestra la integración práctica de modelos de lenguaje avanzados (LLMs), modelos de embeddings vectoriales y síntesis de voz hiperrealista para resolver problemas del mundo real.

---

## 🚀 Proyectos Destacados en la Demo

### 1. RAG Avanzado con PDFs Técnicos (Búsqueda Vectorial)
Un pipeline completo de Retrieval-Augmented Generation (RAG) optimizado para manuales y especificaciones técnicas:
* **Base de Datos**: Base de datos vectorial utilizando la extensión `pgvector` en Postgres con búsqueda coseno exacta (`match_chunks`).
* **Chunking**: Chunking inteligente de 400 palabras que conserva tablas en markdown sin dividirlas entre chunks para mantener la integridad de los datos.
* **Embeddings**: Generados usando el modelo `nvidia/nv-embedcode-7b-v1` de 4096 dimensiones en modo `passage` (para indexado) y `query` (para búsqueda).
* **LLM**: Nvidia `nemotron-3-super-120b-a12b` con **razonamiento (thinking)** habilitado. La interfaz muestra el stream del razonamiento interno del modelo junto a la respuesta final citando la página exacta del PDF.

### 2. WhatsApp Voice Bot con ElevenLabs (Simulador)
Un asistente conversacional telefónico y de mensajería interactivo por voz:
* **Entrada**: Transcripción de audio a texto de notas de voz de WhatsApp mediante la API de Whisper.
* **LLM**: Procesamiento inteligente del contexto e historial con Claude 3.5 Sonnet.
* **Salida**: Síntesis de voz ultra realista con clonación de voz provista por ElevenLabs.
* **Simulación**: Incluye un smartphone simulado en la interfaz de usuario para reproducir y visualizar el pipeline del webhook (Twilio → Whisper → Claude → ElevenLabs → Twilio).

### 3. Generador de Webs con IA (NVIDIA LLM)
Un sandbox de desarrollo que genera una web de una sola página en 10 segundos:
* **Entrada**: Prompt libre del usuario, selección de tipo de negocio y paleta de colores HSL dinámica.
* **LLM**: Generación directa de código HTML/CSS/JS por streaming usando el modelo de lenguaje de NVIDIA.
* **Demo en Vivo**: Renderizado directo del código devuelto dentro de un iframe interactivo y pestaña de visor de código con resaltado de sintaxis.

---

## 🛠️ Stack Tecnológico

* **Frontend**: React, TypeScript, Vite, Framer Motion (Animaciones), Lucide React (Iconografía).
* **Backend**: Supabase Database (Postgres), pgvector (Búsqueda semántica), Deno (Edge Functions).
* **AI APIs**: NVIDIA API (Embeddings & LLM), ElevenLabs (Clonación de voz).
* **CI/CD**: GitHub Actions para despliegue automatizado de Edge Functions.

---

## 💻 Configuración Local

### Prerrequisitos
* Node.js v20+ o v22+
* Supabase CLI (`npx supabase`)

### Pasos de Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone <URL-DEL-REPO>
   cd live-portfolio
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   Copia el archivo `.env.example` a `.env` y rellena las variables de Supabase:
   ```bash
   cp .env.example .env
   ```

4. **Configurar secretos en Supabase Cloud**:
   Configura las claves de la API de NVIDIA para las Edge Functions en tu proyecto de Supabase:
   ```bash
   npx supabase secrets set NVIDIA_LLM_API_KEY="tu-clave-nvidia" NVIDIA_EMBED_API_KEY="tu-clave-nvidia"
   ```

5. **Aplicar migraciones de base de datos**:
   ```bash
   npx supabase db push
   ```

6. **Iniciar el servidor local**:
   ```bash
   npm run dev
   ```

---

## 🤖 Integración Continua (GitHub Actions)

El proyecto incluye un pipeline automatizado en `.github/workflows/deploy.yml` para desplegar las Edge Functions en cada cambio subido a `main` o `develop`. 

Para activarlo, añade los secretos `SUPABASE_PROJECT_ID` y `SUPABASE_ACCESS_TOKEN` en la sección de configuración de tu repositorio de GitHub.
