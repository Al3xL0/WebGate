from fastapi import APIRouter
from state.memoryStore import traffic_events, anti_flood_events, waf_events

router = APIRouter(prefix="/api")

@router.get("/traffic")
def get_traffic():
    return traffic_events


@router.get("/badTraffic")
def get_bad_traffic():
    return anti_flood_events


@router.get("/waf-events")
def get_waf_events():
    return waf_events