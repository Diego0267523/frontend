import React, { useEffect, useState } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";

const MotionBox = motion(Box);

const overlayPro = {
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "radial-gradient(circle at top, rgba(0,255,136,0.08) 0%, rgba(0,0,0,0.88) 42%, rgba(0,0,0,0.96) 100%)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  zIndex: 2000,
  px: 2,
};

const modalPro = {
  width: "100%",
  maxWidth: 560,
  p: { xs: 2.2, sm: 3 },
  borderRadius: "28px",
  background:
    "linear-gradient(180deg, rgba(12,12,12,0.98) 0%, rgba(20,20,20,0.96) 100%)",
  border: "1px solid rgba(255,255,255,0.07)",
  boxShadow: "0 30px 80px rgba(0,0,0,0.45), 0 0 35px rgba(0,255,136,0.06)",
  color: "#fff",
  overflow: "hidden",
};

export default function CreateStoryModalPremium({
  open,
  file,
  setFile,
  postCaption,
  setPostCaption,
  isCreatingStory,
  handleStoryPublication,
  onClose,
}) {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!file || !(file instanceof File)) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const resetAndClose = () => {
    setFile(null);
    setPostCaption("");
    onClose?.();
  };

  return (
    <AnimatePresence>
      {open && (
        <MotionBox
          sx={overlayPro}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          onClick={resetAndClose}
        >
          <MotionBox
            sx={modalPro}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 18,
              mass: 0.8,
            }}
          >
            <Box sx={{ mb: 1.8 }}>
              <Typography
                sx={{
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "#fff",
                }}
              >
                Crear Historia 📸
              </Typography>
              <Typography sx={{ color: "#8b949e", fontSize: 13, mt: 0.5 }}>
                Comparte un momento rápido con la misma estética premium del feed.
              </Typography>
            </Box>

            <AnimatePresence mode="wait">
              {previewUrl ? (
                <MotionBox
                  key={previewUrl}
                  component="img"
                  src={previewUrl}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  sx={{
                    width: "100%",
                    height: { xs: 220, sm: 320 },
                    objectFit: "cover",
                    borderRadius: "22px",
                    mb: 2,
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
                  }}
                />
              ) : (
                <MotionBox
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  sx={{
                    width: "100%",
                    height: { xs: 180, sm: 220 },
                    mb: 2,
                    borderRadius: "22px",
                    border: "1px dashed rgba(0,255,136,0.24)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,255,136,0.03) 100%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    px: 2,
                  }}
                >
                  <Typography sx={{ fontSize: 34, mb: 1 }}>✨</Typography>
                  <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
                    Agrega una imagen para tu historia
                  </Typography>
                  <Typography sx={{ color: "#8b949e", fontSize: 12.5, mt: 0.5 }}>
                    Se verá mejor con formato vertical y un texto breve.
                  </Typography>
                </MotionBox>
              )}
            </AnimatePresence>

            <Button
              variant="contained"
              component="label"
              fullWidth
              sx={{
                py: 1.45,
                borderRadius: "18px",
                fontWeight: 800,
                textTransform: "none",
                color: "#08110d",
                background: "linear-gradient(90deg, #00ff88, #00c6ff)",
                boxShadow: "0 0 24px rgba(0,255,136,0.22)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 30px rgba(0,255,136,0.28)",
                },
              }}
            >
              {previewUrl ? "Cambiar imagen" : "Subir imagen"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </Button>

            <Box
              component="input"
              placeholder="Texto opcional para la historia"
              value={postCaption}
              onChange={(e) => setPostCaption(e.target.value)}
              sx={{
                width: "100%",
                mt: 2,
                px: 2,
                py: 1.8,
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff",
                fontSize: 14,
                outline: "none",
                transition: "all 0.25s ease",
                "&:focus": {
                  border: "1px solid rgba(0,198,255,0.45)",
                  boxShadow: "0 0 0 4px rgba(0,198,255,0.08)",
                },
                "&::placeholder": {
                  color: "rgba(255,255,255,0.42)",
                },
              }}
            />

            <Typography sx={{ color: "#8b949e", fontSize: 11.5, mt: 1 }}>
              Consejo: una frase corta y una imagen clara hacen que la historia destaque más.
            </Typography>

            <MotionBox
              sx={{ display: "flex", gap: 1.5, mt: 2.2 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Button
                onClick={handleStoryPublication}
                disabled={isCreatingStory}
                fullWidth
                sx={{
                  py: 1.4,
                  borderRadius: "18px",
                  fontWeight: 800,
                  textTransform: "none",
                  color: "#08110d",
                  background: "linear-gradient(90deg, #00ff88, #00c6ff)",
                }}
              >
                {isCreatingStory ? (
                  <CircularProgress
                    size={20}
                    sx={{ color: "#08110d" }}
                  />
                ) : (
                  "Publicar Historia"
                )}
              </Button>

              <Button
                onClick={resetAndClose}
                fullWidth
                sx={{
                  py: 1.4,
                  borderRadius: "18px",
                  fontWeight: 700,
                  textTransform: "none",
                  color: "#fff",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  "&:hover": {
                    background: "rgba(255,255,255,0.08)",
                  },
                }}
              >
                Cancelar
              </Button>
            </MotionBox>
          </MotionBox>
        </MotionBox>
      )}
    </AnimatePresence>
  );
}