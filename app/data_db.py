# import sqlite3

# conn = sqlite3.connect("data.db")
# cursor = conn.cursor()

# cursor.execute("""
# CREATE TABLE IF NOT EXISTS ip_data (
#     ip TEXT PRIMARY KEY,
#     tokens REAL,
#     last_time REAL,
#     cooldown_until REAL,
#     country TEXT,
#     region TEXT,
#     city TEXT,
#     latitude REAL,
#     longitude REAL
# )
# """)

# cursor.execute("""
# CREATE TABLE IF NOT EXISTS session_ip_map (
#     session_id TEXT PRIMARY KEY,
#     ip TEXT,
#     created_at REAL
# )
# """)

# conn.commit()
# conn.close()


# ---- Updated Data db ----

import sqlite3

conn = sqlite3.connect("data.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS ip_data (
    ip TEXT PRIMARY KEY,
    request_count INTEGER,
    window_start REAL,
    cooldown_until REAL,
    daily_count INTEGER,
    daily_date TEXT,
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