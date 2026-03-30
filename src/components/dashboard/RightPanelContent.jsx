import React, { memo, useMemo, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Button,
  IconButton,
  CircularProgress,
  Stack,
} from "@mui/material";
import { motion } from "framer-motion";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import GrainRoundedIcon from "@mui/icons-material/GrainRounded";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

function RightPanelContent({
  loadingFood,
  dailyFoodEntries = [],
  handleDeleteFoodEntry,
  todayTotal,
  targetCalories,
  todayProtein,
  targetProtein,
  todayCarbs,
  todayFats,
  todayFiber,
  todaySodium,
  resetFoodForm,
  setFoodModalOpen,
}) {
  const safeDailyFoodEntries = Array.isArray(dailyFoodEntries)
    ? dailyFoodEntries
    : [];

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const weekly = useMemo(() => [40, 60, 80, 50, 70, 90, 65], []);
  const days = useMemo(() => ["L", "M", "X", "J", "V", "S", "D"], []);

  const handleDelete = useCallback(
    (id) => {
      handleDeleteFoodEntry(id);
    },
    [handleDeleteFoodEntry]
  );

  const premiumCardStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 16,
    backdropFilter: isMobile ? "none" : "blur(10px)",
    boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
    overflow: "hidden",
  };

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: 10 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.25 },
    },
  };

  const StatProgress = ({ label, value, target, icon, gradient, unit = "" }) => {
    const percent = target ? Math.min((value / target) * 100, 100) : 0;

    return (
      <Box sx={{ mb: 2 }}>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            {icon}
            <Typography sx={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>
              {label}
            </Typography>
          </Stack>

          <Typography sx={{ color: "#8bffcf", fontSize: 12, fontWeight: 700 }}>
            {value} / {target} {unit}
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={percent}
          sx={{
            height: 8,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.08)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 999,
              background: gradient,
            },
          }}
        />
      </Box>
    );
  };

  return (
    <MotionBox
      variants={containerVariants}
      initial={isMobile ? false : "hidden"}
      animate={isMobile ? false : "show"}
      sx={{
        width: { xs: "100%", md: 320 },
        minHeight: "100dvh",
        p: 2,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        background:
          "linear-gradient(180deg, rgba(14,14,14,0.98), rgba(20,20,20,0.95))",
        borderLeft: { md: "1px solid rgba(255,255,255,0.05)" },
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {/* WEEKLY */}
      <MotionCard variants={cardVariants} sx={premiumCardStyle}>
        <CardContent>
          <Stack direction="row" spacing={1} mb={2}>
            <TrendingUpRoundedIcon sx={{ color: "#00ff88" }} />
            <Typography sx={{ color: "#fff", fontWeight: 800 }}>
              Calorías semana
            </Typography>
          </Stack>

          <Box display="flex" alignItems="flex-end" height={100} gap={1}>
            {weekly.map((v, i) => (
              <Box key={i} flex={1} textAlign="center">
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    height: v,
                    width: 12,
                    margin: "0 auto",
                    borderRadius: 8,
                    transformOrigin: "bottom",
                    background: "linear-gradient(180deg, #00ff88, #00c6ff)",
                  }}
                />
                <Typography sx={{ fontSize: 10, color: "#8b949e", mt: 0.5 }}>
                  {days[i]}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </MotionCard>

      {/* FOOD */}
      <MotionCard variants={cardVariants} sx={premiumCardStyle}>
        <CardContent>
          <Stack direction="row" spacing={1} mb={1}>
            <RestaurantRoundedIcon sx={{ color: "#00ff88" }} />
            <Typography sx={{ color: "#fff", fontWeight: 800 }}>
              Entradas del día
            </Typography>
          </Stack>

          {loadingFood ? (
            <Box textAlign="center" py={2}>
              <CircularProgress size={20} />
            </Box>
          ) : safeDailyFoodEntries.length === 0 ? (
            <Typography sx={{ color: "#8b949e", fontSize: 12 }}>
              Sin comidas aún
            </Typography>
          ) : (
            safeDailyFoodEntries.slice(0, 4).map((entry) => (
              <Box
                key={entry.id}
                sx={{
                  mb: 1,
                  p: 1,
                  borderRadius: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <Box>
                  <Typography sx={{ color: "#fff", fontSize: 12 }}>
                    {entry.descripcion}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "#8b949e" }}>
                    {entry.calorias} kcal
                  </Typography>
                </Box>

                <IconButton
                  size="small"
                  onClick={() => handleDelete(entry.id)}
                >
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            ))
          )}
        </CardContent>
      </MotionCard>

      {/* CONSUMO */}
      <MotionCard variants={cardVariants} sx={premiumCardStyle}>
        <CardContent>
          <Typography sx={{ color: "#fff", fontWeight: 800, mb: 2 }}>
            Consumo del Día
          </Typography>

          <StatProgress
            label="Calorías"
            value={todayTotal}
            target={targetCalories}
            unit="kcal"
            icon={<LocalFireDepartmentRoundedIcon />}
            gradient="linear-gradient(90deg,#00ff88,#00c6ff)"
          />

          <StatProgress
            label="Proteína"
            value={todayProtein}
            target={targetProtein}
            unit="g"
            icon={<FitnessCenterRoundedIcon />}
            gradient="linear-gradient(90deg,#00c6ff,#7b61ff)"
          />

          <Typography sx={{ color: "#fff", fontSize: 13 }}>
            Carbs: {todayCarbs} g
          </Typography>

          <Button
            fullWidth
            onClick={() => {
              resetFoodForm();
              setFoodModalOpen(true);
            }}
            sx={{
              mt: 2,
              borderRadius: 2,
              background: "linear-gradient(90deg,#00ff88,#00c6ff)",
              color: "#000",
              fontWeight: 700,
            }}
          >
            Registrar
          </Button>
        </CardContent>
      </MotionCard>
    </MotionBox>
  );
}

export default memo(RightPanelContent);