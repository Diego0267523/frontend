import React, { useMemo } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";

const MotionBox = motion(Box);

const overlayPro = {
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0,0,0,0.58)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  zIndex: 2000,
  px: 2,
};

const modalPro = {
  width: "100%",
  maxWidth: 620,
  p: 3,
  borderRadius: "28px",
  background:
    "linear-gradient(180deg, rgba(14,14,14,0.98) 0%, rgba(20,20,20,0.95) 100%)",
  border: "1px solid rgba(255,255,255,0.06)",
  boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
  color: "#fff",
};

export default function CreatePostModalPremium({
  open,
  file,
  setFile,
  postCaption,
  setPostCaption,
  isCreatingPost,
  handlePublication,
  onClose,
}) {
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

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
        >
          <MotionBox
            sx={modalPro}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.8 }}
          >
            <Typography sx={{ fontSize: 24, fontWeight: 800, mb: 2, letterSpacing: "-0.03em" }}>
              Crear Post 🚀
            </Typography>

            <AnimatePresence mode="wait">
              {previewUrl && (
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
                    maxHeight: 360,
                    objectFit: "cover",
                    borderRadius: "22px",
                    mb: 2,
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
                  }}
                />
              )}
            </AnimatePresence>

            <Button
              variant="contained"
              component="label"
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: "18px",
                fontWeight: 800,
                textTransform: "none",
                color: "#08110d",
                background: "linear-gradient(90deg, #00ff88, #00c6ff)",
                boxShadow: "0 0 24px rgba(0,255,136,0.22)",
                '&:hover': {
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 30px rgba(0,255,136,0.28)",
                },
              }}
            >
              Subir imagen
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </Button>

            <Box
              component="input"
              placeholder="¿Qué estás pensando?"
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
                '&:focus': {
                  border: "1px solid rgba(0,198,255,0.45)",
                  boxShadow: "0 0 0 4px rgba(0,198,255,0.08)",
                },
              }}
            />

            <MotionBox
              sx={{ display: "flex", gap: 2, mt: 2 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Button
                onClick={handlePublication}
                disabled={isCreatingPost}
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
                {isCreatingPost ? <CircularProgress size={20} sx={{ color: "#08110d" }} /> : "Publicar"}
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
                  '&:hover': { background: "rgba(255,255,255,0.08)" },
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
