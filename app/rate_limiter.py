# import time
# import sqlite3
# import threading
# from fastapi import Request, HTTPException
# from ip2geotools.databases.noncommercial import DbIpCity

# REQUESTS_PER_MIN = 10
# COOLDOWN_SECONDS = 300   # Minimum wait (5-mins) after exhausting tokens
# lock = threading.Lock()

# def get_location(ip):
#     try:
#         res = DbIpCity.get(ip, api_key="free")
#         return res.country, res.region, res.city, res.latitude, res.longitude
#     except:
#         return "Unknown", "Unknown", "Unknown", None, None


# def get_db():
#     return sqlite3.connect("data.db", check_same_thread=False)


# def is_ip_in_cooldown(ip: str) -> bool:
#     """Check if IP is in cooldown period (exhausted tokens recently)."""
#     conn = get_db()
#     cursor = conn.cursor()
#     cursor.execute("SELECT tokens, last_time, cooldown_until FROM ip_data WHERE ip=?", (ip,))
#     row = cursor.fetchone()
#     conn.close()
    
#     if row is None:
#         return False
    
#     tokens, last_time, cooldown_until = row
#     now = time.time()
    
#     # Check if still in cooldown
#     if cooldown_until and now < cooldown_until:
#         return True
    
#     return False

# #--- Old Rate Limiter-----
# # def rate_limiter():
# #     async def middleware(request: Request):
# #         ip = request.client.host
# #         now = time.time()

# #         with lock:
# #             conn = get_db()
# #             cursor = conn.cursor()

# #             # Get row for this IP
# #             cursor.execute("SELECT tokens, last_time FROM ip_data WHERE ip=?", (ip,))
# #             row = cursor.fetchone()

# #             # If first time seeing this IP → insert it
# #             if row is None:
# #                 country, region, city, lat, lon = get_location(ip)
# #                 cursor.execute("""
# #                     INSERT INTO ip_data (ip, tokens, last_time, country, region, city, latitude, longitude)
# #                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
# #                 """, (ip, REQUESTS_PER_MIN, now, country, region, city, lat, lon))
# #                 conn.commit()
# #                 tokens = REQUESTS_PER_MIN
# #                 last_time = now
# #             else:
# #                 tokens, last_time = row

# #             # Refill tokens
# #             elapsed = now - last_time
# #             refill_rate = REQUESTS_PER_MIN / 60
# #             tokens += elapsed * refill_rate
# #             if tokens > REQUESTS_PER_MIN:
# #                 tokens = REQUESTS_PER_MIN

# #             # Block if no tokens left
# #             if tokens < 1:
# #                 conn.close()
# #                 raise HTTPException(429, "Rate limit exceeded. Try again later.")

# #             # Consume one token
# #             tokens -= 1

# #             # Update database
# #             cursor.execute("UPDATE ip_data SET tokens=?, last_time=? WHERE ip=?", (tokens, now, ip))
# #             conn.commit()
# #             conn.close()

# #         return None

# #     return middleware

# def rate_limiter():
#     async def middleware(request: Request):
#         ip = request.client.host
#         now = time.time()

#         with lock:
#             conn = get_db()
#             cursor = conn.cursor()

#             cursor.execute("SELECT tokens, last_time, cooldown_until FROM ip_data WHERE ip=?", (ip,))
#             row = cursor.fetchone()

#             if row is None:
#                 country, region, city, lat, lon = get_location(ip)
#                 cursor.execute("""
#                     INSERT INTO ip_data (ip, tokens, last_time, cooldown_until, country, region, city, latitude, longitude)
#                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
#                 """, (ip, REQUESTS_PER_MIN, now, None, country, region, city, lat, lon))
#                 conn.commit()
#                 conn.close()
#                 return None
            
#             tokens, last_time, cooldown_until = row

#             # Check cooldown first
#             if cooldown_until and now < cooldown_until:
#                 remaining = int(cooldown_until - now)
#                 mins, secs = divmod(remaining, 60)
#                 conn.close()
#                 raise HTTPException(
#                     429, 
#                     f"⏳ Rate limit exceeded. Please wait for {mins} min {secs} sec before trying again."
#                 )

#             # Refill tokens
#             elapsed = now - last_time
#             refill_rate = REQUESTS_PER_MIN / 60
#             tokens += elapsed * refill_rate
#             if tokens > REQUESTS_PER_MIN:
#                 tokens = REQUESTS_PER_MIN

#             # Block and set cooldown if no tokens
#             if tokens < 1:
#                 cooldown_until = now + COOLDOWN_SECONDS
#                 cursor.execute("UPDATE ip_data SET tokens=?, last_time=?, cooldown_until=? WHERE ip=?", 
#                              (0, now, cooldown_until, ip))
#                 conn.commit()
#                 conn.close()
#                 raise HTTPException(429, f"⏳ Rate limit exceeded. Please wait for 5 minutes before trying again.")

#             # Consume one token, clear cooldown
#             tokens -= 1
#             cursor.execute("UPDATE ip_data SET tokens=?, last_time=?, cooldown_until=? WHERE ip=?", 
#                          (tokens, now, None, ip))
#             conn.commit()
#             conn.close()

#         return None

#     return middleware


# ---- Updated RL -----

import time
import sqlite3
import threading
from datetime import datetime
from fastapi import Request, HTTPException
from ip2geotools.databases.noncommercial import DbIpCity

# Rate limit settings
REQUESTS_PER_WINDOW = 5
WINDOW_SECONDS = 60
COOLDOWN_SECONDS = 900

# Daily limits
DAILY_LIMIT_PER_IP = 50
GLOBAL_DAILY_LIMIT = 500

lock = threading.Lock()


def get_location(ip):
    try:
        res = DbIpCity.get(ip, api_key="free")
        return res.country, res.region, res.city, res.latitude, res.longitude
    except:
        return "Unknown", "Unknown", "Unknown", None, None


def get_db():
    return sqlite3.connect("data.db", check_same_thread=False)


def get_global_usage(cursor, today):
    """Get total requests across all IPs for today."""
    cursor.execute("SELECT SUM(daily_count) FROM ip_data WHERE daily_date=?", (today,))
    row = cursor.fetchone()
    return row[0] if row[0] else 0


def is_ip_in_cooldown(ip: str) -> bool:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT cooldown_until FROM ip_data WHERE ip=?", (ip,))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        return False

    cooldown_until = row[0]
    now = time.time()

    if cooldown_until and now < cooldown_until:
        return True

    return False


def rate_limiter():
    async def middleware(request: Request):
        ip = request.client.host
        now = time.time()
        today = datetime.utcnow().strftime("%Y-%m-%d")

        with lock:
            conn = get_db()
            cursor = conn.cursor()

            # Check global limit FIRST (DDoS protection)
            global_usage = get_global_usage(cursor, today)
            if global_usage >= GLOBAL_DAILY_LIMIT:
                conn.close()
                raise HTTPException(
                    503, 
                    f"🛑 Service temporarily unavailable due to high demand. Please try again tomorrow."
                )

            cursor.execute("""
                SELECT request_count, window_start, cooldown_until, daily_count, daily_date 
                FROM ip_data WHERE ip=?
            """, (ip,))
            row = cursor.fetchone()

            # New IP
            if row is None:
                country, region, city, lat, lon = get_location(ip)
                cursor.execute("""
                    INSERT INTO ip_data (ip, request_count, window_start, cooldown_until, daily_count, daily_date, country, region, city, latitude, longitude)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (ip, 1, now, None, 1, today, country, region, city, lat, lon))
                conn.commit()
                conn.close()
                return None

            request_count, window_start, cooldown_until, daily_count, daily_date = row

            # Check cooldown
            if cooldown_until and now < cooldown_until:
                remaining = int(cooldown_until - now)
                mins, secs = divmod(remaining, 60)
                conn.close()
                raise HTTPException(429, f"⏳ Rate limit exceeded. Please wait for {mins} min {secs} sec.")

            # Reset daily count if new day
            if daily_date != today:
                daily_count = 0
                daily_date = today

            # Check per-IP daily limit
            if daily_count >= DAILY_LIMIT_PER_IP:
                conn.close()
                raise HTTPException(429, f"🚫 Daily limit reached ({DAILY_LIMIT_PER_IP} requests). Try again tomorrow.")

            # Check window (burst protection)
            if now - window_start >= WINDOW_SECONDS:
                request_count = 1
                window_start = now
            else:
                request_count += 1

            # Check burst limit
            if request_count > REQUESTS_PER_WINDOW:
                cooldown_until = now + COOLDOWN_SECONDS
                cursor.execute("""
                    UPDATE ip_data 
                    SET request_count=?, window_start=?, cooldown_until=?, daily_count=?, daily_date=? 
                    WHERE ip=?
                """, (request_count, window_start, cooldown_until, daily_count, daily_date, ip))
                conn.commit()
                conn.close()
                raise HTTPException(429, f"⏳ Too many requests. Please wait for 15 minutes.")

            # Update counts
            daily_count += 1
            cursor.execute("""
                UPDATE ip_data 
                SET request_count=?, window_start=?, daily_count=?, daily_date=? 
                WHERE ip=?
            """, (request_count, window_start, daily_count, daily_date, ip))
            conn.commit()
            conn.close()

        return None

    return middleware