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

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [type, setType] = useState("error"); // success | error
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg("");

    // 🔥 VALIDACIÓN
    if (!nombre || !email || !password) {
      setMsg("¡Completa todos los campos! ⚠️");
      setType("error");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMsg("Usuario creado correctamente ✅");
        setType("success");

        setTimeout(() => {
          navigate("/");
        }, 1200);

      } else {
        setMsg(data.message || "Error al registrar ❌");
        setType("error"); // 🔥 IMPORTANTE
      }

    } catch (error) {
      setMsg("Error de conexión 🚨");
      setType("error");
    } finally {
      setLoading(false);
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
        <Card
          style={{
            background: "#121212",
            padding: "20px",
            borderRadius: "18px",
            boxShadow: "0 0 25px rgba(0,255,136,0.08)"
          }}
        >
          <CardContent>

            <Typography
              variant="h4"
              align="center"
              style={{ color: "#00ff88", fontWeight: "bold" }}
            >
              GYM
            </Typography>

            <Typography align="center" style={{ color: "#aaa" }}>
              create gym account
            </Typography>

            {/* 🔥 MENSAJE CORREGIDO */}
            {msg && (
              <Alert severity={type} style={{ marginTop: 10 }}>
                {msg}
              </Alert>
            )}

            <Box component="form" onSubmit={handleRegister}>

              <TextField
                fullWidth
                label="Nombre"
                margin="normal"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                InputProps={{ style: { color: "#fff" } }}
                InputLabelProps={{ style: { color: "#aaa" } }}
              />

              <TextField
                fullWidth
                label="Email"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{ style: { color: "#fff" } }}
                InputLabelProps={{ style: { color: "#aaa" } }}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{ style: { color: "#fff" } }}
                InputLabelProps={{ style: { color: "#aaa" } }}
              />

              <Button
                fullWidth
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 20,
                  background: "#00ff88",
                  color: "#000",
                  fontWeight: "bold",
                  borderRadius: "10px",
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? "Creando..." : "CREATE GYM 🚀"}
              </Button>

              <Button
                fullWidth
                onClick={() => navigate("/")}
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