import React, { memo, useMemo } from "react";
import { Box, Skeleton, Typography } from "@mui/material";
import { motion } from "framer-motion";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { getStoryMediaType } from "../../services/storyService";

function getStoryUserName(story) {
  return (
    story?.nombre ||
    story?.username ||
    story?.user?.nombre ||
    story?.user?.name ||
    story?.user?.username ||
    "Usuario"
  );
}

function getProfileImage(story) {
  return (
    story?.avatar ||
    story?.avatarUrl ||
    story?.image_url ||
    story?.image ||
    story?.user?.avatar ||
    story?.user?.image ||
    "https://via.placeholder.com/64?text=🙂"
  );
}

function StoriesCarousel({ stories, currentUserName, onCreateStory, openUserStories, getStoryRingColor }) {
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
    const ownUserName = uniqueUsers.find((name) => name.toLowerCase() === normalizedUser) || null;

    return {
      storyByUser: nextStoryByUser,
      ownStory: ownUserName ? nextStoryByUser[ownUserName] : null,
      otherUsers: uniqueUsers.filter((name) => name.toLowerCase() !== normalizedUser),
    };
  }, [currentUserName, stories]);

  const renderStoryItem = (story, label, onClick, options = {}) => {
    const profileImage = getProfileImage(story);
    const mediaType = getStoryMediaType(story);
    const isUploading = Boolean(story?.isUploading);
    const ringColor = options.ringColor || "linear-gradient(90deg, #00ff88, #00c6ff)";

    return (
      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
        <Box
          onClick={onClick}
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
              background: ringColor,
              boxShadow: isUploading
                ? "0 0 26px rgba(0,255,136,0.28)"
                : "0 0 20px rgba(0,255,136,0.18)",
              animation: isUploading ? "storyPulse 1.4s ease-in-out infinite" : "none",
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                bgcolor: "#080b09",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box
                component="img"
                src={profileImage}
                alt={label}
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "https://via.placeholder.com/64?text=🙂";
                }}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />

              {mediaType === "video" && (
                <Box
                  sx={{
                    position: "absolute",
                    right: 4,
                    top: 4,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    bgcolor: "rgba(0,0,0,0.55)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                >
                  <PlayArrowRoundedIcon sx={{ fontSize: 14 }} />
                </Box>
              )}

              {isUploading && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
                    animation: "shimmerStory 1.3s linear infinite",
                  }}
                />
              )}
            </Box>

            {options.showPlus && (
              <Box
                onClick={(event) => {
                  event.stopPropagation();
                  options.onPlusClick?.();
                }}
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

          <Typography noWrap sx={{ color: "#d7dde5", fontSize: 11.5, mt: 0.8, fontWeight: 600 }}>
            {label}
          </Typography>
        </Box>
      </motion.div>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.4,
        overflowX: "auto",
        pb: 0.4,
        alignItems: "flex-start",
        "&::-webkit-scrollbar": { display: "none" },
        "@keyframes shimmerStory": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "@keyframes storyPulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
      }}
    >
      {ownStory
        ? renderStoryItem(
            ownStory,
            ownStory?.isUploading ? "Subiendo..." : "Tu historia",
            () => openUserStories(getStoryUserName(ownStory)),
            {
              ringColor: "linear-gradient(90deg, #00ff88, #00c6ff)",
              showPlus: true,
              onPlusClick: () => onCreateStory?.({ facingMode: "environment" }),
            }
          )
        : renderStoryItem(
            null,
            "Tu historia",
            () => onCreateStory?.({ facingMode: "environment" }),
            { showPlus: true }
          )}

      {otherUsers.length === 0 ? (
        <Box sx={{ minHeight: 74, display: "flex", alignItems: "center", px: 1, gap: 1 }}>
          <Skeleton variant="circular" width={52} height={52} sx={{ bgcolor: "rgba(255,255,255,0.08)" }} />
          <Typography sx={{ color: "#8b949e", fontSize: 12 }}>
            Aún no hay historias de otros usuarios.
          </Typography>
        </Box>
      ) : (
        otherUsers.map((userName) => {
          const userStory = storyByUser[userName];
          return (
            <Box key={userName}>
              {renderStoryItem(userStory, userName, () => openUserStories(userName), {
                ringColor: getStoryRingColor(userName),
              })}
            </Box>
          );
        })
      )}
    </Box>
  );
}

export default memo(StoriesCarousel);
