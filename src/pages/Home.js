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
    <Box sx={sidebarStyle}>

      <Box onClick={() => navigate("/profile")} sx={profileStyle}>
        <Box sx={avatarStyle} />
        <Typography sx={{ color: "#fff", fontWeight: "bold" }}>
          {user?.nombre || "Usuario"}
        </Typography>
      </Box>

      {menuItems.map((item, i) => {
        const isActive = location.pathname === item.path;

        return (
          <Box
            key={i}
            onClick={() => {
              if (item.path) navigate(item.path);
              if (item.action) item.action();
            }}
            sx={{
              ...menuItemStyle,
              color: isActive ? "#00ff88" : "#777"
            }}
          >
            {item.label}
          </Box>
        );
      })}

      <Button onClick={logout} sx={logoutStyle} fullWidth>
        EXIT
      </Button>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", bgcolor: "#000" }}>

      {/* SIDEBAR FIJO */}
      {!isMobile && <SidebarContent />}

      {/* MOBILE */}
      {isMobile && (
        <Box sx={topBar}>
          <IconButton onClick={() => setOpen(true)}>
            <MenuIcon sx={{ color: "#00ff88" }} />
          </IconButton>
        </Box>
      )}

      <Drawer open={open} onClose={() => setOpen(false)}>
        <SidebarContent />
      </Drawer>

      {/* CONTENIDO CENTRAL */}
      <Box sx={centerContent(isMobile)}>

        {/* STORIES */}
        <Box sx={storiesContainer}>
          {[1,2,3,4,5].map((_,i) => (
            <Box key={i} sx={storyItem}>
              <Box sx={storyCircle} />
              <Typography sx={{ color: "#aaa", fontSize: 12 }}>
                user{i+1}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* POSTS (VACÍO POR AHORA) */}
        <Card sx={postCard}>
          <CardContent>
            <Typography sx={{ color: "#888" }}>
              Aquí irán las publicaciones fitness 🔥
            </Typography>
          </CardContent>
        </Card>

      </Box>

      {/* PANEL DERECHO */}
      {!isMobile && (
        <Box sx={rightPanel}>

          {/* GRAFICA */}
          <Card sx={postCard}>
            <CardContent>
              <Typography sx={titleStyle}>
                📊 Calorías semana
              </Typography>

              {/* fake bars */}
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                {[40,60,80,50,70,90,65].map((v,i)=>(
                  <Box key={i} sx={{
                    width: 10,
                    height: v,
                    bgcolor: "#00ff88",
                    borderRadius: 2
                  }} />
                ))}
              </Box>

            </CardContent>
          </Card>

          {/* METRICAS */}
          {["🔥 Calorías", "🥩 Proteína", "💧 Agua"].map((item, i) => (
            <Card key={i} sx={postCard}>
              <CardContent>
                <Typography sx={titleStyle}>{item}</Typography>
                <LinearProgress variant="determinate" value={60} sx={progressStyle} />
              </CardContent>
            </Card>
          ))}

        </Box>
      )}

      {/* AI */}
      {showAI && (
        <Box sx={aiOverlay}>
          <Box sx={aiBox}>
            <Typography sx={titleStyle}>GYM AI</Typography>
            <Button onClick={() => setShowAI(false)}>Cerrar</Button>
            <ChatAssistant />
          </Box>
        </Box>
      )}

    </Box>
  );
}

/* 🎨 STYLES */

const sidebarStyle = {
  width: 250,
  height: "100vh",
  position: "fixed",
  left: 0,
  top: 0,
  bgcolor: "#0b0b0b",
  p: 2
};

const centerContent = (isMobile) => ({
  marginLeft: isMobile ? 0 : 250,
  marginRight: isMobile ? 0 : 300,
  width: "100%",
  minHeight: "100vh",
  p: 2
});

const rightPanel = {
  width: 300,
  height: "100vh",
  position: "fixed",
  right: 0,
  top: 0,
  p: 2,
  bgcolor: "#0b0b0b"
};

const postCard = {
  bgcolor: "#111",
  mb: 2,
  borderRadius: 4
};

const storiesContainer = {
  display: "flex",
  gap: 2,
  overflowX: "auto",
  mb: 2
};

const storyItem = { textAlign: "center" };

const storyCircle = {
  width: 60,
  height: 60,
  borderRadius: "50%",
  background: "linear-gradient(45deg,#00ff88,#00ccff)"
};

const titleStyle = { color: "#00ff88" };

const avatarStyle = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  bgcolor: "#00ff88"
};

const profileStyle = {
  display: "flex",
  gap: 2,
  mb: 2,
  cursor: "pointer"
};

const menuItemStyle = {
  mt: 2,
  cursor: "pointer"
};

const logoutStyle = {
  mt: 4,
  border: "1px solid #00ff88",
  color: "#00ff88"
};

const progressStyle = {
  height: 8,
  mt: 1
};

const topBar = {
  position: "fixed",
  top: 0,
  width: "100%",
  bgcolor: "#000"
};

const aiOverlay = {
  position: "fixed",
  inset: 0,
  background: "#000",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const aiBox = {
  bgcolor: "#111",
  padding: 3
};

export default Home;