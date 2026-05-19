from core.config import BLOCKED_USER_AGENTS


def detectUserAgent(userAgent: str) -> dict | None:
     lowerUserAgent = userAgent.lower()
     for blockedAgent in BLOCKED_USER_AGENTS:
          if blockedAgent in lowerUserAgent:
               return {
                    "rule":"WAF-UA-BLOCKED",
                    "reason":"Forbidden User-Agent",
                    "user-agent": userAgent,
                    "severity": "High"
               }
     return None