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
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Snackbar,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import PhotoLibraryRoundedIcon from "@mui/icons-material/PhotoLibraryRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import FlipCameraAndroidRoundedIcon from "@mui/icons-material/FlipCameraAndroidRounded";
import StoryCameraFullscreen from "./StoryCameraFullscreen";
import useStoryUpload from "../../hooks/useStoryUpload";
import { STORY_ACCEPT } from "../../services/storyService";

const MotionBox = motion(Box);

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

  useImperativeHandle(ref, () => ({
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
  }), [openFilePicker, openNativeCapture, openProCamera]);

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
  }, [open, openNativeCapture, preferredCamera, selectedFile, shouldPreferNativeCamera]);

  useEffect(() => {
    if (!open || isUploading) return;
    if (!toast.open || toast.severity !== "success") return;

    const timer = setTimeout(() => {
      closeAndReset();
    }, 700);

    return () => clearTimeout(timer);
  }, [closeAndReset, isUploading, open, toast.open, toast.severity]);

  const handleManualUpload = useCallback(async () => {
    const result = await uploadSelectedStory();
    if (result?.success) {
      setTimeout(() => {
        closeAndReset();
      }, 700);
    }
  }, [closeAndReset, uploadSelectedStory]);

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
          <MotionBox
            sx={{
              position: "fixed",
              inset: 0,
              zIndex: 2100,
              px: { xs: 1.25, sm: 2 },
              py: { xs: 1.25, sm: 2.5 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "radial-gradient(circle at top, rgba(0,255,136,0.10) 0%, rgba(0,0,0,0.9) 42%, rgba(0,0,0,0.97) 100%)",
              backdropFilter: "blur(16px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAndReset}
          >
            <MotionBox
              onClick={(event) => event.stopPropagation()}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              sx={{
                width: "100%",
                maxWidth: 560,
                borderRadius: "28px",
                overflow: "hidden",
                background:
                  "linear-gradient(180deg, rgba(10,10,10,0.98) 0%, rgba(18,18,18,0.96) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 30px 80px rgba(0,0,0,0.45), 0 0 35px rgba(0,255,136,0.08)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: { xs: 1.5, sm: 2 },
                  py: 1.4,
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <Box>
                  <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>
                    Historia Premium
                  </Typography>
                  <Typography sx={{ color: "#8b949e", fontSize: 12.5 }}>
                    Cámara directa, preview instantánea y subida optimizada.
                  </Typography>
                </Box>

                <IconButton onClick={closeAndReset} sx={{ color: "#fff" }}>
                  <CloseRoundedIcon />
                </IconButton>
              </Box>

              {(isUploading || isPreparing) && (
                <Box sx={{ px: 2, pt: 1.4 }}>
                  <LinearProgress
                    variant={isUploading ? "determinate" : "indeterminate"}
                    value={uploadProgress}
                    sx={{
                      height: 8,
                      borderRadius: 999,
                      bgcolor: "rgba(255,255,255,0.08)",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 999,
                        background: "linear-gradient(90deg, #00ff88, #00c6ff)",
                      },
                    }}
                  />
                  <Typography sx={{ color: "#9dffd1", fontSize: 12, mt: 0.8 }}>
                    {isPreparing ? "Preparando archivo..." : `Subiendo historia… ${uploadProgress}%`}
                  </Typography>
                </Box>
              )}

              <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.6 }}>
                  <Chip
                    icon={<CameraAltRoundedIcon sx={{ color: "#00ff88 !important" }} />}
                    label="Cámara nativa directa"
                    sx={{
                      color: "#d7dde5",
                      bgcolor: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  />
                  <Chip
                    icon={<VideocamRoundedIcon sx={{ color: "#00c6ff !important" }} />}
                    label="Video máx. 15s"
                    sx={{
                      color: "#d7dde5",
                      bgcolor: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    borderRadius: "24px",
                    minHeight: { xs: 220, sm: 320 },
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.06)",
                    background:
                      selectedFile
                        ? "#050505"
                        : "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,255,136,0.04) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {selectedFile ? (
                    isVideo ? (
                      <Box
                        component="video"
                        src={previewUrl}
                        controls
                        playsInline
                        muted
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <Box
                        component="img"
                        src={previewUrl}
                        alt="Preview historia"
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    )
                  ) : (
                    <Box sx={{ textAlign: "center", px: 2.5 }}>
                      <Typography sx={{ fontSize: 38, mb: 1 }}>📸</Typography>
                      <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>
                        Abre la cámara y publica al instante
                      </Typography>
                      <Typography sx={{ color: "#8b949e", fontSize: 12.5, mt: 0.75 }}>
                        En móvil intentamos abrir la cámara trasera directamente. En desktop verás el selector de archivos.
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.6 }}>
                  <Button
                    onClick={() => openNativeCapture("environment")}
                    startIcon={<CameraAltRoundedIcon />}
                    variant="contained"
                    sx={{
                      flex: 1,
                      minWidth: 150,
                      borderRadius: "16px",
                      py: 1.15,
                      textTransform: "none",
                      fontWeight: 800,
                      color: "#07120d",
                      background: "linear-gradient(90deg, #00ff88, #00c6ff)",
                    }}
                  >
                    Cámara trasera
                  </Button>

                  <Button
                    onClick={() => openNativeCapture("user")}
                    startIcon={<FlipCameraAndroidRoundedIcon />}
                    variant="outlined"
                    sx={{
                      flex: 1,
                      minWidth: 130,
                      borderRadius: "16px",
                      py: 1.15,
                      textTransform: "none",
                      fontWeight: 700,
                      color: "#fff",
                      borderColor: "rgba(255,255,255,0.12)",
                    }}
                  >
                    Selfie
                  </Button>

                  <Button
                    onClick={openFilePicker}
                    startIcon={<PhotoLibraryRoundedIcon />}
                    variant="outlined"
                    sx={{
                      flex: 1,
                      minWidth: 130,
                      borderRadius: "16px",
                      py: 1.15,
                      textTransform: "none",
                      fontWeight: 700,
                      color: "#fff",
                      borderColor: "rgba(255,255,255,0.12)",
                    }}
                  >
                    Galería
                  </Button>
                </Box>

                {canUseFullscreenCamera && (
                  <Button
                    onClick={() => openProCamera(preferredCamera)}
                    fullWidth
                    sx={{
                      mt: 1,
                      py: 1.15,
                      borderRadius: "16px",
                      textTransform: "none",
                      fontWeight: 800,
                      color: "#9dffd1",
                      border: "1px solid rgba(0,255,136,0.18)",
                      background: "rgba(0,255,136,0.06)",
                    }}
                  >
                    Abrir cámara fullscreen Pro
                  </Button>
                )}

                <Box
                  component="input"
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  placeholder="Texto opcional para la historia"
                  sx={{
                    width: "100%",
                    mt: 1.4,
                    px: 2,
                    py: 1.55,
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.04)",
                    color: "#fff",
                    fontSize: 14,
                    outline: "none",
                    transition: "all 0.2s ease",
                    "&:focus": {
                      borderColor: "rgba(0,198,255,0.45)",
                      boxShadow: "0 0 0 4px rgba(0,198,255,0.08)",
                    },
                    "&::placeholder": {
                      color: "rgba(255,255,255,0.42)",
                    },
                  }}
                />

                <Typography sx={{ color: "#8b949e", fontSize: 11.5, mt: 0.9 }}>
                  Optimistic UI activada: la miniatura aparece en el carrusel mientras se completa la subida.
                </Typography>

                <Box sx={{ display: "flex", gap: 1.2, mt: 1.8 }}>
                  <Button
                    onClick={handleManualUpload}
                    disabled={!selectedFile || isUploading || isPreparing}
                    fullWidth
                    sx={{
                      py: 1.2,
                      borderRadius: "16px",
                      textTransform: "none",
                      fontWeight: 800,
                      color: "#07120d",
                      background: "linear-gradient(90deg, #00ff88, #00c6ff)",
                      opacity: !selectedFile ? 0.55 : 1,
                    }}
                  >
                    {isUploading ? "Subiendo..." : "Subir historia"}
                  </Button>
                  <Button
                    onClick={closeAndReset}
                    fullWidth
                    sx={{
                      py: 1.2,
                      borderRadius: "16px",
                      textTransform: "none",
                      fontWeight: 700,
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    Cerrar
                  </Button>
                </Box>
              </Box>
            </MotionBox>
          </MotionBox>
        )}
      </AnimatePresence>

      <Snackbar
        open={toast.open}
        autoHideDuration={3200}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
});

export default StoryUploader;
