import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Skeleton,
} from "@mui/material";
import { motion } from "framer-motion";

export default function FeedCenterPremium({
  isMobile,
  stories,
  onCreateStory,
  openUserStories,
  getStoryRingColor,
  newPostsAvailable,
  setNewPostsAvailable,
  isLoading,
  hasPosts,
  showRetry,
  setShowRetry,
  queryClient,
  data,
  isFetchingNextPage,
  PostCard,
}) {
  const glassCard = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 4,
    backdropFilter: "blur(12px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 500, py: 2 }}>
      {/* STORIES */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          mb: 2,
          pb: 1,
        }}
      >
        <motion.div whileHover={{ scale: 1.05 }}>
          <Box onClick={() => onCreateStory?.()}>
            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                background: "linear-gradient(90deg,#00ff88,#00c6ff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ color: "#000", fontSize: 28 }}>+</Typography>
            </Box>
            <Typography sx={{ color: "#8b949e", fontSize: 12, textAlign: "center" }}>
              Tu historia
            </Typography>
          </Box>
        </motion.div>

        {stories &&
          [...new Set(stories.map((s) => s.nombre))].map((userName, i) => {
            const userStory = stories.find((s) => s.nombre === userName);
            const profileImage =
              userStory?.avatar || userStory?.avatarUrl || userStory?.image_url;
            const ringColor = getStoryRingColor(userName);

            return (
              <motion.div key={i} whileHover={{ scale: 1.05 }}>
                <Box onClick={() => openUserStories(userName)}>
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: "50%",
                      border: `3px solid ${ringColor}`,
                      p: "2px",
                    }}
                  >
                    <img
                      src={profileImage}
                      alt={userName}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                  <Typography
                    sx={{ color: "#8b949e", fontSize: 12, textAlign: "center" }}
                  >
                    {userName}
                  </Typography>
                </Box>
              </motion.div>
            );
          })}
      </Box>

      {/* NUEVAS PUBLICACIONES */}
      {newPostsAvailable > 0 && (
        <Box
          sx={{
            position: "fixed",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1200,
            ...glassCard,
            px: 2,
            py: 1,
            cursor: "pointer",
          }}
          onClick={() => setNewPostsAvailable(0)}
        >
          <Typography sx={{ color: "#00ff88", fontWeight: 700, fontSize: 13 }}>
            Ver {newPostsAvailable} nuevas publicaciones
          </Typography>
        </Box>
      )}

      {/* POSTS */}
      {isLoading ? (
        <>
          <Skeleton variant="rectangular" height={300} sx={{ bgcolor: "#111", mb: 2 }} />
          <Skeleton variant="rectangular" height={300} sx={{ bgcolor: "#111", mb: 2 }} />
        </>
      ) : !hasPosts ? (
        <Card sx={glassCard}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography sx={{ color: "#fff", mb: 2 }}>
              No hay posts disponibles aún.
            </Typography>
            {showRetry && (
              <Button
                onClick={() => {
                  setShowRetry(false);
                  queryClient.invalidateQueries({ queryKey: ["feed"] });
                }}
                sx={{
                  background: "linear-gradient(90deg,#00ff88,#00c6ff)",
                  color: "#000",
                  fontWeight: 700,
                }}
              >
                Intentar otra vez
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        data.pages.map((page, i) =>
          (page.posts || []).map((post, j) => (
            <PostCard key={post.id || `${i}-${j}`} post={post} />
          ))
        )
      )}

      {isFetchingNextPage && (
        <Card sx={glassCard}>
          <CardContent>
            <Skeleton variant="rectangular" height={300} />
          </CardContent>
        </Card>
      )}
    </Box>
  );
}