import React, { useEffect, useState } from "react";
import { useHistory, useParams, Link } from "react-router-dom";
import ReportRow from "./report-row";


// This component is a card for displaying report information.
function ReportCard(props) {
  const history = useHistory();

  return (
    <div className="report-item">
      <div className="report-label">{props.label}</div>
      <div className={`img ${props.imageStyle}`} style={props.backgroundImage}></div>
      <h4>{props.title}</h4>
      <h5 className="subtitle">{props.subtitle}</h5>

      {props.items.map((item, index) => (
        <ReportRow
          key={index}
          title={item.title}
          value={item.value}
          total={item.total}
        />
      ))}
    </div>
  );
}

export default ReportCard;
