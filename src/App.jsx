import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicRoutes, AppRoutes } from "./routes/index.js";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {PublicRoutes()}
        {AppRoutes()}
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
