// =======================
// 🧩 REGISTER PRO NIVEL APP FITNESS
// =======================

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
  Alert,
  MenuItem
} from "@mui/material";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    peso: "",
    altura: "",
    genero: "",
    objetivo: "",
    frecuencia: "",
    tiempoObjetivo: "",
    nivelActividad: "",
    condiciones: "",
    medicamentos: "",
    lesiones: "",
    restricciones: "",
    profesion: "",
    sueno: ""
  });

  const [msg, setMsg] = useState("");
  const [type, setType] = useState("error");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.email || !form.password) {
      setMsg("Completa los campos obligatorios");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        setMsg("Cuenta creada correctamente ✅");
        setType("success");
        setTimeout(() => navigate("/"), 1500);
      } else {
        setMsg(data.message || "Error");
      }

    } catch (err) {
      setMsg("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#0f0f0f", py: 4 }}>
      <Container maxWidth="sm">
        <Card sx={{ bgcolor: "#121212", p: 3, borderRadius: 4 }}>
          <CardContent>

            <Typography variant="h4" align="center" sx={{ color: "#00ff88", mb: 2 }}>
              Crear Cuenta 💪
            </Typography>

            {msg && <Alert severity={type}>{msg}</Alert>}

            <Box component="form" onSubmit={handleRegister}>

              {/* BASICO */}
              <TextField fullWidth label="Nombre" name="nombre" margin="normal" onChange={handleChange} />
              <TextField fullWidth label="Email" name="email" margin="normal" onChange={handleChange} />
              <TextField fullWidth label="Password" type="password" name="password" margin="normal" onChange={handleChange} />

              {/* MEDIDAS */}
              <TextField fullWidth label="Peso (kg)" name="peso" margin="normal" onChange={handleChange} />
              <TextField fullWidth label="Altura (cm)" name="altura" margin="normal" onChange={handleChange} />

              {/* GENERO */}
              <TextField select fullWidth label="Género" name="genero" margin="normal" onChange={handleChange}>
                <MenuItem value="hombre">Hombre</MenuItem>
                <MenuItem value="mujer">Mujer</MenuItem>
                <MenuItem value="otro">Otro</MenuItem>
              </TextField>

              {/* OBJETIVO */}
              <TextField select fullWidth label="Objetivo" name="objetivo" margin="normal" onChange={handleChange}>
                <MenuItem value="bajar_peso">Bajar de peso</MenuItem>
                <MenuItem value="mantener">Mantenerme</MenuItem>
                <MenuItem value="fuerza">Ganar fuerza</MenuItem>
                <MenuItem value="musculo">Ganar músculo</MenuItem>
              </TextField>

              {/* FRECUENCIA */}
              <TextField select fullWidth label="¿Cada cuánto haces ejercicio?" name="frecuencia" margin="normal" onChange={handleChange}>
                <MenuItem value="nunca">Nunca</MenuItem>
                <MenuItem value="ocasional">Ocasional</MenuItem>
                <MenuItem value="1-2">1-2 veces/semana</MenuItem>
                <MenuItem value="3-4">3-4 veces/semana</MenuItem>
                <MenuItem value="diario">Diario</MenuItem>
              </TextField>

              {/* NIVEL */}
              <TextField select fullWidth label="Nivel de actividad" name="nivelActividad" margin="normal" onChange={handleChange}>
                <MenuItem value="sedentario">Sedentario</MenuItem>
                <MenuItem value="ligero">Ligero</MenuItem>
                <MenuItem value="moderado">Moderado</MenuItem>
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="muy_activo">Muy activo</MenuItem>
              </TextField>

              {/* TIEMPO OBJETIVO */}
              <TextField fullWidth label="Tiempo para lograr objetivo (meses)" name="tiempoObjetivo" margin="normal" onChange={handleChange} />

              {/* SALUD */}
              <TextField fullWidth label="Condiciones médicas" name="condiciones" margin="normal" onChange={handleChange} />
              <TextField fullWidth label="Medicamentos" name="medicamentos" margin="normal" onChange={handleChange} />
              <TextField fullWidth label="Lesiones" name="lesiones" margin="normal" onChange={handleChange} />
              <TextField fullWidth label="Restricciones de movimiento" name="restricciones" margin="normal" onChange={handleChange} />

              {/* VIDA */}
              <TextField fullWidth label="Profesión" name="profesion" margin="normal" onChange={handleChange} />
              <TextField fullWidth label="Horas de sueño promedio" name="sueno" margin="normal" onChange={handleChange} />

              <Button fullWidth type="submit" disabled={loading} sx={{ mt: 3, bgcolor: "#00ff88", color: "#000" }}>
                {loading ? "Creando..." : "CREAR CUENTA 🚀"}
              </Button>

            </Box>

          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Register;
