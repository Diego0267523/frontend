import React, { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import Grid from "@mui/material/Grid2";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Card,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GridOnRoundedIcon from "@mui/icons-material/GridOnRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import ProfileAvatar from "../components/ProfileAvatar";

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") navigate(-1);
    };

    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [navigate]);

  if (!user) {
    return (
      <Box sx={{ color: "#fff", p: 3, minHeight: "100vh", bgcolor: "#0f0f0f" }}>
        <Typography>Cargando perfil...</Typography>
      </Box>
    );
  }

  // 🔥 MOCK TEMPORAL POSTS DEL USUARIO
  const userPosts = user.posts || [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
      likes: 120,
      comments: 14,
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48",
      likes: 98,
      comments: 8,
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
      likes: 156,
      comments: 22,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0b0b0b",
        color: "#fff",
        p: { xs: 2, md: 4 },
      }}
    >
      {/* 🔙 BACK */}
      <IconButton
        onClick={() => navigate(-1)}
        sx={{
          color: "#00ff88",
          mb: 3,
          border: "1px solid rgba(0,255,136,0.3)",
          "&:hover": {
            bgcolor: "rgba(0,255,136,0.08)",
          },
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      {/* 👤 HEADER INSTAGRAM STYLE */}
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            alignItems: "center",
            mb: 5,
            pb: 4,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <ProfileAvatar size={110} />

          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: "-0.03em",
              }}
            >
              {user.nombre}
            </Typography>

            <Typography
              sx={{
                color: "#8b949e",
                mt: 0.5,
                mb: 2,
              }}
            >
              {user.email}
            </Typography>

            {/* STATS */}
            <Box
              sx={{
                display: "flex",
                gap: 4,
                flexWrap: "wrap",
              }}
            >
              <Typography>
                <b>{userPosts.length}</b> publicaciones
              </Typography>

              <Typography>
                <b>{user.racha || 0}</b> días
              </Typography>

              <Typography>
                <b>{user.nivelActividad || "Pro"}</b>
              </Typography>
            </Box>

            {/* BIO */}
            <Typography
              sx={{
                mt: 2,
                color: "#c9d1d9",
                maxWidth: 600,
              }}
            >
              🎯 {user.objetivo || "Transformando mi físico cada día 💪"}
            </Typography>
          </Box>
        </Box>
      </motion.div>

      {/* POSTS HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 3,
          color: "#8b949e",
        }}
      >
        <GridOnRoundedIcon />
        <Typography fontWeight={700}>Publicaciones</Typography>
      </Box>

      {/* GRID POSTS */}
      <Grid container spacing={2}>
        {userPosts.map((post, i) => (
          <Grid xs={12} sm={6} md={4} key={post.id}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card
                sx={{
                  position: "relative",
                  borderRadius: 4,
                  overflow: "hidden",
                  bgcolor: "#111",
                  cursor: "pointer",
                  "&:hover .overlay": {
                    opacity: 1,
                  },
                }}
              >
                <Box
                  component="img"
                  src={post.image}
                  alt="post"
                  sx={{
                    width: "100%",
                    height: 320,
                    objectFit: "cover",
                  }}
                />

                {/* HOVER OVERLAY */}
                <Box
                  className="overlay"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bgcolor: "rgba(0,0,0,0.55)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 3,
                    opacity: 0,
                    transition: "all 0.25s ease",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <FavoriteRoundedIcon />
                    <Typography>{post.likes}</Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={0.5}>
                    <ChatBubbleRoundedIcon />
                    <Typography>{post.comments}</Typography>
                  </Box>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Profile;