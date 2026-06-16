# Zish.ai Workspace

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.95%2B-009688?style=for-the-badge&logo=fastapi)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer)
![Llama 3](https://img.shields.io/badge/AI-Llama_3-purple?style=for-the-badge)

Zish.ai is a powerful, full-stack AI assistant built with a modern Next.js React frontend, a FastAPI backend, and LangChain. It leverages the speed of Groq to run Llama 3 models, giving it capabilities for text generation, web search, image vision, and document analysis.

**Live Demo:** [https://zish-ai-workspace.vercel.app/](https://zish-ai-workspace.vercel.app/)

---

## Key Features

* **Advanced AI:** Powered by Llama 3.3 (70B) via Groq for high-speed, intelligent responses.
* **Web Search Agent:** Integrated with Tavily API to fetch real-time stock prices, news, and factual data.
* **Computer Vision:** Can analyze and describe images using Llama 3.2 Vision.
* **Document Chat:** Upload PDFs and chat with their content instantly.
* **Secure Auth:** Custom credential-based authentication using Werkzeug security.
* **Persistent History:** Chats are saved per user in a SQLite database, ensuring privacy and continuity.
* **Modern Animated UI:** A responsive, sleek dark-mode interface built with Next.js, Tailwind CSS, and Framer Motion.

---

## Tech Stack

* **Frontend:** Next.js (React), Tailwind CSS, Framer Motion
* **Backend:** Python, FastAPI, Werkzeug
* **AI Engine:** LangChain, Groq API (Llama 3 models)
* **Tools:** Tavily Search API, PyPDF (Document processing)
* **Database:** SQLite (Local storage)
* **Deployment:** Vercel

---

## Local Installation

Follow these steps to run Zish.ai on your local machine.

### 1. Clone the Repository
```bash
git clone https://github.com/Zish19/zish-ai-workspace.git
cd zish-ai-workspace
```

### 2. Install Dependencies
```bash
# Frontend
npm install

# Backend
pip install -r requirements.txt
```

### 3. Environment Variables
Create `.env` file or set variables directly:
```
GROQ_API_KEY=your_key
TAVILY_API_KEY=your_key
```

### 4. Run Development Servers
```bash
# Start Next.js development server
npm run dev
```
*(FastAPI server automatically routes through Next.js proxy during development)*
