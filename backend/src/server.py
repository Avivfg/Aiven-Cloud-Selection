from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from pydantic import BaseModel, Field
import http.client
import json

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

clouds = []
providers = []
fetched = False # is there a best practice for that?

def fetch_clouds() -> dict:
    global clouds
    global providers
    global fetched
    if fetched: 
        return {"fetched": clouds}
    
    conn = http.client.HTTPSConnection("api.aiven.io")
    conn.request("GET", "/v1/clouds")
    res = conn.getresponse()
    data = res.read().decode("utf-8")
    clouds_json = json.loads(data)
    
    errors_list = clouds_json.get("errors", []) # Handle if errors exist
    message = clouds_json.get("message", "") # Handle message if exists
    
    clouds = clouds_json.get("clouds", [])
    providers = [
        {"value": provider, "label": provider.capitalize()} 
        for provider in {cloud["provider"] for cloud in clouds}
    ]
    providers.sort(key=lambda x: x["label"])

    print (providers)
    fetched = True
    return {"fetched": clouds}
        
# implement
def sort_by_geolocation(clouds_list):
    return clouds_list

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
):
    clouds_list = fetch_clouds()["fetched"]
    
    clouds_to_send = []
    if providers_req is None:
        clouds_to_send = clouds_list
    else:
        clouds_to_send = [cloud for cloud in clouds_list if cloud["provider"] in providers_req.split(",")]
    
    if sorted_by_geolocation:
        clouds_to_send = sort_by_geolocation(clouds_to_send)
    
    
        
    return {"clouds": clouds_to_send, "providers": providers}