from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from pydantic import BaseModel, Field
import http.client
import json
from math import radians, sin, cos, sqrt, atan2
app = FastAPI()

origins = [
    "http://localhost:3000",
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
    global clouds
    global providers
    global fetched
    if fetched: return {"fetched": clouds}
    
    conn = http.client.HTTPSConnection("api.aiven.io")
    conn.request("GET", "/v1/clouds")
    res = conn.getresponse()
    data = res.read().decode("utf-8")
    clouds_json = json.loads(data)
    
    errors_list = clouds_json.get("errors", []) # Handle if errors exist
    message = clouds_json.get("message", "") # Handle message if exists
    
    clouds = [Cloud(**cloud, cloud_id=i) for i, cloud in enumerate(clouds_json.get("clouds", []))]
    providers = [
        Provider(provider, provider.capitalize())
        for provider in {cloud.provider for cloud in clouds}
    ]
    providers.sort(key=lambda provider: provider.label)
    
    fetched = True
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
    return sorted(
        clouds_list,
        key=lambda cloud: haversine(
            user_latitude,
            user_longitude,
            cloud.geo_latitude,
            cloud.geo_longitude
        )
    )

@app.get("/clouds/")
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
    clouds_list = fetch_clouds()["fetched"]
    
    clouds_to_send = []
    if providers_req is None:
        clouds_to_send = clouds_list
    else:
        clouds_to_send = [cloud for cloud in clouds_list if cloud.provider in providers_req.split(",")]
    if sorted_by_geolocation:
        clouds_to_send = sort_by_geolocation(user_latitude, user_longitude, clouds_to_send)
        
    return {"clouds": clouds_to_send, "providers": providers}

