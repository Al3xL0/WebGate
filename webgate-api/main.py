from fastapi import FastAPI
from slowapi.errors import RateLimitExceeded

from core.limiter import limiter
from middleware.webgatePipeline import webgatePipeline
from handlers.rateLimitHandler import rate_limit_exceeded_listener
from routers import proxy_routes, api_routes

app = FastAPI()

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_listener)

app.middleware("http")(webgatePipeline)

app.include_router(api_routes.router)
app.include_router(proxy_routes.router)