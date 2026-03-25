import React, { useState, useEffect } from "react";
import API_URL from "../config";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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

  // 💾 persistencia local
  useEffect(() => {
    const saved = localStorage.getItem("registerData");
    if (saved) setForm(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("registerData", JSON.stringify(form));
  }, [form]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateStep = () => {
    if (step === 0) {
      return form.nombre && form.email && form.password;
    }
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

      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.removeItem("registerData");
        setMsg("Cuenta creada correctamente ✅");
        setType("success");
        setTimeout(() => navigate("/"), 1500);
      } else {
        setMsg(data.message || "Error");
      }

    } catch {
      setMsg("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    InputProps: { style: { color: "#fff" } },
    InputLabelProps: { style: { color: "#888" } }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField fullWidth label="Nombre" name="nombre" margin="normal" onChange={handleChange} value={form.nombre} {...inputStyle} />
            <TextField fullWidth label="Email" name="email" margin="normal" onChange={handleChange} value={form.email} {...inputStyle} />
            <TextField fullWidth label="Password" type="password" name="password" margin="normal" onChange={handleChange} value={form.password} {...inputStyle} />
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
            </TextField>

            <TextField select fullWidth label="Objetivo" name="objetivo" margin="normal" onChange={handleChange} value={form.objetivo} {...inputStyle}>
              <MenuItem value="bajar_peso">Bajar peso</MenuItem>
              <MenuItem value="musculo">Ganar músculo</MenuItem>
            </TextField>

            <TextField select fullWidth label="Frecuencia" name="frecuencia" margin="normal" onChange={handleChange} value={form.frecuencia} {...inputStyle}>
              <MenuItem value="1-2">1-2</MenuItem>
              <MenuItem value="3-4">3-4</MenuItem>
            </TextField>
          </>
        );
      case 3:
        return (
          <>
            <TextField fullWidth label="Condiciones" name="condiciones" margin="normal" onChange={handleChange} value={form.condiciones} {...inputStyle} />
            <TextField fullWidth label="Lesiones" name="lesiones" margin="normal" onChange={handleChange} value={form.lesiones} {...inputStyle} />
          </>
        );
      case 4:
        return (
          <>
            <TextField fullWidth label="Profesión" name="profesion" margin="normal" onChange={handleChange} value={form.profesion} {...inputStyle} />
            <TextField fullWidth label="Horas de sueño" name="sueno" margin="normal" onChange={handleChange} value={form.sueno} {...inputStyle} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#0f0f0f" }}>
      <Container maxWidth="sm">
        <Card sx={{ bgcolor: "#121212", p: 3, borderRadius: 4, boxShadow: "0 0 40px rgba(0,255,136,0.1)" }}>
          <CardContent>

            {/* 🔥 PROGRESS */}
            <Typography align="center" sx={{ color: "#00ff88", mb: 1 }}>
              {steps[step]}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={((step + 1) / steps.length) * 100}
              sx={{ mb: 2, height: 6, borderRadius: 5 }}
            />

            {msg && <Alert severity={type}>{msg}</Alert>}

            {/* ✨ ANIMACIÓN */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* BOTONES */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>

              {step > 0 && (
                <Button onClick={handleBack} sx={{ color: "#00ff88" }}>
                  Atrás
                </Button>
              )}

              {step < steps.length - 1 ? (
                <Button onClick={handleNext} sx={{ bgcolor: "#00ff88", color: "#000" }}>
                  Siguiente
                </Button>
              ) : (
                <Button onClick={handleRegister} disabled={loading} sx={{ bgcolor: "#00ff88", color: "#000" }}>
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