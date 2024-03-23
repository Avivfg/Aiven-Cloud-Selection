import React from "react";

const GeoSort = (props) => {
  const {
    locationPermission,
    sortByDistance,
    handleSortToggleChange,
    show,
    setShow,
  } = props;

  const handleAlertClose = () => setShow(false);

  return (
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
      {show && (
        <div
          className="alert alert-warning alert-dismissible fade show"
          role="alert"
        >
          Your <strong>location permission</strong> is needed for the sort by
          geolocation feature.
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={handleAlertClose}
          ></button>
        </div>
      )}
    </div>
  );
};

export default GeoSort;
