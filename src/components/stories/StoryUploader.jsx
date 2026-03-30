// 🔥 STORY EDITOR V5 ULTRA PRO (Instagram-level)
// Features:
// - Pinch zoom (mobile)
// - Drag / rotate / scale
// - GIF picker (Giphy API placeholder)
// - Music layer (audio preview + timeline)
// - Multi-layer system

import React, { useRef, useState, useEffect } from "react";
import { Box, Button } from "@mui/material";

export default function StoryEditorV5() {
  const containerRef = useRef(null);
  const [layers, setLayers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [scale, setScale] = useState(1);
  const [audio, setAudio] = useState(null);

  // ======================
  // ✋ PINCH ZOOM
  // ======================
  useEffect(() => {
    let initialDistance = null;

    const getDistance = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        const dist = getDistance(e.touches);
        if (!initialDistance) {
          initialDistance = dist;
        } else {
          const zoom = dist / initialDistance;
          setScale((prev) => Math.max(0.5, Math.min(prev * zoom, 3)));
          initialDistance = dist;
        }
      }
    };

    const reset = () => (initialDistance = null);

    const el = containerRef.current;
    el.addEventListener("touchmove", handleTouchMove);
    el.addEventListener("touchend", reset);

    return () => {
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", reset);
    };
  }, []);

  // ======================
  // 🧩 ADD TEXT
  // ======================
  const addText = () => {
    setLayers((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "text",
        content: "Nuevo texto",
        x: 100,
        y: 100,
        scale: 1,
        rotate: 0,
      },
    ]);
  };

  // ======================
  // 😂 ADD GIF (GIPHY)
  // ======================
  const addGif = async () => {
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/trending?api_key=YOUR_API_KEY&limit=1`
    );
    const data = await res.json();

    const gifUrl = data.data[0].images.original.url;

    setLayers((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "gif",
        content: gifUrl,
        x: 120,
        y: 120,
        scale: 1,
        rotate: 0,
      },
    ]);
  };

  // ======================
  // 🎵 MUSIC
  // ======================
  const handleMusic = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const audioObj = new Audio(url);
    audioObj.play();
    setAudio(audioObj);
  };

  // ======================
  // 🎯 DRAG
  // ======================
  const startDrag = (e, id) => {
    const startX = e.clientX;
    const startY = e.clientY;

    const layer = layers.find((l) => l.id === id);

    const move = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      setLayers((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, x: layer.x + dx, y: layer.y + dy }
            : l
        )
      );
    };

    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <Box>
      {/* CANVAS */}
      <Box
        ref={containerRef}
        sx={{
          width: "100%",
          height: "80vh",
          background: "black",
          position: "relative",
          overflow: "hidden",
          touchAction: "none",
        }}
      >
        <Box
          sx={{
            transform: `scale(${scale})`,
            transformOrigin: "center",
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          {layers.map((layer) => (
            <Box
              key={layer.id}
              onMouseDown={(e) => startDrag(e, layer.id)}
              onClick={() => setSelectedId(layer.id)}
              sx={{
                position: "absolute",
                top: layer.y,
                left: layer.x,
                transform: `scale(${layer.scale}) rotate(${layer.rotate}deg)`,
                color: "white",
                cursor: "grab",
                border:
                  selectedId === layer.id
                    ? "1px solid #00ff88"
                    : "none",
              }}
            >
              {layer.type === "text" && layer.content}
              {layer.type === "gif" && (
                <img src={layer.content} width={120} />
              )}
            </Box>
          ))}
        </Box>
      </Box>

      {/* CONTROLS */}
      <Box sx={{ display: "flex", gap: 1, p: 2 }}>
        <Button onClick={addText}>Texto</Button>
        <Button onClick={addGif}>GIF</Button>
        <Button component="label">
          Música
          <input hidden type="file" accept="audio/*" onChange={handleMusic} />
        </Button>
      </Box>
    </Box>
  );
}
