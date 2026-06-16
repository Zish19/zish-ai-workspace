import os
import sys
import traceback
from werkzeug.security import generate_password_hash, check_password_hash
from fastapi import FastAPI, Request, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.sessions import SessionMiddleware
from api import database as db
from api import agent

app = FastAPI()

SECRET_KEY = "zish_secret_key"

# Allow CORS for Next.js in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://zish-ai-workspace.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

@app.on_event("startup")
async def startup_event():
    db.init_db()

def get_user_email(request: Request):
    user = request.session.get('user')
    if user:
        return user.get('email')
    return None

def hash_password(password: str) -> str:
    return generate_password_hash(password)

def verify_password(password: str, hashed: str) -> bool:
    try:
        return check_password_hash(hashed, password)
    except Exception:
        return False

# Authentication Endpoints
@app.post("/auth/signup")
async def signup(name: str = Form(...), email: str = Form(...), password: str = Form(...)):
    email = email.lower().strip()
    if db.get_user(email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = hash_password(password)
    if db.create_user(name, email, hashed):
        return {"status": "ok", "message": "User registered successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to create user")

@app.post("/auth/login")
async def login(request: Request, email: str = Form(...), password: str = Form(...)):
    email = email.lower().strip()
    user = db.get_user(email)
    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    request.session['user'] = {
        "name": user["name"],
        "email": user["email"]
    }
    return {"status": "ok", "user": {"name": user["name"], "email": user["email"]}}

@app.post("/auth/logout")
async def logout(request: Request):
    request.session.pop('user', None)
    return {"status": "ok"}

@app.get("/auth/me")
async def me(request: Request):
    user = request.session.get('user')
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"user": user}

# Chat Endpoints (Authenticated)
@app.get("/sessions")
async def get_sessions(request: Request):
    email = get_user_email(request)
    if not email:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return db.get_sessions(email)

@app.get("/history/{session_id}")
async def get_history(request: Request, session_id: str):
    email = get_user_email(request)
    if not email:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return db.get_history(session_id)

@app.delete("/chat/{session_id}")
async def delete_chat(request: Request, session_id: str):
    email = get_user_email(request)
    if not email:
        raise HTTPException(status_code=401, detail="Not authenticated")
    db.delete_session(session_id)
    return {"status": "ok"}

@app.post("/chat")
async def chat(
    request: Request, 
    session_id: str = Form(...), 
    message: str = Form(...), 
    file: UploadFile = File(None)
):
    email = get_user_email(request)
    if not email:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if session_id == "new":
        title = agent.generate_title(message)
        session_id = db.create_session(title, email)
    
    file_bytes = await file.read() if file else None
    file_type = file.content_type if file else None
    
    db.save_message(session_id, "user", message)
    history = db.get_history(session_id)
    ai_response = agent.generate_response(message, file_bytes, file_type, history)
    db.save_message(session_id, "ai", ai_response)

    return JSONResponse({
        "session_id": session_id, 
        "response": ai_response,
        "title": db.get_session_title(session_id) 
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
