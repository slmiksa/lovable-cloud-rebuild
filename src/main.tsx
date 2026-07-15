import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import { refreshSiteSettings } from "./hooks/useSiteSettings";
import "./styles.css";

const router = getRouter();
void refreshSiteSettings();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
