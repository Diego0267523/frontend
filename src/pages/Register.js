import React, { useState, useEffect } from "react";
import API_URL from "../utils/config";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createPublicProfile, normalizeUsername } from "../utils/publicProfilesDB";

import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Box,
  Alert,
  MenuItem,
  LinearProgress
} from "@mui/material";

const steps = [
  "Cuenta",
  "Medidas",
  "Perfil",
  "Salud",
  "Estilo de vida"
];

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

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

  useEffect(() => {
    const saved = localStorage.getItem("registerData");
    if (saved) setForm(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("registerData", JSON.stringify(form));
  }, [form]);

  // 🔥 ESCAPE PARA VOLVER LOGIN
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        navigate("/login");
      }
    };

    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateStep = () => {
    if (step === 0) return form.nombre && form.email && form.password;
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) {
      setMsg("Completa los campos obligatorios");
      return;
    }
    setMsg("");
    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleRegister = async () => {
    try {
      setLoading(true);

      if (!navigator.onLine) {
        setMsg("Sin conexión a internet");
        setType("error");
        return;
      }

      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        // 🌐 Crear perfil público automáticamente con username normalizado
        const rawUsername = form.email ? form.email.split("@")[0] : form.nombre || "usuario";
        const normalizedUsername = normalizeUsername(rawUsername);

        if (!normalizedUsername) {
          setMsg("Error generando username público");
          setType("error");
          setLoading(false);
          return;
        }

        createPublicProfile({
          nombre: form.nombre,
          email: form.email,
          username: normalizedUsername,
          bio: "Bienvenido a mi perfil",
          categoria: form.objetivo || "General"
        });

        localStorage.removeItem("registerData");
        setMsg("Cuenta creada correctamente ✅");
        setType("success");

        // Redirigir directo al perfil público del usuario recién creado
        setTimeout(() => navigate(`/perfil/${normalizedUsername}`), 1200);
      } else {
        setMsg(data.message || "Error al registrarse");
        setType("error");
      }
    } catch (error) {
      console.error("Error en registro:", error);
      setMsg(error.message || "Error de conexión");
      setType("error");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    InputProps: { style: { color: "#fff" } },
    InputLabelProps: { style: { color: "#aaa" } }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField fullWidth label="Nombre" name="nombre" margin="normal" onChange={handleChange} value={form.nombre} {...inputStyle} />
            <TextField fullWidth label="Email" name="email" margin="normal" onChange={handleChange} value={form.email} {...inputStyle} />
            <TextField fullWidth label="Contraseña" type="password" name="password" margin="normal" onChange={handleChange} value={form.password} {...inputStyle} />
          </>
        );

      case 1:
        return (
          <>
            <TextField fullWidth label="Peso (kg)" name="peso" margin="normal" onChange={handleChange} value={form.peso} {...inputStyle} />
            <TextField fullWidth label="Altura (cm)" name="altura" margin="normal" onChange={handleChange} value={form.altura} {...inputStyle} />
          </>
        );

      case 2:
        return (
          <>
            <TextField select fullWidth label="Género" name="genero" margin="normal" onChange={handleChange} value={form.genero} {...inputStyle}>
              <MenuItem value="hombre">Hombre</MenuItem>
              <MenuItem value="mujer">Mujer</MenuItem>
              <MenuItem value="otro">Otro</MenuItem>
            </TextField>

            <TextField select fullWidth label="Objetivo" name="objetivo" margin="normal" onChange={handleChange} value={form.objetivo} {...inputStyle}>
              <MenuItem value="bajar_peso">🔥 Bajar de peso</MenuItem>
              <MenuItem value="mantener">⚖️ Mantenerme</MenuItem>
              <MenuItem value="musculo">💪 Ganar músculo</MenuItem>
              <MenuItem value="fuerza">🏋️ Ganar fuerza</MenuItem>
            </TextField>

            <TextField select fullWidth label="Frecuencia" name="frecuencia" margin="normal" onChange={handleChange} value={form.frecuencia} {...inputStyle}>
              <MenuItem value="0">Nunca</MenuItem>
              <MenuItem value="1-2">1-2 horas por semana</MenuItem>
              <MenuItem value="3-4">3-4 horas por semana</MenuItem>
              <MenuItem value="5+">5+ horas por semana</MenuItem>
            </TextField>
          </>
        );

      case 3:
        return (
          <>
            <TextField select fullWidth label="Condiciones médicas" name="condiciones" margin="normal" onChange={handleChange} value={form.condiciones} {...inputStyle}>
              <MenuItem value="ninguna">Ninguna</MenuItem>
              <MenuItem value="diabetes">Diabetes</MenuItem>
              <MenuItem value="hipertension">Hipertensión</MenuItem>
              <MenuItem value="asma">Asma</MenuItem>
            </TextField>

            <TextField select fullWidth label="Lesiones" name="lesiones" margin="normal" onChange={handleChange} value={form.lesiones} {...inputStyle}>
              <MenuItem value="ninguna">Ninguna</MenuItem>
              <MenuItem value="rodilla">Rodilla</MenuItem>
              <MenuItem value="espalda">Espalda</MenuItem>
              <MenuItem value="hombro">Hombro</MenuItem>
            </TextField>
          </>
        );

      case 4:
        return (
          <>
            <TextField fullWidth label="Profesión" name="profesion" margin="normal" onChange={handleChange} value={form.profesion} {...inputStyle} />
            <TextField select fullWidth label="Horas de sueño" name="sueno" margin="normal" onChange={handleChange} value={form.sueno} {...inputStyle}>
              <MenuItem value="5">Menos de 5h</MenuItem>
              <MenuItem value="6-7">6-7 horas</MenuItem>
              <MenuItem value="7-8">7-8 horas</MenuItem>
              <MenuItem value="8+">Más de 8 horas</MenuItem>
            </TextField>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#0f0f0f" }}>
      <Container maxWidth="sm">
        <Card sx={{ bgcolor: "#121212", p: 3, borderRadius: 4, boxShadow: "0 0 60px rgba(0,255,136,0.15)" }}>
          <CardContent>

            <Typography align="center" sx={{ color: "#00ff88", mb: 1, fontWeight: "bold" }}>
              {steps[step]}
            </Typography>

            <LinearProgress
              variant="determinate"
              value={((step + 1) / steps.length) * 100}
              sx={{ mb: 3, height: 8, borderRadius: 10 }}
            />

            {msg && <Alert severity={type}>{msg}</Alert>}

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.95, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -40 }}
                transition={{ duration: 0.35 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>

              {step > 0 && (
                <Button onClick={handleBack} sx={{ color: "#00ff88" }}>
                  Atrás
                </Button>
              )}

              {step < steps.length - 1 ? (
                <Button onClick={handleNext} sx={{ bgcolor: "#00ff88", color: "#000", px: 4 }}>
                  Siguiente
                </Button>
              ) : (
                <Button onClick={handleRegister} disabled={loading} sx={{ bgcolor: "#00ff88", color: "#000", px: 4 }}>
                  {loading ? "Creando..." : "Crear Cuenta 🚀"}
                </Button>
              )}

            </Box>

          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Register;
