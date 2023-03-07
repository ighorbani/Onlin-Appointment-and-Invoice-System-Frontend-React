import "./App.css";

import {
  Switch,
  Route,
  useHistory,
  Redirect,
  useParams,
  Link,
} from "react-router-dom";
import React, { useEffect, useState } from "react";

//import pages
import MainPage from "./pages/main";
import ReportPage from "./pages/report";
import LeftPanel from "./components/left-panel";

function App() {
  const [selectedFacility, setSelectedFacility] = useState();

  function onFacilityChange(id) {
    setSelectedFacility(id);
  }

  return (
    <div>
      <LeftPanel onFacilityChange={onFacilityChange} />
      <Switch>
        <Route path="/" exact>
          <MainPage selectedFacility={selectedFacility} />
        </Route>
        <Route path="/report/:agentId">
          <ReportPage />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
