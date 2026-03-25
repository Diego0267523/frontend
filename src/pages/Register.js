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

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    peso: "",
    altura: ""
  });

  const [msg, setMsg] = useState("");
  const [type, setType] = useState("error");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.nombre || !form.email || !form.password) {
      setMsg("¡Completa los campos obligatorios!");
      setType("error");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        setMsg("Usuario creado correctamente ✅");
        setType("success");

        setTimeout(() => navigate("/"), 1200);
      } else {
        setMsg(data.message || "Error ❌");
        setType("error");
      }

    } catch (err) {
      setMsg("Error de conexión 🚨");
      setType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#0f0f0f" }}>
      <Container maxWidth="xs">
        <Card sx={{ bgcolor: "#121212", p: 2, borderRadius: 3 }}>
          <CardContent>

            <Typography variant="h4" align="center" sx={{ color: "#00ff88", fontWeight: "bold" }}>
              GYM
            </Typography>

            {msg && <Alert severity={type} sx={{ mt: 2 }}>{msg}</Alert>}

            <Box component="form" onSubmit={handleRegister}>

              <TextField fullWidth label="Nombre" name="nombre" margin="normal" onChange={handleChange} />
              <TextField fullWidth label="Email" name="email" margin="normal" onChange={handleChange} />
              <TextField fullWidth label="Password" type="password" name="password" margin="normal" onChange={handleChange} />

              {/* 🔥 MEDIDAS */}
              <TextField fullWidth label="Peso (kg)" name="peso" margin="normal" onChange={handleChange} />
              <TextField fullWidth label="Altura (cm)" name="altura" margin="normal" onChange={handleChange} />

              <Button fullWidth type="submit" disabled={loading} sx={{ mt: 2, bgcolor: "#00ff88", color: "#000" }}>
                {loading ? "Creando..." : "REGISTRAR 🚀"}
              </Button>

              <Button fullWidth onClick={() => navigate("/")} sx={{ mt: 1, color: "#00ff88" }}>
                VOLVER
              </Button>

            </Box>

          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Register;