import React, { memo, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Skeleton,
} from "@mui/material";
import { motion } from "framer-motion";

function FeedCenterPremium({
  isMobile,
  stories,
  currentUserName,
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

  const getStoryUserName = (story) => {
    return (
      story.nombre ||
      story.username ||
      story.user?.nombre ||
      story.user?.name ||
      story.user?.username ||
      "Usuario"
    );
  };

  const getProfileImage = (story) => {
    return (
      story.avatar ||
      story.avatarUrl ||
      story.image_url ||
      story.image ||
      story.user?.avatar ||
      story.user?.image ||
      "https://via.placeholder.com/64?text=🙂"
    );
  };

  const safePages = useMemo(() => (Array.isArray(data?.pages) ? data.pages : []), [data]);

  const { ownStory, otherUsers, storyByUser } = useMemo(() => {
    const normalizedUser = String(currentUserName || "").trim().toLowerCase();
    const nextStories = Array.isArray(stories) ? stories : [];
    const nextStoryByUser = {};

    nextStories.forEach((story) => {
      const owner = String(getStoryUserName(story) || "").trim();
      if (owner && !nextStoryByUser[owner]) {
        nextStoryByUser[owner] = story;
      }
    });

    const uniqueUsers = Object.keys(nextStoryByUser);
    const nextOwnStory =
      uniqueUsers.find((userName) => userName.toLowerCase() === normalizedUser) || null;

    return {
      safeStories: nextStories,
      storyByUser: nextStoryByUser,
      ownStory: nextOwnStory ? nextStoryByUser[nextOwnStory] : null,
      otherUsers: uniqueUsers.filter((userName) => userName.toLowerCase() !== normalizedUser),
    };
  }, [stories, currentUserName]);

  const storyPanelSx = {
    ...glassCard,
    mb: 2.2,
    px: { xs: 1.15, md: 1.35 },
    py: { xs: 1.05, md: 1.15 },
    borderRadius: "22px",
    background:
      "linear-gradient(180deg, rgba(16,16,16,0.98) 0%, rgba(21,21,21,0.94) 100%)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.22), 0 0 24px rgba(0,255,136,0.04)",
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 500, py: { xs: 0.5, md: 1.5 }, mt: 0 }}>
      {/* STORIES */}
      <Box sx={storyPanelSx}>
        <Box
          sx={{
            display: "flex",
            gap: 1.4,
            overflowX: "auto",
            pb: 0.4,
            alignItems: "flex-start",
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
            <Box
              onClick={() => (ownStory ? openUserStories(getStoryUserName(ownStory)) : onCreateStory?.())}
              sx={{ width: 78, flexShrink: 0, cursor: "pointer", textAlign: "center" }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: 74,
                  height: 74,
                  mx: "auto",
                  p: "2.5px",
                  borderRadius: "50%",
                  background: ownStory
                    ? "linear-gradient(90deg, #00ff88, #00c6ff)"
                    : "linear-gradient(90deg, #00ff88, #00c6ff)",
                  boxShadow: ownStory
                    ? "0 0 20px rgba(0,255,136,0.20)"
                    : "0 0 18px rgba(0,255,136,0.18)",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    bgcolor: "#080b09",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {ownStory ? (
                    <img
                      src={getProfileImage(ownStory)}
                      alt="Tu historia"
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                    />
                  ) : (
                    <Typography sx={{ color: "#08110d", fontSize: 28, fontWeight: 900 }}>+</Typography>
                  )}
                </Box>

                {!ownStory && (
                  <Box
                    sx={{
                      position: "absolute",
                      right: -1,
                      bottom: -1,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      bgcolor: "#00ff88",
                      color: "#000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: 15,
                      border: "2px solid #080b09",
                    }}
                  >
                    +
                  </Box>
                )}
              </Box>

              <Typography
                noWrap
                sx={{ color: "#d7dde5", fontSize: 11.5, mt: 0.8, fontWeight: 600 }}
              >
                {ownStory ? "Tu historia" : "Crear"}
              </Typography>
            </Box>
          </motion.div>

          {otherUsers.length === 0 ? (
            <Box
              sx={{
                minHeight: 74,
                display: "flex",
                alignItems: "center",
                px: 1,
                color: "#8b949e",
                fontSize: 12,
              }}
            >
              Aún no hay historias de otros usuarios.
            </Box>
          ) : (
            otherUsers.map((userName) => {
              const userStory = storyByUser[userName];
              const profileImage = getProfileImage(userStory || {});
              const ringColor = getStoryRingColor(userName);

              return (
                <motion.div key={userName} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                  <Box
                    onClick={() => openUserStories(userName)}
                    sx={{ width: 78, flexShrink: 0, cursor: "pointer", textAlign: "center" }}
                  >
                    <Box
                      sx={{
                        width: 74,
                        height: 74,
                        mx: "auto",
                        p: "2.5px",
                        borderRadius: "50%",
                        background: ringColor || "linear-gradient(90deg, #00ff88, #00c6ff)",
                        boxShadow: "0 0 20px rgba(0,255,136,0.18)",
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          bgcolor: "#080b09",
                          p: "2px",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={profileImage}
                          alt={userName}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://via.placeholder.com/64?text=🙂";
                          }}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    </Box>

                    <Typography
                      noWrap
                      sx={{ color: "#d7dde5", fontSize: 11.5, mt: 0.8, fontWeight: 600 }}
                    >
                      {userName}
                    </Typography>
                  </Box>
                </motion.div>
              );
            })
          )}
        </Box>
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
        safePages.map((page, i) =>
          (Array.isArray(page?.posts) ? page.posts : []).map((post, j) => (
            <PostCard key={post?.id || `${i}-${j}`} post={post} />
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

export default memo(FeedCenterPremium);