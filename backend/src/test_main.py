import pytest

from fastapi.testclient import TestClient

from .server import app


@pytest.fixture(name="client")
def fixture_client():
    return TestClient(app)


# def test_hello(client):
#     response = client.get("/api/hello")
#     assert response.status_code == 200
#     assert response.json() == {"message": "Hello world"}
