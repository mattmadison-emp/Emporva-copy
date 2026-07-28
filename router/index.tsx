import { useRoutes } from "react-router-dom";
import routes from "./config";
import ScrollToTop from "../components/base/ScrollToTop";

export function AppRoutes() {
  const element = useRoutes(routes);
  return (
    <>
      <ScrollToTop />
      {element}
    </>
  );
}
