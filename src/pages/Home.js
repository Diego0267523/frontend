import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Box
} from "@mui/material";

import CreateTraining from "../components/CreateTraining";
import TrainingList from "../components/TrainingList";
import ChatAssistant from "../components/ChatAssistant";

function Home() {
  const { logout } = useContext(AuthContext);

  return (
    <Box style={{ minHeight: "100vh", background: "#0f0f0f", paddingTop: 30 }}>
      <Container maxWidth="md">

        {/* HEADER */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography style={{ color: "#00ff88", fontSize: 28, fontWeight: "bold" }}>
            GYM
          </Typography>

          <Button
            onClick={logout}
            style={{ border: "1px solid #00ff88", color: "#00ff88" }}
          >
            EXIT
          </Button>
        </Box>

        {/* CARDS */}
        <Card style={cardStyle}>
          <CardContent>
           
            <CreateTraining />
          </CardContent>
        </Card>

        <Card style={cardStyle}>
          <CardContent>
            <Typography style={titleStyle}>YOUR GYM</Typography>
            <TrainingList />
          </CardContent>
        </Card>

        <Card style={cardStyle}>
          <CardContent>
            <Typography style={titleStyle}>GYM AI</Typography>
            <ChatAssistant />
          </CardContent>
        </Card>

      </Container>
    </Box>
  );
}

const cardStyle = {
  marginTop: 15,
  borderRadius: 18,
  background: "#121212",
  boxShadow: "0 0 20px rgba(0,255,136,0.08)"
};

const titleStyle = {
  color: "#00ff88",
  marginBottom: 10
};

export default Home;