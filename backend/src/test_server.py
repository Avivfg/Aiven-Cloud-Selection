import pytest

from fastapi.testclient import TestClient

from .server import app, haversine


@pytest.fixture(name="client")
def fixture_client():
    return TestClient(app)


def test_hello(client):
    response = client.get("/api/hello")
    assert response.status_code == 404
    assert response.json() == {'detail': 'Not Found'}
    
    
def test_get_clouds(client):
    response = client.get("/clouds/")
    # test status
    assert response.status_code == 200
    # test keys
    keys = list(response.json().keys())
    assert keys == ['clouds', 'providers']
    
    clouds = response.json()['clouds']
    providers = response.json()['providers']
    
    # test clouds
    assert all(cloud["cloud_description"] for cloud in clouds)
    assert all(cloud["cloud_name"] for cloud in clouds)
    assert all(isinstance(cloud["geo_latitude"], float) for cloud in clouds)
    assert all(isinstance(cloud["geo_longitude"], float) for cloud in clouds)
    assert all(cloud["geo_region"] for cloud in clouds)
    assert all(cloud["provider_description"] for cloud in clouds)
    assert all(cloud["provider"] in [ provider['value'] for provider in providers ] \
        for cloud in clouds)
    assert all(cloud["cloud_id"] >= 0 for cloud in clouds)
    # test providers
    assert all(provider["value"] for provider in providers)
    assert all(provider["label"] for provider in providers)
    
def test_get_filtered_clouds(client):
    wanted_providers = "aws,google"
    response = client.get("/clouds/", params={"providers_req": wanted_providers})
    # test status
    assert response.status_code == 200
    # test keys
    keys = list(response.json().keys())
    assert keys == ['clouds', 'providers']
    
    clouds = response.json()['clouds']
    # test filtered providers
    assert all(cloud["provider"] in wanted_providers for cloud in clouds)

def test_get_filtered_clouds_2(client):
    response = client.get("/clouds/", params={"providers_req": []})
    # test status
    assert response.status_code == 200
    
def test_get_sorted_clouds(client):
    user_latitude = 1.1
    user_longitude = 1.1
    response = client.get("/clouds/", params={
        "sorted_by_geolocation": True,
        "user_latitude": user_latitude,
        "user_longitude": user_longitude
    })
    # test status
    assert response.status_code == 200
    # test keys
    keys = list(response.json().keys())
    assert keys == ['clouds', 'providers']
    
    clouds = response.json()['clouds']
    providers = response.json()['providers']
    previous_distance = 0
    for cloud in clouds:
        distance = haversine( user_latitude, user_longitude, \
            cloud["geo_latitude"], cloud["geo_longitude"])
        assert distance >= previous_distance
        previous_distance = distance
        
def test_get_sorted_clouds_wrong_arguments(client):
    user_latitude = None
    user_longitude = None
    response = client.get("/clouds/", params={
        "sorted_by_geolocation": True,
        "user_latitude": user_latitude,
        "user_longitude": user_longitude
    })
    # test status
    assert response.status_code == 422
    
def test_get_sorted_clouds_wrong_arguments_missing_location_1(client):

    response = client.get("/clouds/", params={"sorted_by_geolocation": True})
    # test status
    assert response.status_code == 400
    
def test_get_sorted_clouds_wrong_arguments_missing_location_2(client):

    response = client.get("/clouds/", params={
        "sorted_by_geolocation": True, 
        "user_latitude":1.1})
    # test status
    assert response.status_code == 400
    
def test_get_sorted_clouds_wrong_arguments_missing_location_2(client):

    response = client.get("/clouds/", params={
        "sorted_by_geolocation": True, 
        "user_longitude":1.1
    })
    # test status
    assert response.status_code == 400
    
def test_get_sorted_filtered_clouds(client):
    user_latitude = 1.1
    user_longitude = 1.1
    wanted_providers = "azure,do"
    response = client.get("/clouds/", params={
        "providers_req": wanted_providers,
        "sorted_by_geolocation": True,
        "user_latitude": user_latitude,
        "user_longitude": user_longitude
    })
    # test status
    assert response.status_code == 200