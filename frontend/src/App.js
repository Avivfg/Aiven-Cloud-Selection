import React, { useState, useEffect } from "react";
import api from "./api";

const App = () => {
  const [clouds, setClouds] = useState([]);

  const fetchClouds = async () => {
    try {
      const response = await api.get("/clouds/");
      setClouds(response.data.clouds);
    } catch (error) {
      console.error("Error fetching clouds:", error);
    }
  };

  const fetchCloudsByProvider = async (providers) => {
    try {
      const response = await api.get("/clouds/", { params: { providers } });
      setClouds(response.data.clouds);
      console.log("clicked");
      console.log(clouds);
    } catch (error) {
      console.error("Error fetching clouds:", error);
    }
  };

  useEffect(() => {
    fetchClouds();
  }, []);

  return (
    <div>
      <nav className="navbar navbar-dark bg-primary">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            Aiven Cloud Selection
          </a>
          <a
            onClick={() => fetchCloudsByProvider(["google"])}
            className="navbar-brand"
            // href=""
          >
            only google test
          </a>
        </div>
      </nav>
      <div className="container mt-4">
        <h1 className="mb-4">Clouds</h1>
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
