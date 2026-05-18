from fastapi import FastAPI, Request, Response
import httpx
from proxyFunctions import getRequestProxy
app = FastAPI()

targetUrl = "http://webapp:3000/"



@app.get("/styles.css")
async def proxy_css(req : Request):
    path = f"{targetUrl}styles.css"
    res = await getRequestProxy(path)
    return res


@app.get("/")
async def proxyHome(request: Request):
    res = await getRequestProxy(targetUrl)
    return res


@app.get("/login")
async def proxyGetLogin(request: Request):
    path = f"{targetUrl}login"
    res = await getRequestProxy(path)
    return res

@app.get("/dashboard")
async def proxyGetDashbaord(req : Request):
    path = f"{targetUrl}dashboard"
    res = await getRequestProxy(path)
    return res


# use this to login 
@app.post("/login/")
def proxyLogin(username: Annotated[str, Form()], password: Annotated[str, Form()]):
    pass