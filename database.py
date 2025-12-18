import sqlite3
import json
import uuid
from datetime import datetime

DB_NAME = "zish.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    # Updated: Added user_email column
    c.execute('''CREATE TABLE IF NOT EXISTS sessions 
                 (id TEXT PRIMARY KEY, title TEXT, user_email TEXT, created_at DATETIME)''')
    c.execute('''CREATE TABLE IF NOT EXISTS messages 
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT, 
                  role TEXT, content TEXT, image_data TEXT, created_at DATETIME)''')
    conn.commit()
    conn.close()

# Updated: Requires user_email
def create_session(title, user_email):
    session_id = str(uuid.uuid4())
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("INSERT INTO sessions VALUES (?, ?, ?, ?)", (session_id, title, user_email, datetime.now()))
    conn.commit()
    conn.close()
    return session_id

def save_message(session_id, role, content, image_data=None):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("INSERT INTO messages (session_id, role, content, image_data, created_at) VALUES (?, ?, ?, ?, ?)", 
              (session_id, role, content, image_data, datetime.now()))
    conn.commit()
    conn.close()

# Updated: Filters by email
def get_sessions(user_email):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT id, title FROM sessions WHERE user_email = ? ORDER BY created_at DESC", (user_email,))
    sessions = [{"id": row[0], "title": row[1]} for row in c.fetchall()]
    conn.close()
    return sessions

def get_history(session_id):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT role, content, image_data FROM messages WHERE session_id = ? ORDER BY id ASC", (session_id,))
    msgs = [{"role": row[0], "content": row[1], "image": row[2]} for row in c.fetchall()]
    conn.close()
    return msgs

def get_session_title(session_id):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT title FROM sessions WHERE id = ?", (session_id,))
    result = c.fetchone()
    conn.close()
    return result[0] if result else "New Chat"

def delete_session(session_id):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
    c.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
    conn.commit()
    conn.close()

init_db()