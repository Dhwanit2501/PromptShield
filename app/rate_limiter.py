import time
import sqlite3
import threading
from fastapi import Request, HTTPException
from ip2geotools.databases.noncommercial import DbIpCity

REQUESTS_PER_MIN = 10
lock = threading.Lock()

def get_location(ip):
    try:
        res = DbIpCity.get(ip, api_key="free")
        return res.country, res.region, res.city, res.latitude, res.longitude
    except:
        return "Unknown", "Unknown", "Unknown", None, None


def get_db():
    return sqlite3.connect("data.db", check_same_thread=False)


def rate_limiter():
    async def middleware(request: Request):
        ip = request.client.host
        now = time.time()

        with lock:
            conn = get_db()
            cursor = conn.cursor()

            # Get row for this IP
            cursor.execute("SELECT tokens, last_time FROM ip_data WHERE ip=?", (ip,))
            row = cursor.fetchone()

            # If first time seeing this IP → insert it
            if row is None:
                country, region, city, lat, lon = get_location(ip)
                cursor.execute("""
                    INSERT INTO ip_data (ip, tokens, last_time, country, region, city, latitude, longitude)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (ip, REQUESTS_PER_MIN, now, country, region, city, lat, lon))
                conn.commit()
                tokens = REQUESTS_PER_MIN
                last_time = now
            else:
                tokens, last_time = row

            # Refill tokens
            elapsed = now - last_time
            refill_rate = REQUESTS_PER_MIN / 60
            tokens += elapsed * refill_rate
            if tokens > REQUESTS_PER_MIN:
                tokens = REQUESTS_PER_MIN

            # Block if no tokens left
            if tokens < 1:
                conn.close()
                raise HTTPException(429, "Rate limit exceeded. Try again later.")

            # Consume one token
            tokens -= 1

            # Update database
            cursor.execute("UPDATE ip_data SET tokens=?, last_time=? WHERE ip=?", (tokens, now, ip))
            conn.commit()
            conn.close()

        return None

    return middleware
