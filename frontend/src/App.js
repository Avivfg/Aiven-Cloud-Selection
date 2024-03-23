import React, { useState, useEffect } from "react";
import api from "./api";
import Navbar from "./components/Navbar";
import CloudBox from "./components/CloudBox";
import GeoSort from "./components/GeoSort";
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

  // To be continue... (not a part of this assignment)
  const handleContinueWithSelection = () => {
    // history.push("/clouds-selection", { selectedPresentedClouds });
  };

  return (
    <div className="content">
      {/* Navbar for the title */}
      <Navbar />

      {/* Headline, selection count and continue button */}
      {/* (implementation of the button action is out of scope for this assignment) */}
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

        {/* Search bar for filtering by provider/s */}
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

        {/* Sort by distance feature */}
        <GeoSort
          locationPermission={locationPermission}
          sortByDistance={sortByDistance}
          handleSortToggleChange={handleSortToggleChange}
          show={showLocationAlert}
          setShow={setShowLocationAlert}
        />

        {/* Cleanup selection button */}
        <div className="container mb-2">
          <button
            disabled={selectedPresentedClouds.length === 0}
            className="btn btn-sm btn-primary"
            onClick={handleCleanUpSelection}
          >
            Clean up selection
          </button>
        </div>

        {/* Clouds listing */}
        {clouds ? (
          <div className="row">
            {clouds.map((cloud) => (
              <CloudBox
                cloud={cloud}
                key={cloud.cloud_id}
                selected={cloudSelected(cloud.cloud_id)}
                handleCardClick={handleCardClick}
              />
            ))}
          </div>
        ) : (
          <p>Loading...</p>
        )}

        {/* Another continue button for the bottom */}
        <div className="row align-items-right mb-4">
          {" "}
          <button
            disabled={selectedPresentedClouds.length === 0}
            className="btn btn-primary btn-lg"
            onClick={handleContinueWithSelection}
          >
            Continue with your selection {">"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
