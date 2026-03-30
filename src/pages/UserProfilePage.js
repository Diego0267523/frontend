import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Grid,
  Card,
  CardMedia,
  Tooltip,
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GridOnRoundedIcon from "@mui/icons-material/GridOnRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import ProfileAvatar from "../components/ProfileAvatar";

function UserProfilePage() {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hoveredPostId, setHoveredPostId] = useState(null);

  // 🔥 Mock data - reemplazar con API cuando esté lista
  const userPosts = useMemo(
    () =>
      user?.posts || [
        {
          id: 1,
          image:
            "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&h=500&fit=crop",
          likes: 120,
          comments: 14,
        },
        {
          id: 2,
          image:
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop",
          likes: 98,
          comments: 8,
        },
        {
          id: 3,
          image:
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop",
          likes: 156,
          comments: 22,
        },
        {
          id: 4,
          image:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=500&fit=crop",
          likes: 200,
          comments: 31,
        },
        {
          id: 5,
          image:
            "https://images.unsplash.com/photo-1470114716159-e389f8712fda?w=500&h=500&fit=crop",
          likes: 178,
          comments: 19,
        },
        {
          id: 6,
          image:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
          likes: 234,
          comments: 45,
        },
      ],
    [user],
  );

  if (!user) {
    return (
      <Box
        sx={{
          color: "#fff",
          p: 3,
          minHeight: "100vh",
          bgcolor: "#0b0b0b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>Perfil no encontrado</Typography>
      </Box>
    );
  }

  const stats = [
    { label: "Publicaciones", value: userPosts.length },
    { label: "Racha", value: `${user.racha || 0} días` },
    { label: "Nivel", value: user.nivelActividad || "Pro" },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "#0b0b0b",
        color: "#fff",
        p: { xs: 2, md: 4 },
        pb: 4,
      }}
    >
      {/* 🔙 BACK BUTTON */}
      <Tooltip title="Volver">
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            color: "#00ff88",
            mb: 3,
            border: "1px solid rgba(0,255,136,0.3)",
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: "rgba(0,255,136,0.08)",
              boxShadow: "0 0 12px rgba(0,255,136,0.2)",
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Tooltip>

      {/* 👤 HEADER INSTAGRAM STYLE */}
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            display: "flex",
            gap: { xs: 3, md: 8 },
            mb: 4,
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "center", sm: "flex-start" },
          }}
        >
          {/* AVATAR */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <ProfileAvatar size={110} />
          </Box>

          {/* INFO SECTION */}
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: { xs: 20, md: 28 },
                fontWeight: 800,
                letterSpacing: "-0.03em",
                mb: 1,
                color: "#fff",
              }}
            >
              {user.nombre}
            </Typography>

            {/* EMAIL */}
            <Typography
              sx={{
                color: "#8b949e",
                fontSize: 14,
                mb: 2,
              }}
            >
              {user.email}
            </Typography>

            {/* STATS */}
            <Box
              sx={{
                display: "flex",
                gap: { xs: 2, md: 4 },
                flexWrap: "wrap",
                mb: 3,
              }}
            >
              {stats.map((stat, idx) => (
                <Box key={idx} sx={{ textAlign: "center" }}>
                  <Typography
                    sx={{
                      fontSize: { xs: 16, md: 20 },
                      fontWeight: 800,
                      color: "#00ff88",
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#8b949e" }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* BIO */}
            <Typography
              sx={{
                color: "#c9d1d9",
                fontSize: 14,
                maxWidth: 500,
                lineHeight: 1.6,
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
          mt: 4,
          pt: 3,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          color: "#8b949e",
        }}
      >
        <GridOnRoundedIcon />
        <Typography fontWeight={700} sx={{ fontSize: 14 }}>
          PUBLICACIONES
        </Typography>
      </Box>

      {/* GRID POSTS */}
      <Grid container spacing={2}>
        {userPosts.map((post, idx) => (
          <Grid item xs={12} sm={6} md={4} key={post.id}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              onMouseEnter={() => setHoveredPostId(post.id)}
              onMouseLeave={() => setHoveredPostId(null)}
              style={{ height: "100%" }}
            >
              <Card
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 2,
                  aspectRatio: "1/1",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  border: "1px solid rgba(0,255,136,0.1)",
                  bgcolor: "transparent",
                  "&:hover": {
                    transform: "scale(1.02)",
                    borderColor: "rgba(0,255,136,0.3)",
                    boxShadow: "0 0 20px rgba(0,255,136,0.15)",
                  },
                }}
              >
                {/* POST IMAGE */}
                <CardMedia
                  component="img"
                  image={post.image}
                  alt={`Post ${post.id}`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                {/* OVERLAY */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredPostId === post.id ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,255,136,0.1) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    pointerEvents: hoveredPostId === post.id ? "auto" : "none",
                  }}
                >
                  {/* LIKES */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <FavoriteRoundedIcon
                      sx={{
                        fontSize: 28,
                        color: "#ff3333",
                        filter: "drop-shadow(0 0 4px rgba(255,51,51,0.6))",
                      }}
                    />
                    <Typography
                      sx={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {post.likes}
                    </Typography>
                  </Box>

                  {/* COMMENTS */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <ChatBubbleRoundedIcon
                      sx={{
                        fontSize: 28,
                        color: "#00ff88",
                        filter: "drop-shadow(0 0 4px rgba(0,255,136,0.6))",
                      }}
                    />
                    <Typography
                      sx={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {post.comments}
                    </Typography>
                  </Box>
                </motion.div>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* EMPTY STATE */}
      {userPosts.length === 0 && (
        <Box
          sx={{
            py: 8,
            textAlign: "center",
            color: "#8b949e",
          }}
        >
          <Typography sx={{ fontSize: 16 }}>
            Sin publicaciones aún. ¡Sube tu primer post! 📸
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default UserProfilePage;