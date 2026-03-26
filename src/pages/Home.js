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
      likes: 120
    }
  ];

  return (
    <Box sx={{ display: "flex", bgcolor: "#050505", minHeight: "100vh" }}>

      {/* SIDEBAR */}
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

      {/* FEED */}
      <Box sx={feed}>

        {/* STORIES */}
        <Box sx={stories}>
          {[1,2,3,4].map(i => (
            <Box key={i} sx={story} />
          ))}
        </Box>

        {/* POSTS */}
        {posts.map((post, i) => (
          <motion.div key={i} whileHover={{ scale: 1.02 }}>
            <Card sx={card}>
              <CardContent>

                <Box sx={postHeader}>
                  <Avatar sx={{ bgcolor: "#00ff88" }} />
                  <Typography sx={username}>{post.user}</Typography>
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

/* 🎨 ESTILOS PRO */

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
  maxWidth: 600,
  margin: "0 auto",
  p: 2
};

const stories = {
  display: "flex",
  gap: 2,
  mb: 2
};

const story = {
  width: 60,
  height: 60,
  borderRadius: "50%",
  background: "linear-gradient(45deg,#00ff88,#00ccff)",
  boxShadow: "0 0 10px #00ff88"
};

const card = {
  bgcolor: "#111",
  borderRadius: 4,
  mb: 2,
  boxShadow: "0 0 15px rgba(0,255,136,0.2)"
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

const image = {
  width: "100%",
  borderRadius: 10,
  marginTop: 10
};

const actions = {
  display: "flex",
  gap: 1
};

const likes = {
  color: "#fff",
  mt: 1
};

const caption = {
  color: "#ccc"
};

const topBar = {
  position: "fixed",
  width: "100%",
  bgcolor: "#000"
};

export default Home;