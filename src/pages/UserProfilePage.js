import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserProfile } from "../hooks/useUserProfile";
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Card,
  CardMedia,
  Tooltip,
  CircularProgress,
  Button,
  Container,
  Avatar,
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GridOnRoundedIcon from "@mui/icons-material/GridOnRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

function UserProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [hoveredPostId, setHoveredPostId] = useState(null);

  const safeUsername = username?.toLowerCase()?.trim() || "";

  const profileResult = useUserProfile(safeUsername) || {};
  const {
    user = null,
    loading = false,
    error = null,
  } = profileResult;

  const userPosts = useMemo(() => (Array.isArray(user?.posts) ? user.posts : []), [user]);

  const stats = useMemo(
    () => [
      { label: "Publicaciones", value: userPosts.length },
      { label: "Racha", value: `${user?.racha || 0} días` },
      { label: "Nivel", value: user?.nivelActividad || "Pro" },
    ],
    [user, userPosts.length]
  );

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#0b0b0b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ color: "#00ff88", mb: 2 }} />
          <Typography sx={{ color: "#8b949e", fontSize: 14 }}>
            Cargando perfil...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!safeUsername || error || !user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#0b0b0b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ textAlign: "center" }}>
            <ErrorOutlineIcon
              sx={{
                fontSize: 64,
                color: "#ff3333",
                mb: 2,
              }}
            />

            <Typography
              sx={{
                fontSize: 24,
                fontWeight: 800,
                color: "#fff",
                mb: 1,
              }}
            >
              Perfil no encontrado
            </Typography>

            <Typography
              sx={{
                color: "#8b949e",
                fontSize: 14,
                mb: 3,
              }}
            >
              No encontramos @{safeUsername}
            </Typography>

            <Button
              onClick={() => navigate("/")}
              variant="outlined"
              sx={{
                borderColor: "#00ff88",
                color: "#00ff88",
                fontWeight: 700,
                textTransform: "none",
              }}
            >
              Volver al inicio
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "#0b0b0b",
        color: "#fff",
        p: { xs: 2, md: 4 },
        minHeight: "100vh",
      }}
    >
      <Tooltip title="Volver atrás" arrow>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            color: "#00ff88",
            mb: 3,
            border: "1px solid rgba(0,255,136,0.3)",
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Tooltip>

      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
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
          <Box
            sx={{
              p: 1,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #00ff88, #00c6ff)",
            }}
          >
            <Avatar
              src={user?.avatar || user?.image || ""}
              alt={user?.nombre || safeUsername}
              sx={{ width: 110, height: 110, bgcolor: "#111", color: "#00ff88", fontWeight: 800 }}
            >
              {(user?.nombre || safeUsername || "U").charAt(0).toUpperCase()}
            </Avatar>
          </Box>

          <Box sx={{ flex: 1, width: "100%" }}>
            <Typography
              sx={{
                fontSize: { xs: 20, md: 28 },
                fontWeight: 800,
                mb: 1,
              }}
            >
              {user.nombre || safeUsername}
            </Typography>

            <Typography sx={{ color: "#8b949e", fontSize: 13, mb: 2 }}>
              📧 {user.email || "Sin email"}
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: { xs: 2.5, md: 5 },
                flexWrap: "wrap",
                mb: 3,
              }}
            >
              {stats.map((stat, idx) => (
                <Box key={idx}>
                  <Typography
                    sx={{
                      fontSize: { xs: 18, md: 24 },
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

            <Typography sx={{ color: "#c9d1d9", fontSize: 14 }}>
              {user.bio || "Sin biografía"}
            </Typography>
          </Box>
        </Box>
      </motion.div>

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
        <Typography fontWeight={700}>PUBLICACIONES</Typography>
      </Box>

      <Grid container spacing={2}>
        {userPosts.map((post, idx) => (
          <Grid item xs={12} sm={6} md={4} key={post.id || idx}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 2,
                  aspectRatio: "1/1",
                }}
              >
                <CardMedia
                  component="img"
                  image={post.image || "https://via.placeholder.com/500x500?text=Post"}
                  alt={post.caption || "post"}
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default UserProfilePage;