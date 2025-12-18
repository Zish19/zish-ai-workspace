# ⚡ Zish.ai Workspace

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.95%2B-009688?style=for-the-badge&logo=fastapi)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Llama 3](https://img.shields.io/badge/AI-Llama_3-purple?style=for-the-badge)

**Zish.ai** is a powerful, full-stack AI assistant built with **FastAPI** and **LangChain**. It leverages the speed of **Groq** to run Llama 3 models, giving it capabilities for text generation, web search, image vision, and document analysis.

🌐 **Live Demo:** [https://zish-ai-workspace-2.onrender.com/](https://zish-ai-workspace-2.onrender.com/)

---

## 🚀 Key Features

* **🧠 Advanced AI:** Powered by **Llama 3.3 (70B)** via Groq for high-speed, intelligent responses.
* **🔎 Web Search Agent:** Integrated with **Tavily API** to fetch real-time stock prices, news, and factual data.
* **👁️ Computer Vision:** Can analyze and describe images using **Llama 3.2 Vision**.
* **📄 Document Chat:** Upload **PDFs** and chat with their content instantly.
* **🔐 Secure Auth:** Integrated **Google OAuth** for secure login and user session management.
* **💾 Persistent History:** Chats are saved per user in a SQLite database, ensuring privacy and continuity.
* **🎨 Modern UI:** A responsive, dark-mode interface built with **Tailwind CSS**.

---

## 🛠️ Tech Stack

* **Backend:** Python, FastAPI, Uvicorn
* **Frontend:** HTML5, Jinja2 Templates, Tailwind CSS, Vanilla JS
* **AI Engine:** LangChain, Groq API (Llama 3 models)
* **Tools:** Tavily Search API, PyPDF (Document processing)
* **Database:** SQLite (Local storage)
* **Authentication:** Authlib (Google OAuth 2.0)
* **Deployment:** Render

---

## ⚙️ Local Installation

Follow these steps to run Zish.ai on your local machine.

### 1. Clone the Repository
```bash
git clone [https://github.com/Zish19/zish-ai-workspace.git](https://github.com/Zish19/zish-ai-workspace.git)
cd zish-ai-workspace
