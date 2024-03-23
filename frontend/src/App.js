import React, { useState, useEffect } from "react";
import api from "./api";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  const [clouds, setClouds] = useState([]);
  const [allProviders, setAllProviders] = useState([]);
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [userLatitude, setUserLatitude] = useState(null);
  const [userLongitude, setUserLongitude] = useState(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [showLocationAlert, setShowLocationAlert] = useState(false);

  const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationPermission(true);
        setUserLatitude(position.coords.latitude);
        setUserLongitude(position.coords.longitude);
      },
      (error) => {
        setShowLocationAlert(true);
        // console.error("Error getting user location:", error);
      }
    );
  };

  const fetchData = async (providers = allProviders, sort = false) => {
    try {
      const reqParams = {};
      if (providers.length > 0)
        reqParams["providers_req"] = providers
          .map((item) => item.value)
          .join(",");
      if (sort) {
        reqParams["sorted_by_geolocation"] = sort;
        reqParams["user_latitude"] = userLatitude;
        reqParams["user_longitude"] = userLongitude;
      }
      const response = await api.get("/clouds/", { params: reqParams });
      setClouds(response.data.clouds);
      if (providers.length == 0) setAllProviders(response.data.providers);
      setAllProviders(response.data.providers);
    } catch (error) {
      console.error("Error fetching clouds:", error);
    }
  };

  const handleProviderSelect = (selectedOptions) => {
    setSelectedProviders(selectedOptions.length > 0 ? selectedOptions : []);
    fetchData(
      selectedOptions.length > 0 ? selectedOptions : allProviders,
      sortByDistance
    );
  };

  const handleAlertClose = () => setShowLocationAlert(false);

  const handleSortToggleChange = () => {
    fetchData(
      selectedProviders.length > 0 ? selectedProviders : allProviders,
      !sortByDistance
    );
    setSortByDistance(!sortByDistance);
  };

  useEffect(() => {
    getUserLocation();
    fetchData();
  }, []);

  return (
    <div>
      <nav className="navbar navbar-dark bg-primary">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            Aiven Cloud Selection
          </a>
        </div>
      </nav>
      <div className="container mt-4">
        <h1 className="mb-4">Clouds</h1>

        {allProviders.length > 0 && (
          <Select
            options={allProviders}
            isMulti
            value={selectedProviders}
            onChange={(selectedOptions) =>
              handleProviderSelect(selectedOptions)
            }
            placeholder="Select Providers..."
          />
        )}

        <div className="my-2">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="sortToggle"
              disabled={!locationPermission}
              checked={sortByDistance}
              onChange={handleSortToggleChange}
            />
            <label className="form-check-label" htmlFor="sortToggle">
              Sort by Distance
            </label>
          </div>
          {showLocationAlert && (
            <div
              className="alert alert-warning alert-dismissible fade show"
              role="alert"
            >
              Your <strong>location permission</strong> is needed for the sort
              by geolocation feature.
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={handleAlertClose}
              ></button>
            </div>
          )}
        </div>

        {clouds ? (
          <div className="row">
            {clouds.map((cloud, index) => (
              <div className="col-md-4 mb-4" key={index}>
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{cloud.cloud_name}</h5>
                    <p className="card-text">{cloud.cloud_description}</p>
                    <p className="card-text">Latitude: {cloud.geo_latitude}</p>
                    <p className="card-text">
                      Longitude: {cloud.geo_longitude}
                    </p>
                    <p className="card-text">Region: {cloud.geo_region}</p>
                    <p className="card-text">Provider: {cloud.provider}</p>
                    <p className="card-text">
                      Provider Description: {cloud.provider_description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default App;
