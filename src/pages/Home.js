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

import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MenuIcon from "@mui/icons-material/Menu";
import BarChartIcon from "@mui/icons-material/BarChart"; // ✅ ICONO NUEVO

import ChatAssistant from "../components/ChatAssistant";

function Home() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [open, setOpen] = useState(false);
  const [openRight, setOpenRight] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const menuItems = [
    { label: "🏋️ Rutinas", path: "/" },
    { label: "📈 Progreso", path: "/progreso" },
    { label: "🔥 Calorías", path: "/calorias" },
    { label: "🎯 Objetivos", path: "/objetivos" },
    { label: "🤖 AI", action: () => setShowAI(true) }
  ];

  const posts = [
    {
      user: "DiegoFit",
      image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e",
      caption: "Día de pecho 💪🔥",
      likes: 120,
      time: "Hace 2h"
    },
    {
      user: "GymBro",
      image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61",
      caption: "No pain no gain 🧠",
      likes: 98,
      time: "Hace 5h"
    }
  ];

  const SidebarContent = () => (
    <Box sx={sidebarStyle}>
      <motion.div whileHover={{ scale: 1.05 }}>
        <Box onClick={() => navigate("/profile")} sx={profileStyle}>
          <Box sx={avatarStyle} />
          <Typography sx={{ color: "#fff", fontWeight: "bold" }}>
            {user?.nombre || "Usuario"}
          </Typography>
        </Box>
      </motion.div>

      <Box sx={{ flex: 1 }}>
        {menuItems.map((item, i) => {
          const isActive = location.pathname === item.path;

          return (
            <motion.div key={i} whileHover={{ scale: 1.03 }}>
              <Box
                onClick={() => {
                  if (item.path) navigate(item.path);
                  if (item.action) item.action();
                }}
                sx={{
                  ...menuItemStyle,
                  bgcolor: isActive ? "#00ff8820" : "#151515",
                  color: isActive ? "#00ff88" : "#ccc"
                }}
              >
                {item.label}
              </Box>
            </motion.div>
          );
        })}
      </Box>

      <Button onClick={logout} sx={logoutStyle} fullWidth>
        EXIT
      </Button>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", bgcolor: "#000", width: "100%", overflowX: "hidden" }}>

      {/* SIDEBAR DESKTOP */}
      {!isMobile && <SidebarContent />}

      {/* TOPBAR MOBILE */}
      {isMobile && (
        <Box sx={topBar}>
          <IconButton onClick={() => setOpen(true)}>
            <MenuIcon sx={{ color: "#00ff88" }} />
          </IconButton>

          {/* ✅ ICONO DERECHO CORREGIDO */}
          <IconButton onClick={() => setOpenRight(true)}>
            <BarChartIcon sx={{ color: "#00ff88" }} />
          </IconButton>
        </Box>
      )}

      {/* DRAWER IZQUIERDO */}
      <Drawer open={open} onClose={() => setOpen(false)}>
        <SidebarContent />
      </Drawer>

      {/* DRAWER DERECHO */}
      <Drawer
        anchor="right"
        open={openRight}
        onClose={() => setOpenRight(false)}
        PaperProps={{ sx: { bgcolor: "#0b0b0b", width: 300 } }}
      >
        <Box sx={{ p: 2 }}>
          <Card sx={postCard}>
            <CardContent>
              <Typography sx={titleStyle}>📊 Calorías semana</Typography>
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

          {["🔥 Calorías", "🥩 Proteína", "💧 Agua"].map((item, i) => (
            <Card key={i} sx={postCard}>
              <CardContent>
                <Typography sx={titleStyle}>{item}</Typography>
                <LinearProgress variant="determinate" value={60} sx={progressStyle} />
              </CardContent>
            </Card>
          ))}
        </Box>
      </Drawer>

      {/* 🔥 CENTRO */}
      <Box sx={centerContent(isMobile)}>
        <Box sx={{
          width: "100%",
          maxWidth: 500,
          margin: "0 auto"
        }}>

          {/* STORIES */}
          <Box sx={storiesContainer}>
            {[1,2,3,4,5].map((_,i) => (
              <motion.div key={i} whileHover={{ scale: 1.1 }}>
                <Box sx={storyItem}>
                  <Box sx={storyCircle} />
                  <Typography sx={{ color: "#aaa", fontSize: 12 }}>
                    user{i+1}
                  </Typography>
                </Box>
              </motion.div>
            ))}
          </Box>

          {/* POSTS */}
          {posts.map((post, i) => (
            <motion.div key={i} whileHover={{ scale: 1.01 }}>
              <Card sx={postCard}>
                <CardContent>

                  <Box sx={headerStyle}>
                    <Box sx={avatarStyle} />
                    <Box>
                      <Typography sx={username}>{post.user}</Typography>
                      <Typography sx={time}>{post.time}</Typography>
                    </Box>
                  </Box>

                  <Box component="img" src={post.image} sx={imageStyle} />

                  <Box sx={actionsStyle}>
                    <IconButton>
                      <FavoriteIcon sx={{ color: "#aaa" }} />
                    </IconButton>
                    <IconButton>
                      <ChatBubbleOutlineIcon sx={{ color: "#aaa" }} />
                    </IconButton>
                  </Box>

                  <Typography sx={likes}>{post.likes} likes</Typography>
                  <Typography sx={caption}>
                    <b>{post.user}</b> {post.caption}
                  </Typography>

                </CardContent>
              </Card>
            </motion.div>
          ))}

        </Box>
      </Box>

      {/* DERECHA DESKTOP */}
      {!isMobile && (
        <Box sx={rightPanel}>
          <Card sx={postCard}>
            <CardContent>
              <Typography sx={titleStyle}>📊 Calorías semana</Typography>
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
  p: 2,
  display: "flex",
  flexDirection: "column"
};

const centerContent = (isMobile) => ({
  flex: 1,
  minWidth: 0,
  marginLeft: isMobile ? 0 : 250,
  marginRight: isMobile ? 0 : 280,
  width: isMobile ? "100%" : "calc(100vw - 530px)",
  display: "flex",
  justifyContent: "center",
  boxSizing: "border-box",
  paddingTop: isMobile ? 60 : 20,
  overflowX: "hidden"
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

const postCard = { bgcolor: "#111", mb: 2, borderRadius: 4 };

const headerStyle = { display: "flex", alignItems: "center", gap: 10, mb: 1 };
const username = { color: "#fff", fontWeight: "bold" };
const time = { color: "#777", fontSize: 12 };

const imageStyle = {
  width: "100%",
  height: 300,
  objectFit: "cover",
  borderRadius: 10,
  marginTop: 10
};

const actionsStyle = { display: "flex", gap: 1, mt: 1 };
const likes = { color: "#fff", mt: 1 };
const caption = { color: "#ccc", mt: 1 };

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
  p: 1.5,
  borderRadius: 3,
  cursor: "pointer",
  transition: "0.3s",
  '&:hover': {
    bgcolor: "#00ff8830",
    color: "#00ff88"
  }
};

const logoutStyle = {
  mt: "auto",
  bgcolor: "#00ff88",
  color: "#000",
  fontWeight: "bold",
  '&:hover': {
    bgcolor: "#00cc6a"
  }
};

const progressStyle = { height: 8, mt: 1 };

const topBar = {
  position: "fixed",
  top: 0,
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  bgcolor: "#000",
  zIndex: 10
};

const aiOverlay = {
  position: "fixed",
  inset: 0,
  background: "#000",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const aiBox = { bgcolor: "#111", padding: 3 };

export default Home;