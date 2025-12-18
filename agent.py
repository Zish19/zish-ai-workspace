import os
import base64
from io import BytesIO
from pypdf import PdfReader
from langchain_groq import ChatGroq
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.messages import HumanMessage, SystemMessage

# ======================================================
# 👇 PASTE YOUR KEYS HERE
# ======================================================
os.environ["GROQ_API_KEY"] = "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"
os.environ["TAVILY_API_KEY"] = "TAVILY_API_KEY"

# --- MODELS ---
# Main brain for chatting
llm_text = ChatGroq(model_name="llama-3.3-70b-versatile", temperature=0.6)
# Fast brain for naming chats
llm_fast = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0.5)
# Vision brain
llm_vision = ChatGroq(model_name="llama-3.2-11b-vision-preview", temperature=0.5)

tavily = TavilySearchResults(max_results=3)

def generate_title(prompt):
    """Generates a short 3-5 word title for the chat."""
    try:
        sys = SystemMessage(content="You are a summarization tool. Output ONLY a 3-5 word title for the user's prompt. No quotes, no intro.")
        human = HumanMessage(content=prompt)
        return llm_fast.invoke([sys, human]).content.strip()
    except:
        return "New Conversation"

def get_pdf_text(file_bytes):
    try:
        pdf_file = BytesIO(file_bytes)
        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        return f"Error reading PDF: {str(e)}"

def generate_response(user_input, file_bytes=None, file_type=None, history=[]):
    messages = []
    
    # --- 1. HANDLE FILES ---
    if file_bytes and file_type:
        if "pdf" in file_type or "text" in file_type:
            doc_text = get_pdf_text(file_bytes)
            user_input = f"User uploaded a document. Content:\n{doc_text[:6000]}\n\nUser Question: {user_input}"
        elif "image" in file_type:
            image_b64 = base64.b64encode(file_bytes).decode("utf-8")
            image_url = f"data:image/jpeg;base64,{image_b64}"
            msg = HumanMessage(content=[
                {"type": "text", "text": user_input or "Describe this image."},
                {"type": "image_url", "image_url": {"url": image_url}}
            ])
            return llm_vision.invoke([msg]).content

    # --- 2. SEARCH ---
    if any(k in user_input.lower() for k in ["news", "price", "search", "latest", "who is", "current"]):
        try:
            results = tavily.invoke({"query": user_input})
            context_str = "\n".join([r['content'] for r in results])
            user_input = f"Search Results: {context_str}\n\nQuestion: {user_input}"
        except:
            pass

    # --- 3. CHAT ---
    messages.append(SystemMessage(content="You are Zish, a helpful AI assistant."))
    for msg in history[-4:]:
        role = msg['role']
        content = msg['content']
        if role == 'user':
            messages.append(HumanMessage(content=content))
        else:
            messages.append(SystemMessage(content=content))

    messages.append(HumanMessage(content=user_input))

    try:
        return llm_text.invoke(messages).content
    except Exception as e:

        return f"Error: {str(e)}"

