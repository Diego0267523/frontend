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
  useMediaQuery,
  Avatar
} from "@mui/material";

import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MenuIcon from "@mui/icons-material/Menu";
import BarChartIcon from "@mui/icons-material/BarChart";

function Home() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [open, setOpen] = useState(false);

  const posts = [
    {
      user: "DiegoFit",
      image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800",
      caption: "Día de pecho 💪🔥",
      likes: 120,
      time: "Hace 2h"
    },
    {
      user: "GymBro",
      image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800",
      caption: "No pain no gain 🧠",
      likes: 98,
      time: "Hace 5h"
    }
  ];

  return (
    <Box sx={{ display: "flex", bgcolor: "#050505", minHeight: "100vh" }}>

      {/* SIDEBAR (NO TOCADO) */}
      {!isMobile && (
        <Box sx={sidebarStyle}>
          <Typography sx={logo}>GYM APP</Typography>

          <Box sx={profileBox}>
            <Avatar sx={{ bgcolor: "#00ff88" }} />
            <Typography sx={{ color: "#fff" }}>{user?.nombre}</Typography>
          </Box>

          {["Inicio", "Progreso", "Calorías"].map((item, i) => (
            <Box key={i} sx={menuItem}>
              {item}
            </Box>
          ))}

          <Button onClick={logout} sx={logoutBtn}>Salir</Button>
        </Box>
      )}

      {/* MOBILE TOP */}
      {isMobile && (
        <Box sx={topBar}>
          <IconButton onClick={() => setOpen(true)}>
            <MenuIcon sx={{ color: "#00ff88" }} />
          </IconButton>
        </Box>
      )}

      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box sx={sidebarStyle} />
      </Drawer>

      {/* 🔥 CENTRO MEJORADO */}
      <Box sx={feed}>

        {/* STORIES MEJORADAS */}
        <Box sx={stories}>
          {[1,2,3,4,5].map(i => (
            <motion.div key={i} whileHover={{ scale: 1.1 }}>
              <Box sx={storyWrapper}>
                <Box sx={story} />
                <Typography sx={storyText}>user{i}</Typography>
              </Box>
            </motion.div>
          ))}
        </Box>

        {/* POSTS MEJORADOS */}
        {posts.map((post, i) => (
          <motion.div key={post.user + i} whileHover={{ scale: 1.01 }}>
            <Card sx={card}>
              <CardContent>

                <Box sx={postHeader}>
                  <Avatar sx={{ bgcolor: "#00ff88" }} />
                  <Box>
                    <Typography sx={username}>{post.user}</Typography>
                    <Typography sx={time}>{post.time}</Typography>
                  </Box>
                </Box>

                <Box component="img" src={post.image} sx={image} />

                <Box sx={actions}>
                  <IconButton>
                    <FavoriteIcon sx={{ color: "#ff4d6d" }} />
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
  );
}

/* 🎨 SOLO SE MEJORÓ EL CENTRO */

const sidebarStyle = {
  width: 240,
  bgcolor: "#0a0a0a",
  p: 3,
  display: "flex",
  flexDirection: "column",
  gap: 3
};

const logo = {
  color: "#00ff88",
  fontWeight: "bold",
  fontSize: 22
};

const profileBox = {
  display: "flex",
  alignItems: "center",
  gap: 1
};

const menuItem = {
  color: "#aaa",
  p: 1,
  borderRadius: 2,
  cursor: "pointer",
  '&:hover': {
    bgcolor: "#00ff8820",
    color: "#00ff88"
  }
};

const logoutBtn = {
  mt: "auto",
  bgcolor: "#00ff88",
  color: "#000"
};

const feed = {
  flex: 1,
  maxWidth: 520,
  margin: "0 auto",
  paddingTop: 20
};

const stories = {
  display: "flex",
  gap: 2,
  overflowX: "auto",
  mb: 3
};

const storyWrapper = {
  textAlign: "center"
};

const story = {
  width: 65,
  height: 65,
  borderRadius: "50%",
  background: "linear-gradient(45deg,#00ff88,#00ccff)",
  boxShadow: "0 0 12px #00ff88"
};

const storyText = {
  color: "#aaa",
  fontSize: 12,
  mt: 0.5
};

const card = {
  bgcolor: "#111",
  borderRadius: 4,
  mb: 2,
  boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
};

const postHeader = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  mb: 1
};

const username = {
  color: "#fff",
  fontWeight: "bold"
};

const time = {
  color: "#777",
  fontSize: 12
};

const image = {
  width: "100%",
  height: 300,
  objectFit: "cover",
  borderRadius: 10,
  marginTop: 10
};

const actions = {
  display: "flex",
  gap: 1,
  mt: 1
};

const likes = {
  color: "#fff",
  mt: 1
};

const caption = {
  color: "#ccc",
  mt: 0.5
};

const topBar = {
  position: "fixed",
  width: "100%",
  bgcolor: "#000",
  zIndex: 10
};

export default Home;