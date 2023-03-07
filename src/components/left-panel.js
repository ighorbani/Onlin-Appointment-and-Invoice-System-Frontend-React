import React, { useEffect, useState } from "react";
import { useHistory, useParams, Link } from "react-router-dom";

function LeftPanel(props) {
  const history = useHistory();
  const [facilities, setFacilities] = useState([]);
  const [activeFacility, setActiveFacility] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // This function is used to activate the selected hospital.
  function ActivateFacility(id) {
    setActiveFacility(id);
    localStorage.setItem("facilityId", id);
    props.onFacilityChange(id);
    history.push("/");
  }

  // This function is to select a hospital by default (first loading of the application).
  function getDefaultFacility() {
    if (localStorage.getItem("facilityId") !== "") {
      setActiveFacility(localStorage.getItem("facilityId"));
      props.onFacilityChange(localStorage.getItem("facilityId"));
    } else {
      setActiveFacility(facilities[0]._id);
    }
  }

  useEffect(() => {
    getDefaultFacility();
  }, []);

  // To get the list of hospitals.
  async function FetchFacilities() {
    setError(null);
    try {
      const response = await fetch("http://localhost:8080/getFacilitiesList/");

      if (!response.ok) {
        throw new Error("There is an error in catching data");
      }

      const data = await response.json();
      if (data.state === "Ok") {
        setFacilities(data.facilities);
      }
    } catch (error) {
      setError(error.message);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    FetchFacilities();
  }, []);

  return (
    <>
      <div className="left-column">
        <div className="cell main">Facilities</div>

        {facilities &&
          facilities.map((facility, index) => (
            <div
              onClick={ActivateFacility.bind(this, facility._id)}
              className={
                "cell regular " +
                (activeFacility === facility._id ? "active" : "")
              }
              key={index}
            >
              {facility.name}
            </div>
          ))}

        <a target="_blank" className="column-logo" href="https://www.clipboardhealth.com/"></a>
        <div className="column-links">
          <a target="_blank" href="https://www.clipboardhealth.com/about">About Us</a>
          <a target="_blank" href="https://www.clipboardhealth.com/contact">Contact Us</a>
        </div>
      </div>
    </>
  );
}

export default LeftPanel;
