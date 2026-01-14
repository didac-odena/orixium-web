import { Route } from "react-router-dom";
import { PublicLayout } from "../layouts/public/index.js";
import { HomePage } from "../pages/home/index.js";
import { LoginPage } from "../pages/login/index.js";

export function PublicRoutes() {
  return (
    <Route element={<PublicLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
    </Route>
  );
}
