import { useViewportSize } from "@mantine/hooks";
import StepSection from "./StepSection.jsx";
import StyledButton from "./StyledButton.jsx";
import { IconDownload, IconPlayerPlay } from "@tabler/icons-react";
import { Box, Flex, Text, Code } from "@mantine/core";
import { connInfoAtom, ringsInfoAtom } from "../atoms.js";
import { useAtom, useAtomValue } from "jotai";
import { useRef, useCallback, forwardRef } from "react";
import Connection from "./Connection.jsx";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

export default function AppColumn() {
  const { width: vwWidth } = useViewportSize();

  return (
    <Flex
      px={vwWidth < 720 ? "20px" : vwWidth < 992 ? "60px" : "0"}
      direction="column"
    >
      <Step1 />
      <Step2 />
      <Step3 />
    </Flex>
  );
}

function Step1() {
  return (
    <StepSection step="1" title="Download and run the device simulator">
      <StepSection.Desc>
        To deploy the Device Simulator, you need to grab the latest prebuilt
        binaries or build it by simply running cargo build. We provide prebuilt
        binaries for Windows, macOS and Linux with glibc.
        <br />
        <br />
        For the CLI version, simply run it in terminal. For the GUI version,
        double-click the executable file, if you are using macOS, right-click
        the executable then click "Open".
      </StepSection.Desc>
      <StepSection.ButtonGroup>
        <StyledButton
          component="a"
          variant="primary"
          label="Download prebuilt binaries"
          icon={IconDownload}
          target="_blank"
          href="https://github.com/dephy-io/interact-demo/releases"
        />
        <StyledButton
          component="a"
          variant="default"
          label="Get source code"
          target="_blank"
          href="https://github.com/dephy-io/interact-demo/tree/main/simdev"
        />
      </StepSection.ButtonGroup>
    </StepSection>
  );
}

function Step2() {
  const connInfo = useAtomValue(connInfoAtom);
  const ringsInfo = useAtomValue(ringsInfoAtom);

  return (
    <StepSection step="2" title="Check connection Information">
      {connInfo ? (
        <>
          <StepSection.Desc>
            Connection information confirmed, check blow for connection details.{" "}
            <br />
            Refresh the page to reset.
          </StepSection.Desc>
          {connInfo && ringsInfo && (
            <Code block>
              {`${JSON.stringify(
                {
                  conn: connInfo,
                  rings: {
                    myDid: ringsInfo.accountAddress,
                  },
                },
                null,
                2,
              )}`}
            </Code>
          )}
        </>
      ) : (
        <>
          <StepSection.Desc>
            Run the device simulator, and find the device address starting
            with 0x (refer to the following example) in terminal or the GUI
            window:
            <br />
            <code
              style={{
                color: "#8991D4",
                fontSize: "16px",
              }}
            >
              [INFO simdev::report] Signer: 0x5865a...b7a6c
            </code>
          </StepSection.Desc>
          <Step2.Input />
        </>
      )}
    </StepSection>
  );
}

Step2.Input = function Step2Input() {
  const deviceAddrInputRef = useRef();
  const nostrRelayAddrInputRef = useRef();
  const ringsNodeAddrInputRef = useRef();

  const [connInfo, setConnInfo] = useAtom(connInfoAtom);

  const applyConnInfo = useCallback(() => {
    if (connInfo) return;
    if (
      !deviceAddrInputRef.current ||
      !nostrRelayAddrInputRef.current ||
      !ringsNodeAddrInputRef.current
    )
      return;

    let deviceAddr;
    try {
      deviceAddr = deviceAddrInputRef.current.value
        .trim()
        .toLowerCase()
        .match(/(\b0x[a-f0-9]{40}\b)/g)[0];
    } catch (e) {
      console.error(e);
      notifications.show({ title: "Invalid Address.", color: "red" });
      return;
    }
    const nostrRelayAddr =
      nostrRelayAddrInputRef.current.value.trim() ||
      "wss://poc-relay.dephy.cloud";
    const ringsNodeAddr =
      ringsNodeAddrInputRef.current.value.trim() ||
      "https://poc-rings.dephy.cloud";

    const ret = { deviceAddr, nostrRelayAddr, ringsNodeAddr };
    setConnInfo(ret);
  }, [connInfo, setConnInfo]);

  return (
    <>
      <Box mb="16px">
        <StyledInput
          ref={deviceAddrInputRef}
          title="Device Address"
          placeholder="0x..."
        />
        <StyledInput
          ref={nostrRelayAddrInputRef}
          title="NoStr relay address (leave empty for default value)"
          placeholder="wss://poc-relay.dephy.cloud"
        />
        <StyledInput
          ref={ringsNodeAddrInputRef}
          title="Rings assist node address (leave empty for default value)"
          placeholder="https://poc-rings.dephy.cloud"
        />
      </Box>
      <StepSection.ButtonGroup>
        <StyledButton
          component="a"
          variant="primary"
          label="Connect"
          icon={IconPlayerPlay}
          onClick={applyConnInfo}
        />
      </StepSection.ButtonGroup>
    </>
  );
};

export const StyledInput = forwardRef(function StyledInput(
  { title, children, ...props },
  ref,
) {
  const [focused, setFocused] = useState(false);

  return (
    <Flex
      mb="14px"
      w="100%"
      style={{
        transition: "box-shadow 0.2s ease-in-out",
        padding: "10px 20px",
        borderRadius: "8px",
        background:
          "linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.05) 100%), rgba(0, 0, 0, 0.20)",
        boxShadow: focused ? "0 0 0 1px #E4A055 inset" : "none",
      }}
    >
      <Flex
        direction="column"
        style={{
          flex: 1,
        }}
        onClick={() => {
          ref.current.focus();
        }}
      >
        <Text size="14px" lh="24px" c="rgba(228, 160, 85, 0.8)" mb="4px">
          {title}
        </Text>
        <Box mb="4px">
          <input
            {...props}
            ref={ref}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              fontSize: "16px",
              lineHeight: "normal",
              color: "white",
              background: "transparent",
              width: "100%",
              border: "none",
              outline: "none",
            }}
          />
        </Box>
      </Flex>
      {children}
    </Flex>
  );
});

function Step3() {
  const connInfo = useAtomValue(connInfoAtom);

  return (
    <StepSection step="3" title="Observe and Play">
      {connInfo ? null : (
        <StepSection.Desc>
          👀 Please check connection information and connect to device in Step
          2.
        </StepSection.Desc>
      )}
      <Connection />
    </StepSection>
  );
}
