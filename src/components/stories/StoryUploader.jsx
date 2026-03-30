import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Alert,
  Avatar,
  Backdrop,
  Box,
  Button,
  Chip,
  Fade,
  IconButton,
  LinearProgress,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import PhotoLibraryRoundedIcon from "@mui/icons-material/PhotoLibraryRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import FlipCameraAndroidRoundedIcon from "@mui/icons-material/FlipCameraAndroidRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";

import StoryCameraFullscreen from "./StoryCameraFullscreen";
import useStoryUpload from "../../hooks/useStoryUpload";
import { STORY_ACCEPT } from "../../services/storyService";

const MotionBox = motion(Box);

const glassBtn = {
  borderRadius: "18px",
  py: 1.2,
  textTransform: "none",
  fontWeight: 700,
  backdropFilter: "blur(20px)",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const StoryUploader = forwardRef(function StoryUploader(
  {
    open,
    user,
    onClose,
    preferredCamera = "environment",
    onOptimisticStory,
    onStoryUploaded,
    onStoryUploadError,
    onRefreshStories,
  },
  ref
) {
  const autoLaunchRef = useRef(false);

  const {
    inputRef,
    selectedFile,
    previewUrl,
    caption,
    setCaption,
    captureMode,
    mediaKind,
    isPreparing,
    isUploading,
    uploadProgress,
    cameraOpen,
    toast,
    setToast,
    canUseFullscreenCamera,
    shouldPreferNativeCamera,
    resetDraft,
    openNativeCapture,
    openFilePicker,
    openProCamera,
    closeProCamera,
    handleInputChange,
    handleCameraCapture,
    uploadSelectedStory,
  } = useStoryUpload({
    user,
    preferredCamera,
    onOptimisticStory,
    onUploadSuccess: onStoryUploaded,
    onUploadError: onStoryUploadError,
    onRefreshStories,
  });

  useImperativeHandle(
    ref,
    () => ({
      openNativeCapture: (facingMode) => {
        autoLaunchRef.current = true;
        openNativeCapture(facingMode);
      },
      openFilePicker: () => {
        autoLaunchRef.current = true;
        openFilePicker();
      },
      openProCamera: (facingMode) => {
        autoLaunchRef.current = true;
        openProCamera(facingMode);
      },
    }),
    [openFilePicker, openNativeCapture, openProCamera]
  );

  const closeAndReset = useCallback(() => {
    if (isUploading || isPreparing) return;
    resetDraft({ keepToast: true });
    onClose?.();
  }, [isPreparing, isUploading, onClose, resetDraft]);

  useEffect(() => {
    if (!open) {
      autoLaunchRef.current = false;
      return;
    }

    if (selectedFile || autoLaunchRef.current) return;

    if (shouldPreferNativeCamera) {
      autoLaunchRef.current = true;
      openNativeCapture(preferredCamera);
    }
  }, [
    open,
    openNativeCapture,
    preferredCamera,
    selectedFile,
    shouldPreferNativeCamera,
  ]);

  const handleUpload = useCallback(async () => {
    const result = await uploadSelectedStory();
    if (result?.success) {
      setTimeout(() => closeAndReset(), 700);
    }
  }, [uploadSelectedStory, closeAndReset]);

  const isVideo = mediaKind === "video";

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={STORY_ACCEPT}
        capture={captureMode || undefined}
        onChange={handleInputChange}
      />

      <StoryCameraFullscreen
        open={cameraOpen}
        facingMode={captureMode}
        onClose={closeProCamera}
        onCapture={handleCameraCapture}
      />

      <AnimatePresence>
        {open && (
          <Backdrop
            open
            sx={{
              zIndex: 3000,
              backdropFilter: "blur(25px)",
              background:
                "radial-gradient(circle at top, rgba(0,255,136,0.08), rgba(0,0,0,0.92))",
            }}
            onClick={closeAndReset}
          >
            <MotionBox
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.25 }}
              sx={{
                width: "100%",
                maxWidth: 520,
                mx: 2,
                borderRadius: "30px",
                overflow: "hidden",
                bgcolor: "rgba(15,15,15,0.92)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 30px 90px rgba(0,0,0,0.5)",
              }}
            >
              {/* HEADER */}
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar src={user?.avatar} />
                  <Box>
                    <Typography sx={{ color: "#fff", fontWeight: 800 }}>
                      Nueva historia
                    </Typography>
                    <Typography sx={{ color: "#aaa", fontSize: 12 }}>
                      comparte tu momento ✨
                    </Typography>
                  </Box>
                </Stack>

                <IconButton onClick={closeAndReset} sx={{ color: "#fff" }}>
                  <CloseRoundedIcon />
                </IconButton>
              </Box>

              {/* PROGRESS */}
              {(isUploading || isPreparing) && (
                <LinearProgress
                  variant={isUploading ? "determinate" : "indeterminate"}
                  value={uploadProgress}
                  sx={{
                    height: 4,
                    "& .MuiLinearProgress-bar": {
                      background:
                        "linear-gradient(90deg, #00ff88, #00c6ff)",
                    },
                  }}
                />
              )}

              {/* PREVIEW */}
              <Box sx={{ p: 2 }}>
                <Box
                  sx={{
                    height: 460,
                    borderRadius: "24px",
                    overflow: "hidden",
                    bgcolor: "#050505",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                    position: "relative",
                  }}
                >
                  {selectedFile ? (
                    isVideo ? (
                      <video
                        src={previewUrl}
                        controls
                        playsInline
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <img
                        src={previewUrl}
                        alt="preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )
                  ) : (
                    <Box textAlign="center">
                      <Typography fontSize={50}>📸</Typography>
                      <Typography color="#fff" fontWeight={800}>
                        Captura instantánea
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* ACTIONS */}
                <Stack direction="row" spacing={1} mb={2}>
                  <Button
                    fullWidth
                    startIcon={<CameraAltRoundedIcon />}
                    onClick={() => openNativeCapture("environment")}
                    sx={glassBtn}
                  >
                    Cámara
                  </Button>

                  <Button
                    fullWidth
                    startIcon={<FlipCameraAndroidRoundedIcon />}
                    onClick={() => openNativeCapture("user")}
                    sx={glassBtn}
                  >
                    Selfie
                  </Button>

                  <Button
                    fullWidth
                    startIcon={<PhotoLibraryRoundedIcon />}
                    onClick={openFilePicker}
                    sx={glassBtn}
                  >
                    Galería
                  </Button>
                </Stack>

                {canUseFullscreenCamera && (
                  <Button
                    fullWidth
                    onClick={() => openProCamera(preferredCamera)}
                    sx={{
                      ...glassBtn,
                      mb: 2,
                      color: "#00ff88",
                    }}
                  >
                    Cámara Pro Fullscreen
                  </Button>
                )}

                {/* CAPTION */}
                <Box
                  component="input"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Escribe algo..."
                  sx={{
                    width: "100%",
                    px: 2,
                    py: 1.6,
                    borderRadius: "18px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    bgcolor: "rgba(255,255,255,0.04)",
                    color: "#fff",
                    outline: "none",
                    mb: 2,
                  }}
                />

                {/* UPLOAD */}
                <Button
                  fullWidth
                  startIcon={<CloudUploadRoundedIcon />}
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  sx={{
                    py: 1.4,
                    borderRadius: "18px",
                    textTransform: "none",
                    fontWeight: 800,
                    fontSize: 15,
                    color: "#000",
                    background:
                      "linear-gradient(90deg, #00ff88, #00c6ff)",
                  }}
                >
                  {isUploading ? "Subiendo..." : "Publicar historia"}
                </Button>
              </Box>
            </MotionBox>
          </Backdrop>
        )}
      </AnimatePresence>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() =>
          setToast((prev) => ({ ...prev, open: false }))
        }
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
});

export default StoryUploader;