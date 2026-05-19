from fastapi import Request, Response
import httpx


def build_proxy_response(upstream_response: httpx.Response) -> Response:
    # These are response headers from the webapp back to the browser.
    # location lets browser redirects work, and set-cookie lets login persist.
    headers = {}
    for header in ("location", "content-type", "set-cookie"):
        if header in upstream_response.headers:
            headers[header] = upstream_response.headers[header]

    return Response(
        content=upstream_response.content,
        status_code=upstream_response.status_code,
        headers=headers,
    )


def build_proxy_request_headers(req: Request, include_content_type: bool = False) -> dict:
    # These are request headers from the browser that the webapp may need.
    # cookie is what lets /dashboard know the user is already logged in.
    headers = {}

    if include_content_type and "content-type" in req.headers:
        headers["content-type"] = req.headers["content-type"]

    if "cookie" in req.headers:
        headers["cookie"] = req.headers["cookie"]

    if "user-agent" in req.headers:
        headers["user-agent"] = req.headers["user-agent"]
    return headers


def add_query_string(path: str, req: Request) -> str:
    # Preserve query params such as /login?notice=... or /customers?q=Acme.
    if req.url.query:
        return f"{path}?{req.url.query}"
    return path


