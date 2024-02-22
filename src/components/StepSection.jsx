import { Flex, Text, Group } from "@mantine/core";

export default function StepSection({ step, title, children }) {
  return (
    <Flex direction="column" mb="60px">
      <Text c="#8991D4" size="16px" lh="130%" mb="8px">
        Step {step}
      </Text>
      <Text
        c="#FFF"
        size="24px"
        lh="130%"
        mb="16px"
        style={{ fontWeight: 600 }}
      >
        {title}
      </Text>
      {children}
    </Flex>
  );
}

StepSection.Desc = function Desc({ children }) {
  return (
    <Text size="16px" lh="24px" mb="18px">
      {children}
    </Text>
  );
};

StepSection.ButtonGroup = function ButtonGroup({ children }) {
  return (
    <Group size="16px" gap="20px" mt="22px">
      {children}
    </Group>
  );
};
