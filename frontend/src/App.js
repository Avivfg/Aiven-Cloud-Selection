import React, { useState, useEffect } from "react";
import api from "./api";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
// import { useHistory } from "react-router-dom";

const App = () => {
  const [clouds, setClouds] = useState([]);
  const [allProviders, setAllProviders] = useState([]);
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [userLatitude, setUserLatitude] = useState(null);
  const [userLongitude, setUserLongitude] = useState(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [selectedClouds, setSelectedClouds] = useState([]); // IDs
  const [selectedPresentedClouds, setSelectedPresentedClouds] = useState([]); // IDs
  // const history = useHistory();

  useEffect(() => {
    getUserLocation();
    fetchData();
  }, []);

  useEffect(() => {
    updateSelectedPresentedClouds();
  }, [selectedClouds, clouds]);

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
      if (providers.length === 0) setAllProviders(response.data.providers);
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

  const updateSelectedPresentedClouds = () => {
    setSelectedPresentedClouds(
      clouds
        .filter((cloud) => cloudSelected(cloud.cloud_id))
        .map((cloud) => cloud.cloud_id)
    );
  };

  const handleAlertClose = () => setShowLocationAlert(false);

  const handleCardClick = (cloudID) => {
    setSelectedClouds(
      cloudSelected(cloudID)
        ? selectedClouds.filter(
            (selectedCloudID) => selectedCloudID !== cloudID
          )
        : [...selectedClouds, cloudID]
    );
  };

  const cloudSelected = (cloudID) => selectedClouds.includes(cloudID);

  const handleSortToggleChange = () => {
    fetchData(
      selectedProviders.length > 0 ? selectedProviders : allProviders,
      !sortByDistance
    );
    setSortByDistance(!sortByDistance);
  };

  const handleCleanUpSelection = () => {
    setSelectedClouds([]);
  };

  // To be continue...
  const handleContinueWithSelection = () => {
    // history.push("/clouds-selection", { selectedPresentedClouds });
  };

  return (
    <div>
      <nav className="navbar navbar-dark bg-primary">
        <div className="container-fluid">
          <a className="navbar-brand" href="">
            Aiven Cloud Selection
          </a>
        </div>
      </nav>
      <div className="container mt-4">
        <div className="row align-items-center justify-content-between mb-4">
          <div className="col">
            <h1>
              {selectedPresentedClouds.length === 1
                ? "1 Selected cloud"
                : `${selectedPresentedClouds.length} Selected clouds`}
            </h1>
          </div>
          <div className="col-auto">
            {" "}
            <button
              disabled={selectedPresentedClouds.length === 0}
              className="btn btn-primary btn-lg"
              onClick={handleContinueWithSelection}
            >
              Continue {">"}
            </button>
          </div>
        </div>
        <div className="container mb-2">
          <button
            disabled={selectedPresentedClouds.length === 0}
            className="btn btn-sm btn-primary"
            onClick={handleCleanUpSelection}
          >
            Clean up selection
          </button>
        </div>

        {/* Select component */}
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
            {clouds.map((cloud) => (
              <div className="col-md-4 mb-4" key={cloud.cloud_id}>
                <div
                  className={`card ${
                    cloudSelected(cloud.cloud_id) ? "selected" : ""
                  }`}
                  onClick={() => handleCardClick(cloud.cloud_id)}
                >
                  <div className="card-body">
                    {cloudSelected(cloud.cloud_id) && (
                      <p className="legend-text">Selected</p>
                    )}
                    <h5
                      className={`card-title-${
                        cloudSelected(cloud.cloud_id) ? "selected" : ""
                      }`}
                    >
                      {cloud.cloud_name}
                    </h5>
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
