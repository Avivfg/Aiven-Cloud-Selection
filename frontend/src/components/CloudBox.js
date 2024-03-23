import React from "react";

const CloudBox = (props) => {
  const { cloud, selected, handleCardClick } = props;

  return (
    <div className="col-md-4 mb-4" key={cloud.cloud_id}>
      <div
        className={`card ${selected ? "selected" : ""}`}
        onClick={() => handleCardClick(cloud.cloud_id)}
      >
        <div className="card-body">
          {selected && <p className="legend-text">Selected</p>}
          <h5 className={`card-title-${selected ? "selected" : ""}`}>
            {cloud.cloud_name}
          </h5>
          <p className="card-text">{cloud.cloud_description}</p>
          <p className="card-text">Latitude: {cloud.geo_latitude}</p>
          <p className="card-text">Longitude: {cloud.geo_longitude}</p>
          <p className="card-text">Region: {cloud.geo_region}</p>
          <p className="card-text">Provider: {cloud.provider}</p>
          <p className="card-text">
            Provider Description: {cloud.provider_description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CloudBox;
