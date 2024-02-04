import "./App.css";
import { useCallback } from "react";
import PageWrapper from "./components/PageWrapper.jsx";
import {
  Accordion,
  AccordionItem,
  Button,
  Divider,
  Code,
  Input,
} from "@nextui-org/react";
import SectionWrapper from "./components/SectionWrapper.jsx";
import Connection from "./components/Connection.jsx";
import { useAtom } from "jotai";
import { connInfoAtom } from "./atoms.js";

function App() {
  const [connInfo, setConnInfo] = useAtom(connInfoAtom);

  const applyConnInfo = useCallback(() => {
    if (connInfo) return;

    let deviceAddr;
    try {
      deviceAddr = document
        .querySelector("#input__deviceAddr")
        .value.trim()
        .toLowerCase()
        .match(/(\b0x[a-f0-9]{40}\b)/g)[0];
    } catch (e) {
      console.error(e);
      alert("Invalid Address.");
      return;
    }
    const nostrRelayAddr =
      document.querySelector("#input__nostrRelayAddr").value.trim() ||
      "wss://relay-poc.dephy.io";
    const ringsNodeAddr =
      document.querySelector("#input__ringsNodeAddr").value.trim() ||
      "https://rings-poc.dephy.io";

    const ret = { deviceAddr, nostrRelayAddr, ringsNodeAddr };
    setConnInfo(ret);
  }, [connInfo, setConnInfo]);

  return (
    <PageWrapper>
      <Accordion
        variant="bordered"
        selectionMode="multiple"
        defaultSelectedKeys="all"
        className="my-6"
      >
        <AccordionItem
          key="1"
          aria-label="DePHY Interact Demo"
          title="DePHY Interact Demo"
        >
          <SectionWrapper>
            <p className="text-sm text-gray-700 mb-3 leading-tight">
              In this demo, we are going to deploy a simulated DePHY device on
              your computer and get its DID. With the DID, we can observe the
              state number of a DePHY device in realtime from the decentralized
              message network with NoStr and send control message to it through
              P2P channels provided by Rings.
            </p>
            <p className="text-sm text-gray-700 mb-4 leading-tight">
              The control part of the demo requires WebRTC support of your
              browser, hence it may not work on mobile environments.
            </p>
            <Divider />
            <p className="text-sm text-slate-700 mb-1 mt-2 leading-tight">
              Here are some useful links:
            </p>
            <div className="pt-1.5 flex flex-row flex-wrap gap-1.5 items">
              <Button
                color="default"
                size="sm"
                variant="flat"
                as="a"
                href="https://github.com/dephy-io/interact-demo"
                target="_blank"
              >
                Demo source code
              </Button>
              <Button
                color="default"
                size="sm"
                variant="flat"
                as="a"
                href="https://github.com/RingsNetwork/rings"
                target="_blank"
              >
                Learn more about Rings
              </Button>
              <Button
                color="default"
                size="sm"
                variant="flat"
                as="a"
                href="https://nostr.com/"
                target="_blank"
              >
                Learn more about NoStr
              </Button>
              <Button
                color="default"
                size="sm"
                variant="flat"
                as="a"
                href="https://github.com/RingsNetwork/rings"
                target="_blank"
              >
                Learn more about Rings
              </Button>
            </div>
          </SectionWrapper>
        </AccordionItem>
        <AccordionItem
          key="2"
          aria-label="Step 1: Deploy the device simulator"
          title="Step 1: Deploy the Device Simulator"
        >
          <SectionWrapper>
            <p className="text-sm text-gray-700 mb-2 leading-tight">
              To deploy the Device Simulator, you need to grab the latest
              prebuilt binaries or build it by simply running{" "}
              <code>cargo build</code>. We provide prebuilt binaries for
              Windows, macOS and Linux with glibc.
            </p>
            <p className="text-sm text-gray-700 mb-2 leading-tight">
              Run the binary in terminal, it will print the address part of DID
              starting with <code>0x</code> like this:
            </p>
            <Code className="mb-4">My address: 0x...</Code>
            <Divider />
            <p className="text-sm text-slate-700 mb-1 mt-2 leading-tight">
              Get the Device Simulator:
            </p>
            <div className="pt-1.5 flex flex-row flex-wrap gap-1.5 items">
              <Button
                color="primary"
                size="sm"
                variant="flat"
                as="a"
                href="https://github.com/dephy-io/interact-demo"
                target="_blank"
              >
                Download prebuilt binaries
              </Button>
              <Button
                color="default"
                size="sm"
                variant="flat"
                as="a"
                href="https://github.com/dephy-io/interact-demo"
                target="_blank"
              >
                Source code
              </Button>
            </div>
          </SectionWrapper>
        </AccordionItem>
        <AccordionItem
          key="3"
          aria-label="Step 2: Check Connection Information"
          title="Step 2: Check Connection Information"
        >
          <SectionWrapper>
            {!connInfo ? (
              <div className="w-full flex flex-col gap-4">
                <div className="flex w-[80%] flex-wrap flex-col md:flex-nowrap mb-0 gap-2">
                  <Input
                    size="sm"
                    type="text"
                    variant="bordered"
                    label="Device Address"
                    placeholder="0x..."
                    id="input__deviceAddr"
                  />
                  <Input
                    size="sm"
                    type="text"
                    variant="bordered"
                    label="NoStr relay address (leave empty for default value)"
                    placeholder="wss://relay-poc.dephy.io"
                    id="input__nostrRelayAddr"
                  />
                  <Input
                    size="sm"
                    type="text"
                    variant="bordered"
                    label="Rings assist node address (leave empty for default value)"
                    placeholder="https://rings-poc.dephy.io"
                    id="input__ringsNodeAddr"
                  />
                  <Button
                    color="primary"
                    variant="flat"
                    className="w-1 mt-1"
                    onClick={applyConnInfo}
                  >
                    Connect
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-700 mb-2 leading-tight">
                🔗 Connection information confirmed, refresh the page to reset.
              </p>
            )}
          </SectionWrapper>
        </AccordionItem>
        <AccordionItem
          key="4"
          aria-label="Step 3: Observe and Play"
          title="Step 3: Observe and Play"
        >
          <SectionWrapper>
            {connInfo ? null : (
              <p className="text-sm text-slate-700 mb-1 leading-tight">
                👀 Please check connection information in Step 2.
              </p>
            )}
            <Connection />
          </SectionWrapper>
        </AccordionItem>
      </Accordion>
    </PageWrapper>
  );
}

export default App;
