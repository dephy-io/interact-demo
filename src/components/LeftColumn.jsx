import { useViewportSize } from "@mantine/hooks";
import StyledButton from "./StyledButton.jsx";
import { Box, Flex, Group, Text } from "@mantine/core";

const RingsIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={14}
    height={16}
    viewBox="0 0 14 16"
    fill="none"
    {...props}
  >
    <path
      fill={props.color && "#fff"}
      fillRule="evenodd"
      d="M1.572.624.225 15.382h4.178l.505-5.29h.54l2.56 5.29h4.886l-2.696-5.627c.798-.202 2.554-1.037 3.201-2.763.647-1.725.315-3.234.068-3.773-.157-.405-.708-1.362-1.651-1.955C10.872.671 9.985.59 9.659.624H1.572Zm3.909 3.167-.27 3.201h2.797c.28-.01.923-.188 1.247-.808.323-.62.303-1.079.202-1.517-.112-.325-.566-.876-1.078-.876H5.48Z"
      clipRule="evenodd"
    />
  </svg>
);

const NostrIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size}
    height={props.size}
    viewBox="0 0 159 159"
    fill="none"
    {...props}
  >
    <path
      fill={props.color && "#fff"}
      d="M158.81 69.2v83.23c0 3.13-2.54 5.67-5.67 5.67H85.1c-3.13 0-5.67-2.54-5.67-5.67v-15.5c.31-19 2.32-37.2 6.54-45.48 2.53-4.98 6.7-7.69 11.49-9.14 9.05-2.72 24.93-.86 31.67-1.18 0 0 20.36.81 20.36-10.72 0-9.28-9.1-8.55-9.1-8.55-10.03.26-17.67-.42-22.62-2.37-8.29-3.26-8.57-9.24-8.6-11.24-.41-23.1-34.47-25.87-64.48-20.14-32.81 6.24.36 53.27.36 116.05v8.38c-.06 3.08-2.55 5.57-5.65 5.57H5.71c-3.13 0-5.67-2.54-5.67-5.67V8.49c0-3.13 2.54-5.67 5.67-5.67h31.67c3.13 0 5.67 2.54 5.67 5.67 0 4.65 5.23 7.24 9.01 4.53C63.45 4.86 78.07.51 94.43.51c36.65 0 64.36 21.36 64.36 68.69h.02ZM97.97 52.31c0-6.7-5.43-12.13-12.13-12.13-6.7 0-12.13 5.43-12.13 12.13 0 6.7 5.43 12.13 12.13 12.13 6.7 0 12.13-5.43 12.13-12.13Z"
    />
  </svg>
);

const DephyIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={18}
    viewBox="0 0 20 18"
    fill="none"
    {...props}
  >
    <path
      fill={props.color && "#fff"}
      fillRule="evenodd"
      d="M10.204.327a.413.413 0 0 0-.408 0l-3.51 1.995c-.07.04-.07.14 0 .18l1.184.67a.414.414 0 0 0 .408 0l1.918-1.087a.414.414 0 0 1 .408 0l1.92 1.09a.414.414 0 0 0 .408 0l1.186-.671c.07-.04.07-.14 0-.18L10.204.327Zm-4.24 3.75-1.183-.668a.414.414 0 0 0-.408 0L.903 5.381a.414.414 0 0 0-.208.36v6.534c0 .148.08.285.208.359l3.36 1.916c.138.08.309-.02.309-.18V7.928c0-.148.08-.285.209-.359l1.178-.672c.07-.04.07-.14 0-.18L4.113 5.674a.207.207 0 0 1 0-.36l1.852-1.057c.07-.04.07-.14 0-.18Zm6.569 3.722 1.135.643c.13.073.21.21.21.36v6.572c0 .15-.082.288-.212.361l-3.463 1.94a.414.414 0 0 1-.406-.002l-3.464-1.96a.414.414 0 0 1-.21-.36V8.681c0-.074.04-.143.105-.18l1.24-.702a.414.414 0 0 1 .407 0l1.922 1.086c.126.07.28.07.406 0l1.923-1.086a.413.413 0 0 1 .407 0Zm1.456-3.722 1.185-.67a.414.414 0 0 1 .405 0l3.514 1.959a.414.414 0 0 1 .212.361v6.54c0 .148-.08.286-.21.359l-3.405 1.926a.207.207 0 0 1-.309-.18V7.928a.414.414 0 0 0-.209-.359l-1.178-.672a.103.103 0 0 1 0-.18l1.845-1.042a.207.207 0 0 0 .001-.36l-1.852-1.057a.103.103 0 0 1 0-.18ZM9.898 3.78 7.057 5.395c-.07.04-.07.14 0 .18L9.898 7.18c.064.035.14.035.204 0l2.841-1.606c.07-.04.07-.14 0-.18l-2.84-1.614a.207.207 0 0 0-.205 0Z"
      clipRule="evenodd"
    />
  </svg>
);

export default function LeftColumn() {
  const { width: vwWidth } = useViewportSize();

  return (
    <Flex
      pl={vwWidth < 720 ? "20px" : "60px"}
      pr={vwWidth < 720 ? "20px" : "0"}
      direction="column"
    >
      <Box>
        <Text size="16px" lh="103%" mb="11px">
          Learn more about
        </Text>
      </Box>

      <Group
        mx={vwWidth < 992 ? "0" : "-20px"}
        pr="20px"
        gap={vwWidth >= 992 ? "0px" : "15px"}
      >
        <StyledButton
          component="a"
          label="DePHY"
          icon={DephyIcon}
          thin
          full={vwWidth >= 992}
          variant="alt"
          target="_blank"
          href="https://dephy.io/"
        />
        <StyledButton
          component="a"
          label="NoStr"
          icon={NostrIcon}
          thin
          full={vwWidth >= 992}
          variant="alt"
          target="_blank"
          href="https://nostr.io/"
        />
        <StyledButton
          component="a"
          label="Rings"
          icon={RingsIcon}
          thin
          full={vwWidth >= 992}
          variant="alt"
          target="_blank"
          href="https://ringsnetwork.io/"
        />
      </Group>
    </Flex>
  );
}
