import React, { useState } from "react";
import API_URL from "../config";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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

    if (res.ok) {
      setMsg("Usuario creado correctamente ✅");

      // 🔥 REDIRECCIÓN AUTOMÁTICA
      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } else {
      setMsg(data.message || "Error al registrar ❌");
    }
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
        <Card style={{ background: "#121212", padding: "20px", borderRadius: "18px" }}>
          <CardContent>

            <Typography variant="h4" align="center" style={{ color: "#00ff88" }}>
              GYM
            </Typography>

            <Typography align="center" style={{ color: "#aaa" }}>
              create gym account
            </Typography>

            {msg && (
              <Alert style={{ marginTop: 10 }}>
                {msg}
              </Alert>
            )}

            <Box component="form" onSubmit={handleRegister}>

              <TextField
                fullWidth
                label="gym email"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{ style: { color: "#fff" } }}
              />

              <TextField
                fullWidth
                label="gym password"
                type="password"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{ style: { color: "#fff" } }}
              />

              <Button
                fullWidth
                type="submit"
                style={{
                  marginTop: 20,
                  background: "#00ff88",
                  color: "#000",
                  fontWeight: "bold",
                  borderRadius: "10px"
                }}
              >
                CREATE GYM 🚀
              </Button>

              {/* 🔥 BOTÓN VOLVER AL LOGIN */}
              <Button
                fullWidth
                onClick={() => navigate("/login")}
                style={{
                  marginTop: 10,
                  border: "1px solid #00ff88",
                  color: "#00ff88",
                  fontWeight: "bold",
                  borderRadius: "10px"
                }}
              >
                BACK TO LOGIN
              </Button>

            </Box>

          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Register;