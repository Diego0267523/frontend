import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API_URL from "../config";

import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent
} from "@mui/material";

function Login() {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      login(data.token);
    } else {
      alert(data.message || "LOGIN ERROR ❌");
    }
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Container maxWidth="sm">

        <Card
          style={{
            background: "#121212",
            borderRadius: "18px",
            boxShadow: "0 0 25px rgba(0,255,136,0.08)",
            padding: "10px"
          }}
        >
          <CardContent>

            <Typography
              variant="h4"
              align="center"
              style={{
                color: "#00ff88",
                fontWeight: "bold",
                letterSpacing: "2px",
                marginBottom: "20px"
              }}
            >
              GYM LOGIN
            </Typography>

            <form onSubmit={handleLogin}>

              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                InputLabelProps={{ style: { color: "#aaa" } }}
                InputProps={{
                  style: { color: "#fff" }
                }}
              />

              <TextField
                fullWidth
                type="password"
                label="Password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                InputLabelProps={{ style: { color: "#aaa" } }}
                InputProps={{
                  style: { color: "#fff" }
                }}
              />

              <Button
                fullWidth
                type="submit"
                style={{
                  marginTop: "20px",
                  background: "#00ff88",
                  color: "#000",
                  fontWeight: "bold",
                  borderRadius: "10px"
                }}
              >
                ENTER GYM 💪
              </Button>

                            {/* 🔥 BOTÓN REGISTRO */}
              <Button
                fullWidth
                style={{
                  marginTop: "10px",
                  border: "1px solid #00ff88",
                  color: "#00ff88",
                  borderRadius: "10px",
                  fontWeight: "bold"
                }}
                onClick={() => window.location.href = "/register"}
              >
                CREAR CUENTA 🏋️
              </Button>

            </form>

          </CardContent>
        </Card>

      </Container>
    </Box>
  );
}

export default Login;