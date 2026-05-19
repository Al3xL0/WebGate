from fastapi import APIRouter, Request
from core.config import TARGET_URL
from core.limiter import limiter
from proxyRequests import getRequestProxy, postRequestProxy

router = APIRouter()

@router.get("/styles.css")
async def proxy_css(request: Request):
    return await getRequestProxy(f"{TARGET_URL}styles.css", request)


@router.get("/")
@limiter.limit("2/second", per_method=True)
async def proxy_home(request: Request):
    return await getRequestProxy(TARGET_URL, request)


@router.get("/login")
@limiter.limit("3/second", per_method=True)
async def proxy_get_login(request: Request):
    return await getRequestProxy(f"{TARGET_URL}login", request)


@router.post("/login")
@limiter.limit("2/second", per_method=True)
async def proxy_login(request: Request):
    return await postRequestProxy(f"{TARGET_URL}login", request)


@router.post("/logout")
async def proxy_logout(request: Request):
    return await postRequestProxy(f"{TARGET_URL}logout", request)


@router.get("/dashboard")
@limiter.limit("2/second", per_method=True)
async def proxy_get_dashboard(request: Request):
    return await getRequestProxy(f"{TARGET_URL}dashboard", request)


@router.get("/customers")
@limiter.limit("2/second", per_method=True)
async def proxy_get_customers(request: Request):
    return await getRequestProxy(f"{TARGET_URL}customers", request)


@router.get("/invoices")
@limiter.limit("2/second", per_method=True)
async def proxy_get_invoices(request: Request):
    return await getRequestProxy(f"{TARGET_URL}invoices", request)


@router.get("/tickets")
@limiter.limit("2/second", per_method=True)
async def proxy_get_tickets(request: Request):
    return await getRequestProxy(f"{TARGET_URL}tickets", request)


@router.get("/documents")
@limiter.limit("2/second", per_method=True)
async def proxy_get_documents(request: Request):
    return await getRequestProxy(f"{TARGET_URL}documents", request)


@router.get("/download")
@limiter.limit("2/second", per_method=True)
async def proxy_get_download(request: Request):
    return await getRequestProxy(f"{TARGET_URL}download", request)


@router.get("/admin")
@limiter.limit("2/second", per_method=True)
async def proxy_admin_page(request: Request):
    return await getRequestProxy(f"{TARGET_URL}admin", request)


@router.post("/admin/ping")
@limiter.limit("2/second", per_method=True)
async def proxy_admin_ping(request: Request):
    return await postRequestProxy(f"{TARGET_URL}admin/ping", request)