from fastapi import Request, Response
import httpx

def build_proxy_response(upstream_response: httpx.Response) -> Response:
    headers = {}
    for header in ("location", "content-type", "set-cookie"):
        if header in upstream_response.headers:
            headers[header] = upstream_response.headers[header]

    return Response(
        content=upstream_response.content,
        status_code=upstream_response.status_code,
        headers=headers,
    )
    
async def getRequestProxy(path:str) -> Response:
    async with httpx.AsyncClient() as client:
        upstream_response = await client.get(f"{path}")
    resp=build_proxy_response(upstream_response)
    print(dict(resp.headers))
    return resp

async def postRequestProxy(path:str) -> Response:
     # defense mechanism 
     passedSecurity = True 
     async with httpx.AsyncClient() as client:
          upstream_response = await client.post(f"{path}")
     res = build_proxy_response(upstream_response)
     print(dict(res.headers))
     return res