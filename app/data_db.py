import sqlite3

conn = sqlite3.connect("data.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS ip_data (
    ip TEXT PRIMARY KEY,
    tokens REAL,
    last_time REAL,
    country TEXT,
    region TEXT,
    city TEXT,
    latitude REAL,
    longitude REAL
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS session_ip_map (
    session_id TEXT PRIMARY KEY,
    ip TEXT,
    created_at REAL
)
""")

conn.commit()
conn.close()
