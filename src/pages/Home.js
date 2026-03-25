import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  LinearProgress
} from "@mui/material";

import CreateTraining from "../components/CreateTraining";
import TrainingList from "../components/TrainingList";
import ChatAssistant from "../components/ChatAssistant";

function Home() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#0f0f0f" }}>

      {/* SIDEBAR */}
      <Box sx={{ width: 250, bgcolor: "#121212", p: 2, borderRight: "1px solid #1f1f1f" }}>

        {/* PERFIL */}
        <Box
          onClick={() => navigate("/profile")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            borderRadius: 3,
            cursor: "pointer",
            transition: "0.3s",
            '&:hover': {
              bgcolor: "rgba(0,255,136,0.1)",
              transform: "scale(1.02)"
            }
          }}
        >
          <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "#00ff88" }} />
          <Box>
            <Typography sx={{ color: "#fff", fontWeight: "bold" }}>
              {user?.nombre || "Usuario"}
            </Typography>
            <Typography sx={{ color: "#888", fontSize: 12 }}>
              Nivel 3 🔥
            </Typography>
          </Box>
        </Box>

        {/* MENU */}
        {[
          "Rutinas",
          "Progreso",
          "Calorías",
          "Objetivos"
        ].map((item, i) => (
          <Box
            key={i}
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 2,
              color: "#aaa",
              cursor: "pointer",
              '&:hover': {
                color: "#00ff88",
                bgcolor: "rgba(0,255,136,0.08)"
              }
            }}
          >
            {item}
          </Box>
        ))}

        <Button
          onClick={logout}
          sx={{ mt: 4, border: "1px solid #00ff88", color: "#00ff88" }}
        >
          EXIT
        </Button>
      </Box>

      {/* MAIN */}
      <Box sx={{ flex: 1, p: 4 }}>

        {/* HERO */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card sx={cardStyle}>
            <CardContent>
              <Typography sx={{ color: "#00ff88", fontSize: 20 }}>
                💪 Rutina de hoy
              </Typography>
              <Typography sx={{ color: "#fff", fontSize: 26, fontWeight: "bold", mt: 1 }}>
                Pecho + Tríceps
              </Typography>
              <Button sx={{ mt: 2, bgcolor: "#00ff88", color: "#000" }}>
                Empezar entrenamiento
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* GRID */}
        <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 3, mt: 3 }}>

          {/* IZQUIERDA */}
          <Box>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography sx={titleStyle}>YOUR GYM</Typography>
                <TrainingList />
              </CardContent>
            </Card>

            <Card sx={cardStyle}>
              <CardContent>
                <CreateTraining />
              </CardContent>
            </Card>

            <Card sx={cardStyle}>
              <CardContent>
                <Typography sx={titleStyle}>GYM AI</Typography>
                <ChatAssistant />
              </CardContent>
            </Card>
          </Box>

          {/* DERECHA */}
          <Box>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography sx={titleStyle}>🔥 Calorías</Typography>
                <LinearProgress variant="determinate" value={70} sx={progressStyle} />
                <Typography sx={textStyle}>1800 / 2200 kcal</Typography>
              </CardContent>
            </Card>

            <Card sx={cardStyle}>
              <CardContent>
                <Typography sx={titleStyle}>🥩 Proteína</Typography>
                <LinearProgress variant="determinate" value={50} sx={progressStyle} />
                <Typography sx={textStyle}>90 / 140 g</Typography>
              </CardContent>
            </Card>

            <Card sx={cardStyle}>
              <CardContent>
                <Typography sx={titleStyle}>💧 Agua</Typography>
                <LinearProgress variant="determinate" value={40} sx={progressStyle} />
                <Typography sx={textStyle}>1.5 / 3 L</Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

const cardStyle = {
  borderRadius: 4,
  bgcolor: "#121212",
  boxShadow: "0 0 30px rgba(0,255,136,0.08)",
  mb: 2
};

const titleStyle = {
  color: "#00ff88",
  mb: 1
};

const textStyle = {
  color: "#aaa",
  mt: 1
};

const progressStyle = {
  height: 8,
  borderRadius: 5,
  mt: 1
};

export default Home;