import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import { AppShell, Grid, Container } from "@mantine/core";
import LeftColumn from "./components/LeftColumn.jsx";
import AppColumn from "./components/AppColumn.jsx";

function App() {
  return (
    <Container px="0" mt="72px" mb="72px">
      <Grid columns={16} gutter={20}>
        <Grid.Col span={{ base: 16, xs: 16, md: 4 }}>
          <LeftColumn />
        </Grid.Col>
        <Grid.Col span={{ base: 16, xs: 11 }}>
          <AppColumn />
        </Grid.Col>
      </Grid>
    </Container>
  );
}

function AppWrapper() {
  return (
    <AppShell header={{ height: 80 }}>
      <AppShell.Header withBorder={false}>
        <Nav />
      </AppShell.Header>
      <AppShell.Main>
        <Hero />
        <App />
      </AppShell.Main>
    </AppShell>
  );
}

export default AppWrapper;
