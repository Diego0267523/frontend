/**
 * 📱 PÁGINA DE PERFIL DE USUARIO - ESTILO INSTAGRAM
 * 
 * Características:
 * - URL dinámica: /app/u/:username
 * - Carga de datos simulada desde mockUsers
 * - Manejo profesional de estados (cargando, error, 404)
 * - Grid responsive de posts con hover overlays
 * - Animaciones fluidas con Framer Motion
 * - SPA sin recargas de página
 * 
 * En producción:
 * - Reemplazar useUserProfile con llamadas HTTP a API
 * - Implementar caché y paginación
 * - Agregar funcionalidades: seguir/dejar de seguir, mensaje directo, etc.
 */

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
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GridOnRoundedIcon from "@mui/icons-material/GridOnRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ProfileAvatar from "../components/ProfileAvatar";

/**
 * Componente principal de perfil de usuario
 * Renderiza el perfil Instagram-style con posts y estadísticas
 */
function UserProfilePage() {
  // 📍 Obtener nombre de usuario de la URL
  const { username } = useParams();
  const navigate = useNavigate();
  const [hoveredPostId, setHoveredPostId] = useState(null);

  // 🎣 Hook personalizado para cargar perfil del usuario
  const { user, loading, error } = useUserProfile(username);

  // 📊 Datos procesados del usuario (memoized para rendimiento)
  const userPosts = useMemo(() => {
    return user?.posts || [];
  }, [user]);

  const stats = useMemo(
    () => [
      { label: "Publicaciones", value: userPosts.length },
      { label: "Racha", value: `${user?.racha || 0} días` },
      { label: "Nivel", value: user?.nivelActividad || "0" },
    ],
    [user, userPosts.length]
  );

  // ⏳ ESTADO: CARGANDO
  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
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

  // ❌ ESTADO: ERROR O USUARIO NO ENCONTRADO (404)
  if (error || !user) {
    return (
      <Box
        sx={{
          width: "100%",
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
            {/* Ícono de error */}
            <ErrorOutlineIcon
              sx={{
                fontSize: 64,
                color: "#ff3333",
                mb: 2,
                opacity: 0.8,
              }}
            />

            {/* Título del error */}
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

            {/* Descripción del error */}
            <Typography
              sx={{
                color: "#8b949e",
                fontSize: 14,
                mb: 3,
                lineHeight: 1.6,
              }}
            >
              {error
                ? error
                : `No pudimos encontrar el usuario "@${username}". Verifica que el nombre sea correcto.`}
            </Typography>

            {/* Botón para volver */}
            <Button
              onClick={() => navigate(-1)}
              variant="outlined"
              sx={{
                borderColor: "#00ff88",
                color: "#00ff88",
                fontWeight: 700,
                textTransform: "none",
                px: 3,
                py: 1.2,
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(0,255,136,0.08)",
                  borderColor: "#00ff88",
                },
              }}
            >
              ← Volver atrás
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  // ✅ ESTADO: PERFIL CARGADO EXITOSAMENTE

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "#0b0b0b",
        color: "#fff",
        p: { xs: 2, md: 4 },
        pb: 4,
        minHeight: "100vh",
      }}
    >
      {/* 🔙 BACK BUTTON - Volver a página anterior */}
      <Tooltip title="Volver atrás" arrow>
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
              transform: "translateX(-2px)",
            },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Tooltip>

      {/* 👤 HEADER SECTION - Información del usuario estilo Instagram */}
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
          {/* AVATAR - Foto de perfil del usuario */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                p: 1,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #00ff88, #00c6ff)",
              }}
            >
              <ProfileAvatar size={110} />
            </Box>
          </Box>

          {/* INFO SECTION - Nombre, email, estadísticas y biografía */}
          <Box sx={{ flex: 1, width: "100%" }}>
            {/* NOMBRE DEL USUARIO */}
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
                fontSize: 13,
                mb: 2,
              }}
            >
              📧 {user.email}
            </Typography>

            {/* ESTADÍSTICAS - Publicaciones, racha y nivel */}
            <Box
              sx={{
                display: "flex",
                gap: { xs: 2.5, md: 5 },
                flexWrap: "wrap",
                mb: 3,
                pb: 2,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Box sx={{ textAlign: "center" }}>
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
                </motion.div>
              ))}
            </Box>

            {/* BIOGRAFÍA - Descripción del usuario */}
            <Typography
              sx={{
                color: "#c9d1d9",
                fontSize: 14,
                maxWidth: 500,
                lineHeight: 1.6,
              }}
            >
              {user.bio || "Sin biografía"}
            </Typography>
          </Box>
        </Box>
      </motion.div>

      {/* 📰 POSTS HEADER - Título de la sección de publicaciones */}
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
        <GridOnRoundedIcon sx={{ fontSize: 20 }} />
        <Typography fontWeight={700} sx={{ fontSize: 13, letterSpacing: 0.5 }}>
          PUBLICACIONES
        </Typography>
      </Box>

      {/* 🖼️ GRID DE POSTS - Galería de imágenes con hover overlay */}
      {userPosts.length === 0 ? (
        // Estado vacío: usuario sin posts
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            color: "#8b949e",
          }}
        >
          <Typography sx={{ fontSize: 14 }}>
            Este usuario aún no ha publicado nada
          </Typography>
        </Box>
      ) : (
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
                    bgcolor: "transparent",
                    backgroundImage: "none",
                    boxShadow: "none",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    border: "1px solid rgba(0,255,136,0.1)",
                    "&:hover": {
                      transform: "scale(1.02)",
                      borderColor: "rgba(0,255,136,0.3)",
                      boxShadow: "0 0 20px rgba(0,255,136,0.15)",
                    },
                  }}
                >
                  {/* IMAGEN DEL POST */}
                  <CardMedia
                    component="img"
                    image={post.image}
                    alt={`Post de ${user.nombre}`}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />

                  {/* OVERLAY CON ESTADÍSTICAS (Aparece al hover) */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: hoveredPostId === post.id ? 1 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,255,136,0.1) 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 3,
                      pointerEvents:
                        hoveredPostId === post.id ? "auto" : "none",
                    }}
                  >
                    {/* LIKES - Contador de likes */}
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
                          fontSize: 32,
                          color: "#ff3333",
                          filter: "drop-shadow(0 0 6px rgba(255,51,51,0.7))",
                        }}
                      />
                      <Typography
                        sx={{
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 16,
                        }}
                      >
                        {post.likes}
                      </Typography>
                    </Box>

                    {/* COMMENTS - Contador de comentarios */}
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
                          fontSize: 32,
                          color: "#00ff88",
                          filter: "drop-shadow(0 0 6px rgba(0,255,136,0.7))",
                        }}
                      />
                      <Typography
                        sx={{
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 16,
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
      )}

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