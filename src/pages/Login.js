import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API_URL from "../config";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert
} from "@mui/material";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // 🔥 VALIDACIÓN
    if (!email || !password) {
      setError("Completa todos los campos ⚠️");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // 🔥 VALIDACIÓN REAL
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        login(data.token);
        navigate("/");
      } else {
        setError(data.message || "Credenciales incorrectas ❌");
      }

    } catch (err) {
      setError("Error de conexión 🚨");
    } finally {
      setLoading(false);
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

            {/* 🔥 ERROR */}
            {error && (
              <Alert severity="error" style={{ marginBottom: "10px" }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleLogin}>

              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                InputLabelProps={{ style: { color: "#aaa" } }}
                InputProps={{ style: { color: "#fff" } }}
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
                InputProps={{ style: { color: "#fff" } }}
              />

              <Button
                fullWidth
                type="submit"
                disabled={loading}
                style={{
                  marginTop: "20px",
                  background: "#00ff88",
                  color: "#000",
                  fontWeight: "bold",
                  borderRadius: "10px",
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? "Entrando..." : "ENTER GYM 💪"}
              </Button>

              {/* 🔥 IR A REGISTER */}
              <Button
                fullWidth
                onClick={() => navigate("/register")}
                style={{
                  marginTop: "10px",
                  border: "1px solid #00ff88",
                  color: "#00ff88",
                  fontWeight: "bold",
                  borderRadius: "10px"
                }}
              >
                CREAR CUENTA 🚀
              </Button>

            </form>

          </CardContent>
        </Card>

      </Container>
    </Box>
  );
}

export default Login;