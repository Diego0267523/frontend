import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  LinearProgress,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";

import CreateTraining from "../components/CreateTraining";
import TrainingList from "../components/TrainingList";
import ChatAssistant from "../components/ChatAssistant";

function Home() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [open, setOpen] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const menuItems = [
    { label: "🏋️ Rutinas", path: "/" },
    { label: "📈 Progreso", path: "/progreso" },
    { label: "🔥 Calorías", path: "/calorias" },
    { label: "🎯 Objetivos", path: "/objetivos" },
    { label: "🤖 AI", action: () => setShowAI(true) }
  ];

  const SidebarContent = () => (
    <Box sx={{ width: 250, bgcolor: "#0f0f0f", height: "100%", p: 2 }}>

      {/* PERFIL */}
      <motion.div whileHover={{ scale: 1.03 }}>
        <Box onClick={() => navigate("/profile")} sx={profileStyle}>
          <Box sx={avatarStyle} />
          <Box>
            <Typography sx={{ color: "#fff", fontWeight: "bold" }}>
              {user?.nombre || "Usuario"}
            </Typography>
          </Box>
        </Box>
      </motion.div>

      {/* MENU */}
      {menuItems.map((item, i) => {
        const isActive = location.pathname === item.path;

        return (
          <motion.div key={i} whileHover={{ scale: 1.05 }}>
            <Box
              onClick={() => {
                if (item.path) navigate(item.path);
                if (item.action) item.action();
                setOpen(false);
              }}
              sx={{
                ...menuItemStyle,
                color: isActive ? "#00ff88" : "#aaa",
                bgcolor: isActive ? "rgba(0,255,136,0.1)" : "transparent",
                borderLeft: isActive ? "3px solid #00ff88" : "3px solid transparent"
              }}
            >
              {item.label}
            </Box>
          </motion.div>
        );
      })}

      <Button onClick={logout} sx={logoutStyle} fullWidth>
        EXIT
      </Button>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#0f0f0f" }}>

      {/* SIDEBAR DESKTOP */}
      {!isMobile && <SidebarContent />}

      {/* MOBILE TOP */}
      {isMobile && (
        <Box sx={topBar}>
          <IconButton onClick={() => setOpen(true)}>
            <MenuIcon sx={{ color: "#00ff88" }} />
          </IconButton>
        </Box>
      )}

      {/* DRAWER */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { backgroundColor: "#0f0f0f" } }}
      >
        <SidebarContent />
      </Drawer>

      {/* MAIN */}
      <Box sx={{ flex: 1, p: isMobile ? 2 : 4, mt: isMobile ? 6 : 0 }}>

        {/* HERO */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card sx={cardStyleHover}>
            <CardContent>
              <Typography sx={titleStyle}>💪 Rutina de hoy</Typography>
              <Typography sx={heroText}>Pecho + Tríceps</Typography>
              <Button sx={ctaStyle} fullWidth={isMobile}>
                Empezar entrenamiento
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* GRID */}
        <Box sx={gridStyle(isMobile)}>

          <Box>
            <Card sx={cardStyleHover}>
              <CardContent>
                <Typography sx={titleStyle}>YOUR GYM</Typography>
                <TrainingList />
              </CardContent>
            </Card>

            <Card sx={cardStyleHover}>
              <CardContent>
                <CreateTraining />
              </CardContent>
            </Card>
          </Box>

          {!isMobile && (
            <Box>
              {["🔥 Calorías", "🥩 Proteína", "💧 Agua"].map((item, i) => (
                <Card key={i} sx={cardStyleHover}>
                  <CardContent>
                    <Typography sx={titleStyle}>{item}</Typography>
                    <LinearProgress variant="determinate" value={60} sx={progressStyle} />
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>

        {/* AI MODAL FIXED */}
        {showAI && (
          <Box sx={aiOverlay}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <Box sx={aiBox}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography sx={titleStyle}>GYM AI</Typography>
                  <Button onClick={() => setShowAI(false)} sx={{ color: "#00ff88" }}>
                    Cerrar
                  </Button>
                </Box>
                <ChatAssistant />
              </Box>
            </motion.div>
          </Box>
        )}

      </Box>
    </Box>
  );
}

// 🎨 STYLES
const cardStyleHover = {
  borderRadius: 4,
  bgcolor: "#121212",
  boxShadow: "0 0 30px rgba(0,255,136,0.08)",
  mb: 2,
  transition: "0.3s",
  '&:hover': {
    boxShadow: "0 0 40px rgba(0,255,136,0.2)",
    transform: "translateY(-3px)"
  }
};

const titleStyle = {
  color: "#00ff88",
  mb: 1
};

const heroText = {
  color: "#fff",
  fontSize: 26,
  fontWeight: "bold",
  mt: 1
};

const ctaStyle = {
  mt: 2,
  bgcolor: "#00ff88",
  color: "#000",
  fontWeight: "bold",
  '&:hover': {
    bgcolor: "#00cc6a"
  }
};

const avatarStyle = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  bgcolor: "#00ff88"
};

const profileStyle = {
  display: "flex",
  alignItems: "center",
  gap: 2,
  p: 2,
  borderRadius: 3,
  cursor: "pointer",
  transition: "0.3s",
  '&:hover': {
    bgcolor: "rgba(0,255,136,0.1)"
  }
};

const menuItemStyle = {
  mt: 2,
  p: 1.5,
  borderRadius: 2,
  cursor: "pointer",
  transition: "0.3s"
};

const logoutStyle = {
  mt: 4,
  border: "1px solid #00ff88",
  color: "#00ff88"
};

const progressStyle = {
  height: 8,
  borderRadius: 5,
  mt: 1
};

const gridStyle = (isMobile) => ({
  display: "grid",
  gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
  gap: 3,
  mt: 3
});

const topBar = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  p: 1,
  zIndex: 10,
  bgcolor: "rgba(15,15,15,0.9)",
  backdropFilter: "blur(10px)"
};

const aiOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.9)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 20
};

const aiBox = {
  width: "90%",
  maxWidth: 500,
  bgcolor: "#121212",
  p: 3,
  borderRadius: 4
};

export default Home;