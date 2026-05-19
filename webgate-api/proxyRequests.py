from proxyFunctions import * 
from Utils.validator import Validator
async def getRequestProxy(path: str, req: Request) -> Response:
    target_path = add_query_string(path, req)
    headers = build_proxy_request_headers(req)

    async with httpx.AsyncClient() as client:
        upstream_response = await client.get(
            target_path,
            headers=headers,
        )

    resp=build_proxy_response(upstream_response)
    return resp


async def postRequestProxy(path: str, req: Request) -> Response:
    # This is where your defense checks can run before forwarding the request.
    passedSecurity = True

    # POST forms send email/password in the body, not in URL params.
    body = await req.body()
    validator = Validator() 
    res = validator.validate(body)
    if not res : 
         body = 'email=%27&password=%27'

    headers = build_proxy_request_headers(req, include_content_type=True)

    async with httpx.AsyncClient() as client:
        upstream_response = await client.post(
            path,
            content=body,
            headers=headers
        )

    res = build_proxy_response(upstream_response)
    return res

def getHeaderFromRequest(req : Request, header: str):
    return header in req.headers if req.headers[header] else None