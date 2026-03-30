import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Box, Button, Chip, IconButton, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CameraswitchRoundedIcon from "@mui/icons-material/CameraswitchRounded";
import CameraRoundedIcon from "@mui/icons-material/CameraRounded";
import FiberManualRecordRoundedIcon from "@mui/icons-material/FiberManualRecordRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import {
  getCaptureFacingMode,
  STORY_MAX_VIDEO_DURATION_SECONDS,
  supportsMediaRecorder,
} from "../../services/storyService";

const MotionBox = motion(Box);

function pickRecorderMimeType() {
  if (typeof window === "undefined" || typeof window.MediaRecorder === "undefined") {
    return "";
  }

  const candidates = [
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];

  return candidates.find((mimeType) => window.MediaRecorder.isTypeSupported?.(mimeType)) || "";
}

export default function StoryCameraFullscreen({
  open,
  facingMode = "environment",
  onClose,
  onCapture,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordTimerRef = useRef(null);
  const autoStopTimerRef = useRef(null);

  const [currentFacingMode, setCurrentFacingMode] = useState(getCaptureFacingMode(facingMode));
  const [isStarting, setIsStarting] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [capturedFile, setCapturedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const recordingSupported = useMemo(() => supportsMediaRecorder(), []);

  const stopStream = useCallback(() => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }

    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsRecording(false);
  }, []);

  const startStream = useCallback(async () => {
    if (!open) return;

    setCameraError("");
    setIsStarting(true);

    try {
      stopStream();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: currentFacingMode },
          width: { ideal: 1080 },
          height: { ideal: 1920 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
    } catch (error) {
      setCameraError(
        error?.message || "No se pudo abrir la cámara. Verifica permisos y usa HTTPS o localhost."
      );
    } finally {
      setIsStarting(false);
    }
  }, [currentFacingMode, open, stopStream]);

  useEffect(() => {
    if (!open || capturedFile) return undefined;

    startStream();
    return () => stopStream();
  }, [capturedFile, open, startStream, stopStream]);

  useEffect(() => {
    if (!capturedFile) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(capturedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [capturedFile]);

  useEffect(() => {
    if (!open) {
      stopStream();
      setCapturedFile(null);
      setPreviewUrl("");
      setRecordingSeconds(0);
      setCameraError("");
      return;
    }

    setCurrentFacingMode(getCaptureFacingMode(facingMode));
  }, [facingMode, open, stopStream]);

  const handleClose = useCallback(() => {
    stopStream();
    setCapturedFile(null);
    setPreviewUrl("");
    setRecordingSeconds(0);
    onClose?.();
  }, [onClose, stopStream]);

  const capturePhoto = useCallback(async () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth || 1080;
    canvas.height = videoElement.videoHeight || 1920;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.92);
    });

    if (!blob) return;

    setCapturedFile(
      new File([blob], `story-${Date.now()}.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      })
    );

    stopStream();
  }, [stopStream]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }

    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }

    setIsRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || !recordingSupported) return;

    const mimeType = pickRecorderMimeType();
    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

    recordedChunksRef.current = [];
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data?.size) {
        recordedChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, {
        type: recorder.mimeType || "video/webm",
      });

      setCapturedFile(
        new File([blob], `story-${Date.now()}.webm`, {
          type: blob.type || "video/webm",
          lastModified: Date.now(),
        })
      );

      setRecordingSeconds(0);
      stopStream();
    };

    recorder.start();
    setIsRecording(true);
    setRecordingSeconds(0);

    recordTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    autoStopTimerRef.current = setTimeout(() => {
      stopRecording();
    }, STORY_MAX_VIDEO_DURATION_SECONDS * 1000);
  }, [recordingSupported, stopRecording, stopStream]);

  const handleSwitchCamera = useCallback(() => {
    setCurrentFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, []);

  const handleRetake = useCallback(() => {
    setCapturedFile(null);
    setPreviewUrl("");
    setCameraError("");
    setRecordingSeconds(0);
  }, []);

  const handleUseMedia = useCallback(() => {
    if (!capturedFile) return;
    onCapture?.(capturedFile, { autoUpload: true });
  }, [capturedFile, onCapture]);

  return (
    <AnimatePresence>
      {open && (
        <MotionBox
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 2200,
            background:
              "radial-gradient(circle at top, rgba(0,255,136,0.12) 0%, rgba(0,0,0,0.92) 40%, rgba(0,0,0,0.98) 100%)",
            display: "flex",
            alignItems: "stretch",
            justifyContent: "center",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              maxWidth: 520,
              height: "100%",
              bgcolor: "#030303",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1.5,
                background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.08) 100%)",
                backdropFilter: "blur(12px)",
              }}
            >
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Chip
                  label={capturedFile ? "Preview lista" : "Cámara Pro"}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
                <Chip
                  label={`${STORY_MAX_VIDEO_DURATION_SECONDS}s max`}
                  size="small"
                  sx={{
                    bgcolor: "rgba(0,255,136,0.12)",
                    color: "#9dffd1",
                    border: "1px solid rgba(0,255,136,0.18)",
                  }}
                />
              </Box>

              <IconButton onClick={handleClose} sx={{ color: "#fff" }}>
                <CloseRoundedIcon />
              </IconButton>
            </Box>

            {!capturedFile ? (
              <>
                <Box sx={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                  <Box
                    component="video"
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />

                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.02) 30%, rgba(0,0,0,0.22) 100%)",
                    }}
                  />
                </Box>

                {(isStarting || cameraError) && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 25,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 3,
                      textAlign: "center",
                      background: "rgba(0,0,0,0.4)",
                    }}
                  >
                    <Box>
                      <Typography sx={{ color: "#fff", fontWeight: 700, mb: 1 }}>
                        {isStarting ? "Abriendo cámara..." : "No se pudo abrir la cámara"}
                      </Typography>
                      <Typography sx={{ color: "#c9d1d9", fontSize: 13 }}>
                        {cameraError || "Permite el acceso para usar la captura premium."}
                      </Typography>
                    </Box>
                  </Box>
                )}

                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 35,
                    p: 2,
                    background: "linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.7) 100%)",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <Button
                      onClick={handleSwitchCamera}
                      startIcon={<CameraswitchRoundedIcon />}
                      sx={{
                        color: "#fff",
                        textTransform: "none",
                        borderRadius: "999px",
                        bgcolor: "rgba(255,255,255,0.08)",
                      }}
                    >
                      {currentFacingMode === "environment" ? "Trasera" : "Selfie"}
                    </Button>

                    {recordingSupported && (
                      <Chip
                        label={isRecording ? `Grabando ${recordingSeconds}s` : "Video"}
                        sx={{
                          color: "#fff",
                          bgcolor: isRecording ? "rgba(255,59,48,0.88)" : "rgba(255,255,255,0.1)",
                        }}
                      />
                    )}
                  </Box>

                  <Box sx={{ display: "flex", gap: 1.2, alignItems: "center", justifyContent: "center" }}>
                    <Button
                      onClick={capturePhoto}
                      variant="contained"
                      startIcon={<CameraRoundedIcon />}
                      sx={{
                        borderRadius: "999px",
                        px: 2.4,
                        py: 1.1,
                        textTransform: "none",
                        fontWeight: 800,
                        color: "#07120d",
                        background: "linear-gradient(90deg, #00ff88, #00c6ff)",
                      }}
                    >
                      Foto
                    </Button>

                    {recordingSupported && (
                      <Button
                        onClick={isRecording ? stopRecording : startRecording}
                        variant="outlined"
                        startIcon={<FiberManualRecordRoundedIcon />}
                        sx={{
                          borderRadius: "999px",
                          px: 2.4,
                          py: 1.1,
                          textTransform: "none",
                          fontWeight: 800,
                          color: isRecording ? "#ff6b6b" : "#fff",
                          borderColor: isRecording ? "rgba(255,107,107,0.6)" : "rgba(255,255,255,0.2)",
                        }}
                      >
                        {isRecording ? "Detener" : "Grabar"}
                      </Button>
                    )}
                  </Box>
                </Box>
              </>
            ) : (
              <>
                <Box sx={{ position: "absolute", inset: 0 }}>
                  {capturedFile.type.startsWith("video/") ? (
                    <Box
                      component="video"
                      src={previewUrl}
                      controls
                      autoPlay
                      playsInline
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <Box
                      component="img"
                      src={previewUrl}
                      alt="Preview historia"
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                </Box>

                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 35,
                    p: 2,
                    background: "linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.76) 100%)",
                  }}
                >
                  <Typography sx={{ color: "#fff", fontWeight: 700, mb: 1.2 }}>
                    Vista previa lista para subir
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1.2 }}>
                    <Button
                      onClick={handleRetake}
                      variant="outlined"
                      startIcon={<ReplayRoundedIcon />}
                      sx={{
                        flex: 1,
                        borderRadius: "16px",
                        textTransform: "none",
                        color: "#fff",
                        borderColor: "rgba(255,255,255,0.2)",
                      }}
                    >
                      Repetir
                    </Button>
                    <Button
                      onClick={handleUseMedia}
                      variant="contained"
                      startIcon={<CheckRoundedIcon />}
                      sx={{
                        flex: 1,
                        borderRadius: "16px",
                        textTransform: "none",
                        fontWeight: 800,
                        color: "#07120d",
                        background: "linear-gradient(90deg, #00ff88, #00c6ff)",
                      }}
                    >
                      Usar esta toma
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </MotionBox>
      )}
    </AnimatePresence>
  );
}
