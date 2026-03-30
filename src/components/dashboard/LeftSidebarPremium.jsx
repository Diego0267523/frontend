import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  Box,
  Typography,
  Avatar,
  Stack,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import AddBoxRoundedIcon from "@mui/icons-material/AddBoxRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

const MotionBox = motion(Box);

export default function LeftSidebarPremium({
  active = "home",
  onChange,
  onOpenAI,
  onOpenCreate,
  onOpenProgress,
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  
const menuItems = [
  { id: 'home', label: 'Inicio', icon: <HomeRoundedIcon />, type: 'page' },
  { id: 'workouts', label: 'Rutinas', icon: <FitnessCenterRoundedIcon />, type: 'page' },
  { id: 'nutrition', label: 'Nutrición', icon: <RestaurantRoundedIcon />, type: 'page' },
  { id: 'progress', label: 'Progreso', icon: <TrendingUpRoundedIcon />, type: 'action', action: () => onOpenProgress?.() },
  { id: 'community', label: 'Comunidad', icon: <GroupsRoundedIcon />, type: 'page' },
  { id: 'coach', label: 'AI Coach', icon: <SmartToyRoundedIcon />, type: 'action', action: () => onOpenAI?.() },
];

  const handleClick = (item) => {
    if (item.action) {
      item.action?.();
      return;
    }

    onChange?.(item.id);
  };

  const handleLogout = () => {
    logout();
    setSettingsOpen(false);
    navigate("/login");
  };

  return (
    <Box
      sx={{
        width: 260,
        minHeight: "100vh",
        p: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background:
          "linear-gradient(180deg, rgba(14,14,14,0.98) 0%, rgba(20,20,20,0.95) 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(18px)",
      }}
    >
      <Box>
        <Typography
          sx={{
            color: "#fff",
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            mb: 3,
          }}
        >
          Fit<span style={{ color: "#00ff88" }}>Sync</span>
        </Typography>

        {/* USER CARD */}
        <MotionBox
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0 }}
          onClick={() => {
            if (user?.nombre) {
              const username = user.nombre.toLowerCase();
              navigate(`/app/u/${username}`);
              onChange?.("profile");
            }
          }}
          sx={{
            p: 1.5,
            mb: 3,
            borderRadius: 4,
            background: active === "profile" ? "linear-gradient(90deg, #00ff88, #00c6ff)" : "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.05)",
            color: active === "profile" ? "#08110d" : "#fff",
            cursor: "pointer",
            transition: "all 0.25s ease",
            "&:hover": {
              background: active === "profile" ? "linear-gradient(90deg, #00ff88, #00c6ff)" : "rgba(255,255,255,0.08)",
              transform: "translateX(4px)",
            }
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Badge
              overlap="circular"
              color="success"
              variant="dot"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
              <Avatar sx={{ width: 46, height: 46 }}>{user?.nombre?.[0]?.toUpperCase() || "U"}</Avatar>
            </Badge>

            <Box>
              <Typography
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {user?.nombre || "Usuario"}
              </Typography>

              <Typography
                sx={{
                  color: "#8b949e",
                  fontSize: 12,
                }}
              >
                {user?.racha || 0} días seguidos 🔥
              </Typography>
            </Box>
          </Stack>
        </MotionBox>

        {/* MENU */}
        <Stack spacing={1}>
          {menuItems.map((item, index) => {
            const isActive = active === item.id && !item.action;

            return (
              <MotionBox
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleClick(item)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1.5,
                  py: 1.3,
                  borderRadius: 3,
                  cursor: "pointer",
                  color: isActive ? "#08110d" : "#c9d1d9",
                  background: isActive
                    ? "linear-gradient(90deg, #00ff88, #00c6ff)"
                    : "transparent",
                  boxShadow: isActive
                    ? "0 0 20px rgba(0,255,136,0.18)"
                    : "none",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    background: isActive
                      ? "linear-gradient(90deg, #00ff88, #00c6ff)"
                      : "rgba(255,255,255,0.05)",
                    transform: "translateX(4px)",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {item.icon}
                </Box>

                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {item.label}
                </Typography>
              </MotionBox>
            );
          })}
        </Stack>
      </Box>

      {/* FOOTER */}
      <Box
        sx={{
          p: 1.2,
          borderRadius: 4,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Typography
              sx={{
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Meta diaria
            </Typography>

            <Typography
              sx={{
                color: "#8b949e",
                fontSize: 12,
              }}
            >
              82% completado
            </Typography>
          </Box>

          <IconButton
            onClick={() => setSettingsOpen(true)}
            sx={{
              color: "#c9d1d9",
              background: "rgba(255,255,255,0.04)",
              "&:hover": {
                background: "rgba(255,255,255,0.08)",
              },
            }}
          >
            <SettingsRoundedIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* SETTINGS DRAWER */}
      <Drawer
        anchor="left"
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            background: 'linear-gradient(180deg, rgba(14,14,14,0.98) 0%, rgba(20,20,20,0.95) 100%)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(18px)',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            sx={{
              color: "#fff",
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              mb: 3,
            }}
          >
            Configuración
          </Typography>

          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutRoundedIcon sx={{ color: "#ff4757" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Cerrar Sesión"
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: "#fff",
                      fontWeight: 600,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}