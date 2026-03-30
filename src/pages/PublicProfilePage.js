/**
 * 📱 PÁGINA DE PERFIL PÚBLICO
 * 
 * URL: /perfil/:username
 * Acceso: Público (sin requerir login)
 * 
 * Características:
 * - Vista pública del perfil de cualquier usuario
 * - información del usuario: avatar, bio, stats
 * - Grid de posts
 * - Búsquedas indexables
 * - Rendimiento optimizado
 */

import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePublicProfile } from "../hooks/usePublicProfile";
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
  Divider,
  Badge,
  Avatar as MuiAvatar,
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GridOnRoundedIcon from "@mui/icons-material/GridOnRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

/**
 * Componente principal de perfil público
 */
export default function PublicProfilePage() {
  // 📍 Obtener username de la URL
  const { username } = useParams();
  const navigate = useNavigate();
  const [hoveredPostId, setHoveredPostId] = useState(null);

  // 🎣 Hook para cargar perfil público
  const { profile, loading, error, notFound } = usePublicProfile(username);

  // 📊 Datos procesados (memoized)
  const posts = useMemo(
    () => profile?.posts || [],
    [profile]
  );

  const stats = useMemo(
    () => [
      { label: "Publicaciones", value: posts.length },
      { label: "Seguidores", value: profile?.followers || 0 },
      { label: "Siguiendo", value: profile?.following || 0 },
    ],
    [profile, posts.length]
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

  // ❌ ESTADO: ERROR O USUARIO NO ENCONTRADO
  if (error || notFound || !profile) {
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
            <ErrorOutlineIcon
              sx={{
                fontSize: 64,
                color: "#ff3333",
                mb: 2,
                opacity: 0.8,
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
                lineHeight: 1.6,
              }}
            >
              {error
                ? error
                : `No pudimos encontrar el usuario "@${username}". Verifica que el nombre sea correcto.`}
            </Typography>

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
        minHeight: "100vh",
        pb: 4,
      }}
    >
      {/* 🖼️ PORTADA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            width: "100%",
            height: { xs: 200, md: 300 },
            backgroundImage: `url(${profile.portada})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(11,11,11,0.8) 100%)",
            },
          }}
        >
          {/* Back button */}
          <Tooltip title="Volver atrás" arrow>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                color: "#00ff88",
                border: "1px solid rgba(0,255,136,0.3)",
                zIndex: 10,
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
        </Box>
      </motion.div>

      {/* 📋 INFORMACIÓN DEL PERFIL */}
      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          mt: { xs: -6, md: -8 },
          mb: 4,
          zIndex: 5,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Box
            sx={{
              display: "flex",
              gap: { xs: 2, md: 4 },
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "center", sm: "flex-start" },
            }}
          >
            {/* AVATAR */}
            <Box
              sx={{
                p: 1,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #00ff88, #00c6ff)",
                flexShrink: 0,
              }}
            >
              <MuiAvatar
                src={profile.avatar}
                sx={{
                  width: { xs: 100, md: 140 },
                  height: { xs: 100, md: 140 },
                  border: "4px solid #0b0b0b",
                  fontSize: "48px",
                }}
              >
                {profile.nombre.charAt(0).toUpperCase()}
              </MuiAvatar>
            </Box>

            {/* INFORMACIÓN */}
            <Box sx={{ flex: 1, width: "100%" }}>
              {/* Nombre y categoría */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 1,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: 20, md: 28 },
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: "#fff",
                  }}
                >
                  {profile.nombre}
                </Typography>

                {profile.isVerified && (
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#00ff88",
                      border: "1px solid #00ff88",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                  }}
                  >
                    ✓ VERIFICADO
                  </Typography>
                )}

                <Typography
                  sx={{
                    fontSize: 12,
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: "rgba(0,255,136,0.1)",
                    border: "1px solid rgba(0,255,136,0.3)",
                    color: "#00ff88",
                  }}
                >
                  {profile.categoria}
                </Typography>
              </Box>

              {/* Username */}
              <Typography
                sx={{
                  color: "#8b949e",
                  fontSize: 13,
                  mb: 2,
                }}
              >
                @{profile.username}
              </Typography>

              {/* Estadísticas */}
              <Box
                sx={{
                  display: "flex",
                  gap: 3,
                  mb: 2,
                  flexWrap: "wrap",
                }}
              >
                {stats.map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Box>
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
                  </motion.div>
                ))}
              </Box>

              {/* Bio */}
              <Typography
                sx={{
                  color: "#c9d1d9",
                  fontSize: 14,
                  lineHeight: 1.6,
                  mb: 2,
                }}
              >
                {profile.bio}
              </Typography>

              {/* Botones de acción */}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Tooltip title="Seguir usuario">
                  <Button
                    startIcon={<PersonAddRoundedIcon />}
                    variant="outlined"
                    sx={{
                      borderColor: "#00ff88",
                      color: "#00ff88",
                      fontWeight: 700,
                      textTransform: "none",
                      borderRadius: 2,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: "rgba(0,255,136,0.08)",
                        borderColor: "#00ff88",
                      },
                    }}
                  >
                    Seguir
                  </Button>
                </Tooltip>

                <Tooltip title="Compartir perfil">
                  <Button
                    startIcon={<ShareRoundedIcon />}
                    variant="outlined"
                    sx={{
                      borderColor: "rgba(0,255,136,0.5)",
                      color: "#8b949e",
                      fontWeight: 700,
                      textTransform: "none",
                      borderRadius: 2,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "#00ff88",
                        color: "#00ff88",
                      },
                    }}
                  >
                    Compartir
                  </Button>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </motion.div>
      </Container>

      {/* 📰 SECCIÓN DE POSTS */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 3 }} />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 3,
            color: "#8b949e",
          }}
        >
          <GridOnRoundedIcon sx={{ fontSize: 20 }} />
          <Typography fontWeight={700} sx={{ fontSize: 13, letterSpacing: 0.5 }}>
            PUBLICACIONES
          </Typography>
        </Box>

        {/* GRID DE POSTS */}
        {posts.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6, color: "#8b949e" }}>
            <Typography sx={{ fontSize: 14 }}>
              Este usuario aún no ha publicado nada
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {posts.map((post, idx) => (
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
                      boxShadow: "none",
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      border: "1px solid rgba(0,255,136,0.1)",
                      backgroundImage: "none",
                      "&:hover": {
                        transform: "scale(1.02)",
                        borderColor: "rgba(0,255,136,0.3)",
                        boxShadow: "0 0 20px rgba(0,255,136,0.15)",
                      },
                    }}
                  >
                    {/* Imagen del post */}
                    <CardMedia
                      component="img"
                      image={post.image}
                      alt={post.content}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />

                    {/* Overlay con estadísticas */}
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
                        pointerEvents: hoveredPostId === post.id ? "auto" : "none",
                      }}
                    >
                      {/* Likes */}
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

                      {/* Comentarios */}
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
                          {post.comments?.length || 0}
                        </Typography>
                      </Box>
                    </motion.div>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
