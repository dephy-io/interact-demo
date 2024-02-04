import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { NextUIProvider } from "@nextui-org/react";
import { Provider as JotaiProvider } from "jotai";

ReactDOM.createRoot(document.getElementById("root")).render(
  <JotaiProvider>
    <NextUIProvider>
      <App />
    </NextUIProvider>
  </JotaiProvider>,
);
