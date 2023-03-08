import React, { useEffect, useState, useMemo } from "react";
import LeftPanel from "../components/left-panel";
import ReportItem from "../components/report-row";
import { useHistory, useParams, Link } from "react-router-dom";
import moment from "moment";

// This is the main page that displays the general list of hospitals.
function MainPage(props) {
  const history = useHistory();
  const [shifts, setShifts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [facilityInfo, setFacilityInfo] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [readyDownload, setReadyDownload] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");
  const [error, setError] = useState(null);

  let facilityId = localStorage.getItem("facilityId");

  // With this function, you can get the general information of selected hospital
  async function FetchFacility() {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8080/getFacilityInfo/" + facilityId
      );

      if (!response.ok) {
        throw new Error("There is an error in catching data");
      }

      const data = await response.json();

      if (data.state === "Ok") {
        setFacilityInfo(data.facility);
      }
    } catch (error) {
      setError(error.message);
    }
    setIsLoading(false);
  }

  // With this function, we can get the list of those who had a shift in the selected hospital.
  async function FetchAgents() {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8080/getFacilityAgents/" + facilityId
      );

      if (!response.ok) {
        throw new Error("There is an error in catching data");
      }

      const data = await response.json();

      if (data.state === "Ok") {
        setAgents(data.agents);
      }
    } catch (error) {
      setError(error.message);
    }
    setIsLoading(false);
  }

  // With this function, we get the list of shifts performed in the selected hospital.
  async function FetchShifts() {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8080/getFacilityShifts/" + facilityId
      );

      if (!response.ok) {
        throw new Error("There is an error in catching data");
      }

      const data = await response.json();
      if (data.state === "Ok") {
        setShifts(data.shifts);
      }
    } catch (error) {
      setError(error.message);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    FetchShifts();
    FetchFacility();
    FetchAgents();
    setDownloadLink("");
    setGeneratingPDF(false);
    setReadyDownload(false);
  }, [facilityId]);

  if (isLoading) {
    return (
      <div className="page-wide">
        <h1>Loading Summary</h1>
        <h2>Please Wait</h2>
      </div>
    );
  }

  // This function is for formatting amounts.
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  // This function generates report for all shifts of this facility
  async function getAllShiftsReport() {
    setGeneratingPDF(true);
    try {
      const response = await fetch(
        "http://localhost:8080/generateShiftsReport/" + facilityId
      );

      const data = await response.json();
      if (data.file !== "") {
        setReadyDownload(true);
        setDownloadLink(data.file);
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
    setGeneratingPDF(false);
  }

  return (
    <>
      <div className="page-flx">
        {!isLoading && (
          <div className="page-wide">
            <h1>Summer 2023 Report</h1>
            <h2>For {facilityInfo?.name}</h2>

            <div
              className="back-button-flx"
              style={{ justifyContent: "center" }}
            >
              {generatingPDF === true ? (
                <div style={{ margin: "auto", textAlign: "center" }}>
                  <div className="lds-ellipsis">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              ) : readyDownload === false ? (
                <div className="button" onClick={getAllShiftsReport}>
                  Generate Shifts Invoice
                </div>
              ) : (
                <a
                  className="button"
                  target="_blank"
                  href={downloadLink}
                  download
                >
                  Download Shifts Invoice
                </a>
              )}
            </div>

            <h3 className="middle-title">This Quarter Agents</h3>
            <div className="table">
              <div className="table-header-flx">
                <div style={{ flex: "0 0 24%" }}>Full Name</div>
                <div>Location</div>
                <div>Custom Id</div>
                <div style={{ flex: "0 0 12%" }}>Shifts</div>
                <div>Total Revenue</div>
                <div>Details & Report</div>
              </div>

              {agents &&
                agents.map((agent, index) => (
                  <div className="table-row-flx" key={index}>
                    <div className="with-image" style={{ flex: "0 0 24%" }}>
                      <span
                        style={{
                          backgroundImage: `url(http://localhost:8080/uploads/agent/${agent.image})`,
                        }}
                      ></span>
                      {agent.name}
                    </div>
                    <div>{agent.location}</div>
                    <div>{agent.customId}</div>
                    <div style={{ flex: "0 0 12%" }}>{agent.shifts}</div>
                    <div>{formatter.format(agent.totalIncome)}</div>
                    <Link className="button" to={`/report/${agent.id}`}>
                      <span>See Details</span>
                    </Link>
                  </div>
                ))}
            </div>

            <h3 className="middle-title">This Quarter Shifts</h3>

            <div className="table">
              <div className="table-header-flx">
                <div>Date</div>
                <div>Shift Time</div>
                <div style={{ flex: "0 0 10%" }}>Bed</div>
                <div>Peyment</div>
                <div>Service</div>
                <div style={{ flex: "0 0 24%" }}>Agent</div>
              </div>

              {shifts &&
                shifts.map((shift, index) => (
                  <div className="table-row-flx" key={index}>
                    <div>{moment(shift.date).format("YYYY/MM/DD")}</div>
                    <div>{shift.shiftTime}</div>
                    <div style={{ flex: "0 0 10%" }}>{shift.bed}</div>
                    <div>{formatter.format(shift.cost)}</div>
                    <div>{shift.service}</div>
                    <div className="with-image" style={{ flex: "0 0 24%" }}>
                      <span
                        style={{
                          backgroundImage: `url(http://localhost:8080/uploads/agent/${shift.agent.image})`,
                        }}
                      ></span>
                      {shift.agent.fullName}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default MainPage;
