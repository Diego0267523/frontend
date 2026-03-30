import React, { memo, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Button,
  IconButton,
  Stack,
  Skeleton,
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

  const weekly = useMemo(() => [40, 60, 80, 50, 70, 90, 65], []);
  const days = useMemo(() => ["L", "M", "X", "J", "V", "S", "D"], []);

  const premiumCardStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 4,
    backdropFilter: "blur(18px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
    overflow: "hidden",
  };

  // 🔥 ANIMACIÓN STAGGER GLOBAL
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 },
  };

  const StatProgress = ({ label, value, target, icon, gradient, unit = "" }) => {
    const percent = target ? Math.min((value / target) * 100, 100) : 0;

    return (
      <Box sx={{ mb: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            {icon}
            <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>
              {label}
            </Typography>
          </Stack>

          <Typography sx={{ color: "#8bffcf", fontSize: 13, fontWeight: 700 }}>
            {value} / {target} {unit}
          </Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={percent}
          sx={{
            height: 10,
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <Box
        sx={{
          width: { xs: "100%", md: 340 },
          minHeight: "100dvh",
          pb: { xs: 10, md: 2 },
          p: { xs: 1.5, md: 2 },
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          background:
            "linear-gradient(180deg, rgba(14,14,14,0.98) 0%, rgba(20,20,20,0.95) 100%)",
          borderLeft: { md: "1px solid rgba(255,255,255,0.06)" },
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >

        {/* WEEK */}
        <MotionCard variants={itemVariants} sx={premiumCardStyle}>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <TrendingUpRoundedIcon sx={{ color: "#00ff88" }} />
              <Typography sx={{ color: "#fff", fontWeight: 800 }}>
                Calorías semana
              </Typography>
            </Stack>

            <Box sx={{ display: "flex", gap: 1, height: 120, alignItems: "flex-end" }}>
              {weekly.map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: v }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    flex: 1,
                    borderRadius: 10,
                    background: "linear-gradient(180deg, #00ff88, #00c6ff)",
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </MotionCard>

        {/* FOOD */}
        <MotionCard variants={itemVariants} sx={premiumCardStyle}>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <RestaurantRoundedIcon sx={{ color: "#00ff88" }} />
              <Typography sx={{ color: "#fff", fontWeight: 800 }}>
                Entradas del día
              </Typography>
            </Stack>

            {loadingFood ? (
              <Stack spacing={1}>
                {[1,2,3].map(i => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    height={50}
                    sx={{
                      borderRadius: 3,
                      background: "rgba(255,255,255,0.06)",
                    }}
                  />
                ))}
              </Stack>
            ) : safeDailyFoodEntries.length === 0 ? (
              <Typography sx={{ color: "#8b949e", fontSize: 12 }}>
                Aún no hay comidas registradas.
              </Typography>
            ) : (
              safeDailyFoodEntries.slice(0, 4).map((entry) => (
                <Box
                  key={entry.id}
                  sx={{
                    mb: 1,
                    p: 1.2,
                    borderRadius: 3,
                    display: "flex",
                    justifyContent: "space-between",
                    background: "rgba(255,255,255,0.04)",
                    "&:hover": {
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <Box>
                    <Typography sx={{ color: "#fff", fontSize: 12 }}>
                      {entry.descripcion}
                    </Typography>
                  </Box>

                  <IconButton onClick={() => handleDeleteFoodEntry(entry.id)}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>
              ))
            )}
          </CardContent>
        </MotionCard>

        {/* DAILY */}
        <MotionCard variants={itemVariants} sx={premiumCardStyle}>
          <CardContent>
            <Typography sx={{ color: "#fff", fontWeight: 800, mb: 2 }}>
              Consumo del Día
            </Typography>

            <StatProgress
              label="Calorías"
              value={todayTotal}
              target={targetCalories}
              icon={<LocalFireDepartmentRoundedIcon sx={{ color: "#00ff88" }} />}
              gradient="linear-gradient(90deg, #00ff88, #00c6ff)"
            />

            <StatProgress
              label="Proteína"
              value={todayProtein}
              target={targetProtein}
              icon={<FitnessCenterRoundedIcon sx={{ color: "#00c6ff" }} />}
              gradient="linear-gradient(90deg, #00c6ff, #7b61ff)"
            />

            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                resetFoodForm();
                setFoodModalOpen(true);
              }}
              sx={{
                mt: 2,
                borderRadius: 3,
                fontWeight: 800,
                background: "linear-gradient(90deg, #00ff88, #00c6ff)",
              }}
            >
              Registrar Comida
            </Button>
          </CardContent>
        </MotionCard>

      </Box>
    </motion.div>
  );
}

export default memo(RightPanelContent);