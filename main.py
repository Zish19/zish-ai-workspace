import os
from fastapi import FastAPI, Request, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse, RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth
import database as db
import agent

# --- CONFIG ---
GOOGLE_CLIENT_ID = "369710183064-398uss04ubg7sjgv23kk2b39hr03q1ti.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET = "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"
SECRET_KEY = "zish_secret_key"

if not os.path.exists("static"): os.makedirs("static")
if not os.path.exists("templates"): os.makedirs("templates")

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")
db.init_db()

oauth = OAuth()
oauth.register(
    name='google',
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

def get_user_email(request: Request):
    user = request.session.get('user')
    if user:
        return user.get('email')
    return "guest"

@app.get("/")
async def home(request: Request):
    user = request.session.get('user')
    return templates.TemplateResponse("index.html", {"request": request, "user": user})

@app.get("/login")
async def login(request: Request):
    redirect_uri = request.url_for('auth')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get("/auth")
async def auth(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)
        request.session['user'] = token.get('userinfo')
    except Exception as e:
        print(f"Login Error: {e}")
    return RedirectResponse(url='/')

@app.get("/logout")
async def logout(request: Request):
    request.session.pop('user', None)
    return RedirectResponse(url='/')

@app.get("/api/sessions")
async def get_sessions(request: Request):
    email = get_user_email(request)
    return db.get_sessions(email)

@app.get("/api/history/{session_id}")
async def get_history(session_id: str):
    return db.get_history(session_id)

@app.delete("/api/chat/{session_id}")
async def delete_chat(session_id: str):
    db.delete_session(session_id)
    return {"status": "ok"}

@app.post("/api/chat")
async def chat(request: Request, session_id: str = Form(...), message: str = Form(...), file: UploadFile = File(None)):
    email = get_user_email(request)
    
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

