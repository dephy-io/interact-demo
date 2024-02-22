import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Provider as JotaiProvider } from "jotai";
import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

const theme = createTheme({
  black: "#000000",
  white: "#FFFFFF",
  fontFamily: "Rubik, sans-serif",
  fontSmoothing: true,
  defaultRadius: "6px",
  other: {
    text: "rgba(255,255,255,.8)",
    body: "#161616",
  },
});

const cssVarOverrides = (theme) => ({
  dark: {
    "--mantine-color-body": theme.other.body,
    "--mantine-color-text": theme.other.text,
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <JotaiProvider>
    <MantineProvider
      defaultColorScheme="dark"
      theme={theme}
      cssVariablesResolver={cssVarOverrides}
    >
      <Notifications />
      <App />
    </MantineProvider>
  </JotaiProvider>,
);
