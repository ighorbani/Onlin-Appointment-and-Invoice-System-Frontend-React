import React, { useEffect, useState, useMemo } from "react";
import LeftPanel from "../components/left-panel";
import { useHistory, useParams, Link } from "react-router-dom";
import moment from "moment";
import ReportRow from "../components/report-row";
import ReportCard from "../components/report-card";

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";


// This component is for displaying the content of the reports page.
function ReportPage(props) {
  const params = useParams();
  const history = useHistory();
  const [info, setInfo] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [customId, setCustomId] = useState();
  const [formResult, setFormResult] = useState("");
  const [error, setError] = useState(null);

  // This function is for user ID change form.
  async function ChangeAgentId(event) {
    event.preventDefault();
    setError(null);
    setFormResult("");
    try {
      const response = await fetch(
        "http://localhost:8080/changeAgentId/" + info.agentId,
        {
          method: "POST",
          body: JSON.stringify({
            customId: customId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.state === "Ok") {
        setFormResult("Id Changed Successfully!");
      }

      if (data.state === "Error") {
        setError(data.errors);
      }
    } catch (error) {
      setFormResult("");
      setError(error.message);
    }
    setIsLoading(false);
  }

  // This function is to get the report information of a particular user in a particular hospital.
  async function FetchData() {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8080/getReport/" +
          params.agentId +
          "/" +
          localStorage.getItem("facilityId")
      );

      if (!response.ok) {
        throw new Error("There is an error in catching data");
      }

      const data = await response.json();
      if (data.state === "Ok") {
        setInfo(data.result);
        setCustomId(data.result.agentCustomId);
      }
    } catch (error) {
      setError(error.message);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    FetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="page-wide">
        <h1>Loading Report</h1>
        <h2>Please Wait</h2>
      </div>
    );
  }

  // This function is for formatting amounts.
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  // This function is to convert the component to an image and then to a PDF file.
  function ExportPDF() {
    const input = document.getElementById("exportPDF");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4", true);
      pdf.addImage(imgData, "JPEG", 75, 20, 450, 850,"","NONE");
      pdf.save("Summer 2023 Report.pdf");
    });
  }

  return (
    <>
      {!isLoading && info && (
        <div className="page-wide">
          <div className="back-button-flx">
            <Link className="back-button" to="/">
              <div></div>
              <span>Back</span>
            </Link>
            <div className="button" onClick={ExportPDF}>
              Export as PDF
            </div>
          </div>

          <div id="exportPDF">
            <h1>{info.agentName} Shifts</h1>
            <h2>Quarter Revenue: {formatter.format(info.agentIncome)}</h2>

            <div className="table">
              <div className="table-header-flx">
                <div>Date</div>
                <div>Time</div>
                <div>Service</div>
                <div>Cost</div>
                <div>Room</div>
                <div>Bed</div>
              </div>

              {info.shifts.map((shift, index) => (
                <div className="table-row-flx" key={index}>
                  <div>{moment(info.date).format("YYYY/MM/DD")}</div>
                  <div>{shift.time}</div>
                  <div>{shift.service}</div>
                  <div>{formatter.format(shift.cost)}</div>
                  <div>{shift.bed}</div>
                  <div>{shift.bed}</div>
                </div>
              ))}
            </div>

            <div className="reports-sec">
              {/* ABOUT AGENT */}
              <ReportCard
                label="About Agent"
                title={info.agentName}
                backgroundImage={{
                  backgroundImage: `url(http://localhost:8080/uploads/agent/${info.agentImage})`,
                }}
                subtitle={info.agentExpertise.join(" ,")}
                items={[
                  { title: "Phone", value: info.agentPhone },
                  { title: "Location", value: info.agentLocation },
                  { title: "Shifts", value: info.agentShifts },
                  { title: "Custom Id", value: info.agentCustomId },
                  {
                    title: "Total Income",
                    value: formatter.format(info.agentIncome),
                    total: "true",
                  },
                ]}
              />

              {/* THIS QUARTER STATEMENT */}
              <ReportCard
                label="Facility In Quarter"
                title={info.facilityName}
                backgroundImage={{
                  backgroundImage: `url(http://localhost:8080/uploads/facility/${info.facilityImage})`,
                }}
                subtitle={info.facilityLocation}
                items={[
                  {
                    title: "Total Quarter Shifts",
                    value: info.facilityTotalShifts,
                  },
                  {
                    title: "Total Quarter Costs",
                    value: formatter.format(info.facilityTotalCosts),
                    total: "true",
                  },
                ]}
              />

              {/* ABOUT FACILITY */}

              <ReportCard
                label="Facility General Info"
                title={info.facilityName}
                backgroundImage={{
                  backgroundImage: `url(http://localhost:8080/uploads/facility/${info.facilityImage})`,
                }}
                subtitle={info.facilityLocation}
                items={[
                  { title: "Name", value: info.facilityName },
                  { title: "Beds Count", value: info.facilityBeds },
                  { title: "Rooms Count", value: info.facilityBeds },
                  { title: "Location", value: info.facilityLocation },
                  { title: "Address", value: info.facilityAddress },
                  { title: "Phone", value: info.facilityPhone },
                ]}
              />
            </div>
          </div>

          {/* CHANGE CUSTOM ID FORM */}
          <form className="regular-form" onSubmit={ChangeAgentId}>
            <h3>Custom Id for {info.agentName}</h3>
            <section>
              <input
                className="form-input"
                type="text"
                placeholder="Place Custom Id"
                value={customId}
                name="customId"
                onChange={(e) => setCustomId(e.target.value)}
              />
              <input className="button" type="submit" value="Change Id" />
            </section>

            {formResult !== "" && (
              <div className="form-response success">
                <span></span>
                <div>{formResult}</div>
              </div>
            )}

            {error && error?.find((e) => e.param === "customId") && (
              <div className="form-response error">
                <span></span>
                <p>{error?.find((e) => e.param === "customId").msg}</p>
              </div>
            )}
          </form>
        </div>
      )}
    </>
  );
}

export default ReportPage;
