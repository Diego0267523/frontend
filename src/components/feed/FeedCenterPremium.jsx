import React, { memo, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Skeleton,
} from "@mui/material";
import StoriesCarousel from "../stories/StoriesCarousel";

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

  const safePages = useMemo(() => (Array.isArray(data?.pages) ? data.pages : []), [data]);

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
        <StoriesCarousel
          stories={stories}
          currentUserName={currentUserName}
          onCreateStory={onCreateStory}
          openUserStories={openUserStories}
          getStoryRingColor={getStoryRingColor}
        />
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