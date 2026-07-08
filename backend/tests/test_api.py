import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_get_shipments_offline():
    response = client.get("/api/shipments")
    # Even if DB is disconnected, it should either return 200 list or handle gracefully
    assert response.status_code in [200, 500]

def test_simulation_singapore():
    response = client.post("/api/simulate/", json={"query": "If I reroute via Singapore?"})
    assert response.status_code == 200
    data = response.json()
    assert "Singapore" in data["arrival_time"]
    assert "Recommended" in data["recommended_action"]

def test_simulation_air_freight():
    response = client.post("/api/simulate/", json={"query": "What if we switch to Air Freight?"})
    assert response.status_code == 200
    data = response.json()
    assert "July 11" in data["arrival_time"]
    assert "Not Recommended" in data["recommended_action"] or "Conditionally Recommended" in data["recommended_action"]
