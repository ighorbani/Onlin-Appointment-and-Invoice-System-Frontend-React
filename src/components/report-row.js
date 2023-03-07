import React, { useEffect, useState } from "react";
import { useHistory, useParams, Link } from "react-router-dom";

// This component is a row of information in the report.
function ReportRow(props) {
  const history = useHistory();

  return (
    <>
      {props.total && <div className="hr-dashed"></div>}

      <div className={`data-row ${props.total ? "total" : ""}`}>
        <div className="item">
          <div></div>
          <span>{props.title}</span>
        </div>
        <div className="value">{props.value}</div>
      </div>
    </>
  );
}

export default ReportRow;
