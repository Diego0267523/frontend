import React, { useState } from "react";
import API_URL from "../config";

import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Box,
  Alert
} from "@mui/material";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    setMsg(data.message || "GYM user created");
  };

  return (
    <Box
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f0f0f"
      }}
    >
      <Container maxWidth="xs">
        <Card style={{ background: "#121212", padding: "20px" }}>

          <CardContent>

            <Typography variant="h4" align="center" style={{ color: "#00ff88" }}>
              GYM
            </Typography>

            <Typography align="center" style={{ color: "#aaa" }}>
              create gym account
            </Typography>

            {msg && <Alert style={{ marginTop: 10 }}>{msg}</Alert>}

            <Box component="form" onSubmit={handleRegister}>

              <TextField
                fullWidth
                label="gym email"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <TextField
                fullWidth
                label="gym password"
                type="password"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button
                fullWidth
                type="submit"
                style={{
                  marginTop: 20,
                  background: "#00ff88",
                  color: "#000"
                }}
              >
                CREATE GYM
              </Button>

            </Box>

          </CardContent>

        </Card>
      </Container>
    </Box>
  );
}

export default Register;