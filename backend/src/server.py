from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from pydantic import BaseModel, Field
import http.client
import json
import logging
from math import radians, sin, cos, sqrt, atan2

logging.basicConfig(
    level=logging.INFO, 
    format="%(asctime)s %(levelname)s %(message)s", 
    datefmt="%d-%m-%Y %H:%M:%S",
    filename="logs.log",
)

# logging.debug('debug message')
# logging.info('info message')
# logging.warning('warning message')
# logging.error('error message')
# logging.critical('critical message')

app = FastAPI()
logging.info('Starting FastAPI service')

origins = [
    "http://localhost:3000",
    "https://aiven-cloud-selection.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

class Cloud(BaseModel):
    """Representation of a cloud fetched from Aiven's API."""
    
    cloud_description: str = Field(description="The cloud provider name and location.")
    cloud_name: str = Field(description="The official name of the cloud service.")
    geo_latitude: float = Field(description="The geographic latitude of the cloud.")
    geo_longitude: float = Field(description="The geographic longitude of the cloud.")
    geo_region: str = Field(description="The geographic continent where the cloud is located.")
    provider_description: str = Field(description="The cloud provider name.")
    provider: str = Field(description="The cloud provider name (in short).")
    cloud_id: int = Field(description="Internal backend dloud id generated upen fetching the data.")

class Provider:
    """Representation of a cloud provider fetched from Aiven's API."""

    value: str = Field(description="The cloud provider internal name.")
    label: str = Field(description="The label name of the cloud provider.")
    
    def __init__(self, value, label):
        self.value = value
        self.label = label

clouds = []
providers = []
fetched = False # is there a best practice for that?

def fetch_clouds() -> dict:
    logging.info('starting clouds fetch..')
    global clouds
    global providers
    global fetched
    if fetched: 
        logging.info('clouds have already been fetched')
        return {"fetched": clouds}
    
    logging.info('connecting to Aiven api')
    conn = http.client.HTTPSConnection("api.aiven.io")
    conn.request("GET", "/v1/clouds")
    res = conn.getresponse()
    logging.info('got the response back from Aiven Api')
    data = res.read().decode("utf-8")
    clouds_json = json.loads(data)
    
    errors_list = clouds_json.get("errors", [])
    if errors_list:
        logging.error('got errors back with the response')
        for error in errors_list: 
            raise HTTPException(status_code=error["status"], detail=error["message"])
            
    message = clouds_json.get("message", "")
    if message:
        logging.warning('got a message back with the response:', message)
    
    logging.info('Processing the recieved clouds..')
    clouds = [Cloud(**cloud, cloud_id=i) for i, cloud in enumerate(clouds_json.get("clouds", []))]
    
    logging.info('Collecting the cloud providers..')
    providers = [
        Provider(provider, provider.capitalize())
        for provider in {cloud.provider for cloud in clouds}
    ]
    providers.sort(key=lambda provider: provider.label)
    
    fetched = True
    logging.info('Clouds data fetch is over')
    return {"fetched": clouds}

# This code calculates the distance between two points on Earth's surface.
# The Haversine formula is based on the spherical law of cosines.
# This implementation is widely used in softwares and has been adapted from a stackoverflow discussion.
def haversine(lat1, lon1, lat2, lon2):
    r = 6371  # Radius of the Earth (in kilometers)
    d_lat = radians(lat2 - lat1)
    d_lon = radians(lon2 - lon1)
    a = sin(d_lat / 2) * sin(d_lat / 2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lon / 2) * sin(d_lon / 2)
    distance = r * 2 * atan2(sqrt(a), sqrt(1 - a))
    return distance

# implement
def sort_by_geolocation(user_latitude, user_longitude, clouds_list):
    logging.info('Sorting clouds by distance to the user')
    sorted_clouds = sorted(
        clouds_list,
        key=lambda cloud: haversine(
            user_latitude,
            user_longitude,
            cloud.geo_latitude,
            cloud.geo_longitude
    ))
    if len(sorted_clouds) != len(clouds_list): 
        logging.critical('Length of sorted clouds is not equal to length of original clouds list')
    return sorted_clouds

@app.get("/clouds/", responses={
        400: {"description": "Bad Request"},
    },)
async def get_clouds_list(
    providers_req: Optional[str] = Query(
        None,
        title="Providers", 
        description="List of strings specifying the providers to filter the clouds by.",
    ),
    sorted_by_geolocation: Optional[bool] = Query(
        title="Sort by geolocation",
        description="Sort the list of clouds by distance from the user, based on geolocation",
        default=None,
    ),
    user_latitude: Optional[float] = Query(
        title="Latitude",
        description="Latitude of the user location, for a sort based on geolocation",
        default=None,
    ),
    user_longitude: Optional[float] = Query(
        title="Longitude",
        description="Longitude of the user location, for a sort based on geolocation",
        default=None,
    ),
):
    logging.info('Getting clouds and providers')
    clouds_list = fetch_clouds()["fetched"]
    
    clouds_to_send = []
    if providers_req is None:
        clouds_to_send = clouds_list
    else:
        logging.info('filtering by the given list of providers')
        clouds_to_send = [cloud for cloud in clouds_list if cloud.provider in providers_req.split(",")]
    if sorted_by_geolocation:
        if not user_latitude or not user_longitude:
            raise HTTPException(status_code=400, detail="user latitude and/or longtitue are missing")
        clouds_to_send = sort_by_geolocation(user_latitude, user_longitude, clouds_to_send)
        
    return {"clouds": clouds_to_send, "providers": providers}

