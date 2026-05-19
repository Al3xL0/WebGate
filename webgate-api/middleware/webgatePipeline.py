import time
from fastapi import Request
from fastapi.responses import PlainTextResponse
from security.userAgents import detectUserAgent
from state.memoryStore import traffic_events, waf_events
from datetime import datetime
async def webgatePipeline(request: Request, call_next):
    start = time.perf_counter()

    source_ip = request.client.host if request.client else "unknown"
    method = request.method
    path = request.url.path
    user_agent = request.headers.get("user-agent", "")

    waf_action = "ALLOW"
    waf_reason = None
    triggered_rule = None

    user_agent_finding = detectUserAgent(user_agent)

    if user_agent_finding:
        waf_action = "BLOCK"
        waf_reason = user_agent_finding["reason"]
        triggered_rule = user_agent_finding["rule"]
        severity = user_agent_finding["severity"]
        response = PlainTextResponse("Forbidden", status_code=403)

        waf_events.append({
            "timestamp": datetime.now().time(),
            "source_ip": source_ip,
            "method": method,
            "path": path,
            "user_agent": user_agent,
            "decision": "BLOCK",
            "status_code": 403,
            "rule": triggered_rule,
            "reason": waf_reason,
            "severity": severity
        })

    else:
        response = await call_next(request)

    latency_ms = round((time.perf_counter() - start) * 1000, 2)

    traffic_events.append({
        "timestamp": datetime.now().time(), # swap to datetime
        "source_ip": source_ip,
        "method": method,
        "path": path,
        "user_agent": user_agent,
        "status_code": response.status_code,
        "latency_ms": latency_ms,
        "waf_action": waf_action,
        "waf_reason": waf_reason,
        "triggered_rule": triggered_rule,
        "rate_limit_limit": response.headers.get("X-RateLimit-Limit"),
        "rate_limit_remaining": response.headers.get("X-RateLimit-Remaining"),
        "rate_limit_reset": response.headers.get("X-RateLimit-Reset"),
    })

    return response