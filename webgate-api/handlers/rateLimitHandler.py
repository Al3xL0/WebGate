import time
from fastapi import Request
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from state.memoryStore import anti_flood_events

async def rate_limit_exceeded_listener(request: Request, exc: RateLimitExceeded):
    source_ip = request.client.host if request.client else "unknown"

    anti_flood_events.append({
        "timestamp": time.time(),
        "source_ip": source_ip,
        "method": request.method,
        "path": request.url.path,
        "decision": "BLOCK",
        "status_code": 429,
        "reason": str(exc.detail),
        "policy": "slowapi_route_limit",
    })

    return JSONResponse(
        status_code=429,
        content={
            "error": "rate_limited",
            "reason": str(exc.detail),
            "source_ip": source_ip,
            "path": request.url.path,
        },
        headers={"Retry-After": "1"},
    )