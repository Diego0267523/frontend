import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  LinearProgress,
  IconButton,
  Drawer
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";

import CreateTraining from "../components/CreateTraining";
import TrainingList from "../components/TrainingList";
import ChatAssistant from "../components/ChatAssistant";

function Home() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <Box sx={{ width: 250, bgcolor: "#121212", height: "100%", p: 2 }}>

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
      {["🏋️ Rutinas", "📈 Progreso", "🔥 Calorías", "🎯 Objetivos"].map((item, i) => (
        <motion.div key={i} whileHover={{ scale: 1.05 }}>
          <Box
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
        </motion.div>
      ))}

      <Button
        onClick={logout}
        sx={{ mt: 4, border: "1px solid #00ff88", color: "#00ff88" }}
        fullWidth
      >
        EXIT
      </Button>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0f0f0f" }}>

      {/* TOP BAR MOBILE */}
      <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
        <IconButton onClick={() => setOpen(true)}>
          <MenuIcon sx={{ color: "#00ff88" }} />
        </IconButton>
        <Typography sx={{ color: "#00ff88", fontWeight: "bold", ml: 2 }}>
          GYM
        </Typography>
      </Box>

      {/* DRAWER */}
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { bgcolor: "#121212" }
        }}
      >
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SidebarContent />
            </motion.div>
          )}
        </AnimatePresence>
      </Drawer>

      {/* MAIN */}
      <Box sx={{ p: 2 }}>

        {/* HERO */}
        <Card sx={cardStyle}>
          <CardContent>
            <Typography sx={{ color: "#00ff88" }}>
              💪 Rutina de hoy
            </Typography>
            <Typography sx={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>
              Pecho + Tríceps
            </Typography>
            <Button sx={{ mt: 2, bgcolor: "#00ff88", color: "#000" }} fullWidth>
              Empezar entrenamiento
            </Button>
          </CardContent>
        </Card>

        {/* CONTENT */}
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

        {/* STATS */}
        {["Calorías", "Proteína", "Agua"].map((item, i) => (
          <Card key={i} sx={cardStyle}>
            <CardContent>
              <Typography sx={titleStyle}>{item}</Typography>
              <LinearProgress variant="determinate" value={60} sx={progressStyle} />
            </CardContent>
          </Card>
        ))}

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

const progressStyle = {
  height: 8,
  borderRadius: 5,
  mt: 1
};

export default Home;
