import { Container, Flex, Text, Box, Group } from "@mantine/core";
import { useScrollIntoView, useViewportSize } from "@mantine/hooks";
import StyledButton from "./StyledButton";
import { IconFileCode } from "@tabler/icons-react";

import Style from "./Hero.module.css";

export default function Hero() {
  const { width: vwWidth } = useViewportSize();
  const { scrollIntoView, targetRef } = useScrollIntoView({
    offset: 60,
  });

  return (
    <>
      <Flex
        align="center"
        justify="center"
        style={{
          height: "calc(100vh - 80px)",
          // height: "calc(80vh - 80px)",
          // maxHeight: "720px",
        }}
      >
        <Box w="100%" mt="-120px" className={Style.HeroBgWrapper}>
          <Container px="0">
            <Box>
              <Flex
                justify="flex-start"
                align="flex-start"
                direction="column"
                wrap="wrap"
                w="fit-content"
                pl={vwWidth < 720 ? "20px" : "60px"}
                pr={vwWidth < 720 ? "20px" : "60px"}
              >
                <Text
                  size="40px"
                  fw="600"
                  lh="130%"
                  c="white"
                  style={{ textTransform: "capitalize" }}
                  mb="50px"
                >
                  DePHY Interact Demo
                </Text>

                <Text size="16px" lh="24px" maw="640px" mb="70px">
                  In this demo, we are going to deploy a simulated DePHY device
                  on your computer and get its DID. With the DID, we can observe
                  the state number of a DePHY device in realtime from the
                  decentralized message network with NoStr and send control
                  message to it through P2P channels provided by Rings.
                  <br />
                  <br />
                  The control part of the demo requires WebRTC support of your
                  browser, hence it may not work on mobile environments.
                </Text>

                <Group>
                  <StyledButton
                    component="a"
                    label="Get started"
                    variant="primary"
                    onClick={scrollIntoView}
                  />
                  <StyledButton
                    component="a"
                    label="Access source code"
                    href="https://github.com/dephy-io/interact-demo"
                    target="_blank"
                    icon={IconFileCode}
                  />
                </Group>
              </Flex>
            </Box>
          </Container>
        </Box>
      </Flex>
      <Box
        h="0.5px"
        w="100%"
        style={{ background: "rgba(255, 255, 255, .1)" }}
        ref={targetRef}
      />
    </>
  );
}
