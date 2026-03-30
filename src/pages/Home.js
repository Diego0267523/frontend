import CreateStoryModalPremium from "../components/modals/CreateStoryModalPremium";
import FeedCenterPremium from "../components/feed/FeedCenterPremium";
import LeftSidebarPremium from "../components/dashboard/LeftSidebarPremium";
import RightPanelContent from "../components/dashboard/RightPanelContent";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../context/SocketContext";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useCallback, useRef, useMemo } from "react";
import PostCard from "../components/postCard";
import Profile from "./Profile";
import { useCreatePost, usePosts } from "../hooks/usePosts";
import { containerVariants, itemVariants, buttonVariants, slideInUpVariants } from "../utils/motion-variants";
// 🔥 NUEVO
import { analyzeFood } from "../api/food";
import {
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  LinearProgress,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
  Skeleton,
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";

import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MenuIcon from "@mui/icons-material/Menu";
import BarChartIcon from "@mui/icons-material/BarChart";
import CloseIcon from "@mui/icons-material/Close";

import FoodModal from "../components/FoodModal"; // 🔥 Agregado: componente separado
import ChatAssistant from "../components/ChatAssistant"; // 🔥 Agregado: componente de chat IA

import { createStory, createFoodEntry, createFoodEntryWithImage, getFoodEntries, getDailyTotals, getWeeklyTotals, deleteFoodEntry } from "../api";
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_URL from '../utils/config';

function Home() {



  const [activeSection, setActiveSection] = React.useState("home");
  const { user, logout } = useAuth();
  const { socket, connected } = useSocket();
  const createPostMutation = useCreatePost();

  const [file, setFile] = useState(null);

  const [postCaption, setPostCaption] = useState("");

  // 🔥 HISTORIAS
  const [storyFile, setStoryFile] = useState(null);
  const [isUploadingStory, setIsUploadingStory] = useState(false);
  const [stories, setStories] = useState([]);

  // 🔥 STORY VIEWER
  const [viewingStory, setViewingStory] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const [storyTimer, setStoryTimer] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userStories, setUserStories] = useState([]);
  const [storyUsers, setStoryUsers] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const queryClient = useQueryClient(); // 🔥 PREFETCH

  const [open, setOpen] = useState(false);
  const [openRight, setOpenRight] = useState(false);
  
  const [showAI, setShowAI] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [newPostsAvailable, setNewPostsAvailable] = useState(0);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const creatingPostRef = useRef(false);
  const creatingStoryRef = useRef(false);

  const [dailyFoodEntries, setDailyFoodEntries] = useState([]);
  const [weeklyCalories, setWeeklyCalories] = useState([]);
  const [foodModalOpen, setFoodModalOpen] = useState(false); // 🔥 Agregado de vuelta para el modal
  const [targetCalories, setTargetCalories] = useState(2000);
  const [targetProtein, setTargetProtein] = useState(150); // Objetivo de proteína en gramos
  const [targetWater, setTargetWater] = useState(2000); // Objetivo de agua en ml
  const [todayTotal, setTodayTotal] = useState(0);
  const [todayProtein, setTodayProtein] = useState(0);
  const [todayCarbs, setTodayCarbs] = useState(0);
  const [todayFats, setTodayFats] = useState(0);
  const [todayFiber, setTodayFiber] = useState(0);
  const [todaySodium, setTodaySodium] = useState(0);
  const [todayWater, setTodayWater] = useState(0); // Estado para el agua consumida hoy
  const [loadingFood, setLoadingFood] = useState(false); // 🔥 Agregado: estado de carga para operaciones de comida
  // const [debouncedFoodText, setDebouncedFoodText] = useState("");

  // React.useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setDebouncedFoodText(foodText);
  //   }, 300);
  //   return () => clearTimeout(timer);
  // }, [foodText]);
React.useEffect(() => {
  return () => {
    if (file) URL.revokeObjectURL(file);
  };
}, [file]);
React.useEffect(() => {
  setNewPostsAvailable(0);
}, [location.pathname]);

  // 🔥 Escuchar nuevas publicaciones en tiempo real (realtime)
  React.useEffect(() => {
    if (!socket || !connected) return;

    const handleNewPost = ({ post }) => {
      if (!post) return;

      queryClient.setQueryData(["posts"], (old) => {
        if (!old?.pages) return old || { pages: [] };
        return {
          ...old,
          pages: old.pages.map((page, index) => {
            if (index !== 0) return page;
            const exists = (page.posts || []).some((p) => Number(p.id) === Number(post.id));
            if (exists) return page;
            return { ...page, posts: [post, ...(page.posts || [])] };
          }),
        };
      });

      queryClient.setQueryData(["feed"], (old) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page, index) => {
            if (index !== 0) return page;
            const exists = (page.data || []).some((p) => Number(p.id) === Number(post.id));
            if (exists) return page;
            return { ...page, data: [post, ...(page.data || [])] };
          }),
        };
      });

      setNewPostsAvailable((prev) => prev + 1);
    };

    socket.on('new_post', handleNewPost);

    return () => {
      socket.off('new_post', handleNewPost);
    };
 }, [socket?.id, connected]);

  // 🔥 NOTIFICACIONES
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

const handleCreatePost = async () => {
  // ✅ VALIDACIÓN
  if (!file) {
    setSnackbar({ open: true, message: "Selecciona una imagen", severity: "error" });
    return;
  }
  if (!postCaption.trim()) {
    setSnackbar({ open: true, message: "Escribe una descripción", severity: "error" });
    return;
  }

  // 🔹 Evitar múltiples envíos concurrentes
  if (creatingPostRef.current || isCreatingPost || createPostMutation.isLoading) return;

  creatingPostRef.current = true;
  setIsCreatingPost(true);

  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", postCaption);

    const result = await createPostMutation.mutateAsync(formData);

    if (!result?.success) {
      throw new Error(result?.message || "Respuesta de API inesperada");
    }

    // ✅ NOTIFICACIÓN DE ÉXITO
    setSnackbar({ open: true, message: "¡Post publicado exitosamente!", severity: "success" });

    // 🔹 4️⃣ Cerrar modal y limpiar después de 800ms
    setTimeout(() => {
      setShowCreatePost(false);
      setFile(null);
      setPostCaption("");
    }, 800);
  } catch (error) {
    console.error("Error en publicacion:", error.response?.data || error.message || error);
    setSnackbar({ open: true, message: "Error al publicar el post. Inténtalo de nuevo.", severity: "error" });
  } finally {
    creatingPostRef.current = false;
    setIsCreatingPost(false);
  }
};

// 🔥 Wrapper memoizado para publicar desde el modal
const handlePublication = useCallback(() => {
  handleCreatePost();
}, [handleCreatePost]);

// 🔥 Crear historia
const handleCreateStory = async () => {
  // ✅ VALIDACIÓN
  if (!file) {
    setSnackbar({ open: true, message: "Selecciona una imagen", severity: "error" });
    return;
  }

  // 🔹 Evitar múltiples envíos concurrentes
  if (creatingStoryRef.current || isCreatingStory) return;

  creatingStoryRef.current = true;
  setIsCreatingStory(true);

  try {
    const formData = new FormData();
    formData.append("image", file);
    // Historias pueden tener caption opcional
    if (postCaption.trim()) {
      formData.append("caption", postCaption);
    }

    // Aquí iría la llamada a API para crear historia
    // const result = await createStoryMutation.mutateAsync(formData);

    // Simulación de éxito mientras la API se prepara
    await new Promise(resolve => setTimeout(resolve, 800));

    // ✅ NOTIFICACIÓN DE ÉXITO
    setSnackbar({ open: true, message: "¡Historia publicada exitosamente!", severity: "success" });

    // 🔹 Cerrar modal y limpiar después de 800ms
    setTimeout(() => {
      setShowCreateStory(false);
      setFile(null);
      setPostCaption("");
    }, 800);
  } catch (error) {
    console.error("Error en historia:", error.response?.data || error.message || error);
    setSnackbar({ open: true, message: "Error al publicar la historia. Inténtalo de nuevo.", severity: "error" });
  } finally {
    creatingStoryRef.current = false;
    setIsCreatingStory(false);
  }
};

// 🔥 Wrapper memoizado para publicar historia
const handleStoryPublication = useCallback(() => {
  handleCreateStory();
}, [handleCreateStory]);

  const resetFoodForm = () => {
    // Función vacía, lógica movida a FoodModal
  };

const handleDeleteFoodEntry = async (id) => {
  if (!id) {
    setSnackbar({ open: true, message: "ID inválido", severity: "error" });
    return;
  }

  setLoadingFood(true);

  try {
    await deleteFoodEntry(id);
    setSnackbar({ open: true, message: "Entrada eliminada", severity: "info" });
    // Recargar datos
    await loadDailyFoodData();
  } catch (error) {
    console.error("Error eliminando comida:", error);
    let message = "Error al eliminar la entrada";
    if (error.response?.status === 401) {
      message = "Sesión expirada";
    } else if (error.response?.status === 404) {
      message = "Entrada no encontrada";
    } else if (!navigator.onLine) {
      message = "Sin conexión";
    }
    setSnackbar({ open: true, message, severity: "error" });
  } finally {
    setLoadingFood(false);
  }
};

// 🔥 HISTORIAS - Cargar historias al montar
const loadStories = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/stories`);
    if (response.data.success) {
      setStories(response.data.stories || []);
    }
  } catch (error) {
    console.error("Error loading stories:", error);
  }
};

React.useEffect(() => {
  loadStories();
}, []);

const handleUploadStory = async () => {
  if (!storyFile) {
    setSnackbar({ open: true, message: "Selecciona una imagen para la historia", severity: "error" });
    return;
  }

  setIsUploadingStory(true);
  try {
    const formData = new FormData();
    formData.append("image", storyFile);

    const response = await createStory(formData);

    if (response.data?.success) {
      setSnackbar({ open: true, message: "Historia subida exitosamente", severity: "success" });
      setStoryFile(null);
      await loadStories();
    } else {
      const message = response.data?.message || "No se pudo subir la historia";
      setSnackbar({ open: true, message, severity: "error" });
    }
  } catch (error) {
    console.error("Error subiendo historia:", error);
    const message = error.response?.data?.message || "Error al subir historia";
    setSnackbar({ open: true, message, severity: "error" });
  } finally {
    setIsUploadingStory(false);
  }
};

  const loadDailyFoodData = async () => {
    try {
      setLoadingFood(true);
      const fecha = new Date().toISOString().split('T')[0];
      const [entriesResponse, totalsResponse, weeklyResponse] = await Promise.all([
        getFoodEntries(fecha),
        getDailyTotals(fecha),
        getWeeklyTotals()
      ]);

      if (entriesResponse.data.success) {
        setDailyFoodEntries(entriesResponse.data.entries);
      } else {
        console.warn("Error cargando entradas:", entriesResponse.data.message);
        setDailyFoodEntries([]);
      }

      if (totalsResponse.data.success) {
        const totals = totalsResponse.data.totals;
        setTodayTotal(totals.total_calorias || 0);
        setTodayProtein(totals.total_proteina || 0);
        setTodayCarbs(totals.total_carbohidratos || 0);
        setTodayFats(totals.total_grasas || 0);
        setTodayFiber(totals.total_fibra || 0);
        setTodaySodium(totals.total_sodio || 0);
      } else {
        console.warn("Error cargando totales:", totalsResponse.data.message);
        setTodayTotal(0);
        setTodayProtein(0);
        setTodayCarbs(0);
        setTodayFats(0);
        setTodayFiber(0);
        setTodaySodium(0);
        setTodayFats(0);
        setTodayFiber(0);
        setTodaySodium(0);
      }

      if (weeklyResponse.data.success) {
        setWeeklyCalories(weeklyResponse.data.week || []);
      } else {
        console.warn("Error cargando totales semanales:", weeklyResponse.data.message);
        setWeeklyCalories([]);
      }
    } catch (error) {
      console.error("Error cargando datos de comida:", error);
      // Mostrar error solo si es crítico (ej. sin conexión)
      if (!navigator.onLine) {
        setSnackbar({ open: true, message: "Sin conexión a internet", severity: "warning" });
      }
      // Resetear estados en caso de error
      setDailyFoodEntries([]);
      setTodayTotal(0);
      setTodayProtein(0);
      setTodayCarbs(0);
    } finally {
      setLoadingFood(false);
    }
  };

  // 🔥 Función para refrescar datos de comida (sin loading)
  const refreshFoodData = async () => {
    try {
      const [entriesResponse, totalsResponse, weeklyResponse] = await Promise.all([
        getFoodEntries(),
        getDailyTotals(),
        getWeeklyTotals()
      ]);

      if (entriesResponse.data.success) {
        setDailyFoodEntries(entriesResponse.data.entries);
      }

      if (totalsResponse.data.success) {
        const totals = totalsResponse.data.totals;
        setTodayTotal(totals.total_calorias || 0);
        setTodayProtein(totals.total_proteina || 0);
        setTodayCarbs(totals.total_carbohidratos || 0);
        setTodayFats(totals.total_grasas || 0);
        setTodayFiber(totals.total_fibra || 0);
        setTodaySodium(totals.total_sodio || 0);
      }

      if (weeklyResponse.data.success) {
        setWeeklyCalories(weeklyResponse.data.week || []);
      }
    } catch (error) {
      console.error("Error refrescando datos de comida:", error);
    }
  };

  React.useEffect(() => {
    loadDailyFoodData();
  }, []);

  // 🔥 Auto-refresh cada minuto para actualizar gráficas en tiempo real
  React.useEffect(() => {
    // Recargar datos cada minuto
    const interval = setInterval(() => {
      loadDailyFoodData();
    }, 60000); // 60000ms = 1 minuto

    return () => clearInterval(interval);
  }, []);
  React.useEffect(() => {
    const scheduleWeeklyRefresh = () => {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = domingo, 1 = lunes, ...
      
      // Calcular próximo lunes a las 0:00
      let daysUntilMonday;
      if (dayOfWeek === 1) {
        // Si es lunes, esperar hasta próximo lunes
        daysUntilMonday = 7;
      } else {
        // Calcular días hasta próximo lunes
        daysUntilMonday = (1 - dayOfWeek + 7) % 7;
        if (daysUntilMonday === 0) daysUntilMonday = 7;
      }

      const nextMonday = new Date(now);
      nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
      nextMonday.setHours(0, 0, 0, 0); // Medianoche

      const timeUntilMonday = nextMonday - now;

      console.log(`⏰ Próximo refresh semanal en: ${Math.round(timeUntilMonday / 1000 / 60)} minutos`);

      // Setear timeout para el próximo lunes
      const timeout = setTimeout(() => {
        console.log("🔄 Actualizando datos semanales...");
        loadDailyFoodData(); // Recargar datos
        scheduleWeeklyRefresh(); // Programar el siguiente
      }, timeUntilMonday);

      return timeout;
    };

    const timeout = scheduleWeeklyRefresh();
    return () => clearTimeout(timeout);
  }, []);

  // 🔥 HISTORIAS - Eliminar historia propia
  const handleDeleteStory = async (storyId) => {
    try {
      const response = await axios.delete(`${API_URL}/api/stories/${storyId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.data.success) {
        setStories(stories.filter(s => s.id !== storyId));
        setSnackbar({ open: true, message: "Historia eliminada", severity: "success" });
      }
    } catch (error) {
      console.error("Error deleting story:", error);
      setSnackbar({ open: true, message: "Error al eliminar la historia", severity: "error" });
    }
  };

  // 🔥 STORY VIEWER FUNCTIONS
  const [seenStoryUsers, setSeenStoryUsers] = useState(new Set());
const getStoryRingColor = (userName) => {
  const userStories = stories.filter(s => s.nombre === userName);
  const isSeen = userStories.every(s => s.visto);

  return isSeen
    ? "#555"
    : "linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)";
};

  const openUserStories = (userName) => {
    const userStoriesFiltered = stories.filter(s => s.nombre === userName);
    if (!userStoriesFiltered.length) return;

    const uniqueUsers = [...new Set(stories.map(s => s.nombre))];
    setStoryUsers(uniqueUsers);
    setCurrentUser(userName);
    setUserStories(userStoriesFiltered);
    setCurrentStoryIndex(0);
    setViewingStory(true);
    setStoryProgress(0);
    setSeenStoryUsers((prev) => new Set(prev).add(userName));
    startStoryTimer();
  };

  const closeStoryViewer = () => {
    setViewingStory(false);
    setCurrentUser(null);
    setUserStories([]);
    setStoryUsers([]);
    stopStoryTimer();
  };

const startStoryTimer = () => {
  stopStoryTimer(); // 🔥 importante

  const interval = setInterval(() => {
    setStoryProgress((prev) => {
      if (prev >= 100) {
        nextStory();
        return 0;
      }
      return prev + 1;
    });
  }, 150);

  setStoryTimer(interval);
};

  const stopStoryTimer = () => {
    if (storyTimer) {
      clearInterval(storyTimer);
      setStoryTimer(null);
    }
  };

  const nextStory = () => {
    stopStoryTimer();

    if (currentStoryIndex < userStories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      setStoryProgress(0);
      startStoryTimer();
      return;
    }

    const currentUserIndex = storyUsers.indexOf(currentUser);
    if (currentUserIndex >= 0 && currentUserIndex < storyUsers.length - 1) {
      const nextUser = storyUsers[currentUserIndex + 1];
      openUserStories(nextUser);
      return;
    }

    closeStoryViewer();
  };

  const prevStory = () => {
    stopStoryTimer();
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      setStoryProgress(0);
      startStoryTimer();
    } else {
      const currentUserIndex = storyUsers.indexOf(currentUser);
      if (currentUserIndex > 0) {
        const previousUser = storyUsers[currentUserIndex - 1];
        openUserStories(previousUser);
      }
    }
  };

  const [showRetry, setShowRetry] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = usePosts();

  // Mostrar retry solo cuando falla carga inicial
  React.useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        if (!data?.pages?.some((p) => p.posts?.length > 0)) {
          setShowRetry(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
    setShowRetry(false);
  }, [isLoading, data]);

  const hasPosts = data?.pages?.some(page => page.posts && page.posts.length > 0);

    // =======================
  // 🔹 SCROLL DETECCIÓN
  // =======================
const scrollTimeout = useRef(null);

const handleScroll = useCallback((e) => {
  const target = e.currentTarget; // 🔥 GUARDAR AQUÍ (ANTES del timeout)
  if (!target) return;

  if (scrollTimeout.current) return;

  scrollTimeout.current = setTimeout(() => {
    scrollTimeout.current = null;

    const bottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

    if (bottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, 200);
}, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  // =======================
  // 🔹 PREFETCH (optimización)
  // =======================
  function prefetchProgreso() {
    queryClient.prefetchQuery({
      queryKey: ["progreso"],
      queryFn: async () => {
        const { data } = await axios.get("https://jsonplaceholder.typicode.com/posts?_limit=5");
        return data;
      }
    });
  }


 
   // =======================
   // 🔹 SIDEBAR
   // =======================
  
return (
  <Box
    sx={{
      display: "flex",
      height: "100vh",
      bgcolor: "#000",
      overflow: "hidden",
    }}
  >
    {/* LEFT SIDEBAR DESKTOP */}
    {!isMobile && (
      <Box
        sx={{
          width: 260,
          flexShrink: 0,
          overflowY: "auto",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          background:
            "linear-gradient(180deg, rgba(14,14,14,0.98) 0%, rgba(20,20,20,0.95) 100%)",
        }}
      >
          <LeftSidebarPremium
            active={activeSection}
            onChange={setActiveSection}
            onOpenAI={() => setShowAI(true)}
            onOpenCreate={() => setShowCreatePost(true)}
            onOpenProgress={() => setFoodModalOpen(true)}
            onOpenStories={() => setShowCreateStory(true)}
          />
      </Box>
    )}

    {/* MOBILE TOP BAR */}
    {isMobile && (
      <Box sx={topBar}>
        <IconButton onClick={() => setOpen(true)}>
          <MenuIcon sx={{ color: "#00ff88" }} />
        </IconButton>

        <IconButton onClick={() => setOpenRight(true)}>
          <BarChartIcon sx={{ color: "#00ff88" }} />
        </IconButton>
      </Box>
    )}

    {/* MOBILE LEFT DRAWER */}
    <Drawer
      open={open}
      onClose={() => setOpen(false)}
      PaperProps={{
        sx: {
          bgcolor: "#0b0b0b",
        },
      }}
    >
      <LeftSidebarPremium
        active={activeSection}
        onChange={setActiveSection}
        onOpenAI={() => {
          setShowAI(true);
          setOpen(false);
        }}
        onOpenCreate={() => {
          setShowCreatePost(true);
          setOpen(false);
        }}
        onOpenProgress={() => {
          setFoodModalOpen(true);
          setOpen(false);
        }}
        onOpenStories={() => {
          setShowCreateStory(true);
          setOpen(false);
        }}
      />
    </Drawer>

    {/* CENTER FEED */}
    <Box
      onScroll={handleScroll}
      sx={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        justifyContent: "center",
        px: { xs: 1, md: 3 },
        pt: { xs: 8, md: 0 },
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              overflowY: "auto",
              px: { xs: 1, md: 3 },
            }}
          >
            {activeSection === "home" && (
              <FeedCenterPremium
                isMobile={isMobile}
                stories={stories}
                onCreateStory={() => setShowCreateStory(true)}
                openUserStories={openUserStories}
                getStoryRingColor={getStoryRingColor}
                newPostsAvailable={newPostsAvailable}
                setNewPostsAvailable={setNewPostsAvailable}
                isLoading={isLoading}
                hasPosts={hasPosts}
                showRetry={showRetry}
                setShowRetry={setShowRetry}
                queryClient={queryClient}
                data={data}
                isFetchingNextPage={isFetchingNextPage}
                PostCard={PostCard}
              />
            )}

            {activeSection === "profile" && <Profile />}

            {activeSection === "coach" && (
              <ChatAssistant onClose={() => setActiveSection("home")} />
            )}
          </Box>
    </Box>

    {/* RIGHT PANEL DESKTOP */}
    {!isMobile && (
      <Box
        sx={{
          width: 340,
          flexShrink: 0,
          p: 2,
          overflowY: "auto",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          background:
            "linear-gradient(180deg, rgba(14,14,14,0.98) 0%, rgba(20,20,20,0.95) 100%)",
        }}
      >
        <RightPanelContent
          loadingFood={loadingFood}
          dailyFoodEntries={dailyFoodEntries}
          handleDeleteFoodEntry={handleDeleteFoodEntry}
          todayTotal={todayTotal}
          targetCalories={targetCalories}
          todayProtein={todayProtein}
          targetProtein={targetProtein}
          todayCarbs={todayCarbs}
          todayFats={todayFats}
          todayFiber={todayFiber}
          todaySodium={todaySodium}
          resetFoodForm={resetFoodForm}
          setFoodModalOpen={setFoodModalOpen}
        />
      </Box>
    )}

    {/* MOBILE RIGHT DRAWER */}
    <Drawer
      anchor="right"
      open={openRight}
      onClose={() => setOpenRight(false)}
      PaperProps={{
        sx: {
          bgcolor: "#0b0b0b",
          width: 340,
        },
      }}
    >
      <RightPanelContent
        loadingFood={loadingFood}
        dailyFoodEntries={dailyFoodEntries}
        handleDeleteFoodEntry={handleDeleteFoodEntry}
        todayTotal={todayTotal}
        targetCalories={targetCalories}
        todayProtein={todayProtein}
        targetProtein={targetProtein}
        todayCarbs={todayCarbs}
        todayFats={todayFats}
        todayFiber={todayFiber}
        todaySodium={todaySodium}
        resetFoodForm={resetFoodForm}
        setFoodModalOpen={setFoodModalOpen}
      />
    </Drawer>

    {/* MODALES */}
    {showAI && (
      <Box sx={aiOverlay}>
        <ChatAssistant onClose={() => setShowAI(false)} />
      </Box>
    )}

    {/* MODAL CREAR POST */}
    {showCreatePost && (
      <Box sx={overlayPro}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={modalPro}>
            <Typography sx={titlePro}>
              Crear Post 🚀
            </Typography>

            {/* PREVIEW */}
            {file && (
              <Box
                component="img"
                src={URL.createObjectURL(file)}
                sx={previewImage}
              />
            )}

            {/* INPUT FILE */}
            <Button
              variant="contained"
              component="label"
              sx={uploadBtn}
            >
              Subir imagen
              <input
                type="file"
                hidden
                onChange={(e) => setFile(e.target.files?.[0])}
              />
            </Button>

            {/* CAPTION */}
            <input
              placeholder="¿Qué estás pensando?"
              value={postCaption}
              onChange={(e) => setPostCaption(e.target.value)}
              style={inputPro}
            />

            {/* BOTONES */}
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                onClick={handlePublication}
                disabled={isCreatingPost}
                sx={postBtn}
              >
                {isCreatingPost ? "Publicando..." : "Publicar"}
              </Button>

              <Button
                onClick={() => {
                  setShowCreatePost(false);
                  setFile(null);
                  setPostCaption("");
                }}
                sx={cancelBtn}
              >
                Cancelar
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Box>
    )}

    {/* MODAL CREAR HISTORIA */}
  <CreateStoryModalPremium
  open={showCreateStory}
  file={file}
  setFile={setFile}
  postCaption={postCaption}
  setPostCaption={setPostCaption}
  isCreatingStory={isCreatingStory}
  handleStoryPublication={handleStoryPublication}
  onClose={() => setShowCreateStory(false)}
/>

    <FoodModal
      open={foodModalOpen}
      onClose={() => {
        setFoodModalOpen(false);
        resetFoodForm();
      }}
      onSuccess={refreshFoodData}
      snackbar={snackbar}
      setSnackbar={setSnackbar}
      targetCalories={targetCalories}
      todayTotal={todayTotal}
      todayProtein={todayProtein}
      todayCarbs={todayCarbs}
      todayFats={todayFats}
      todayFiber={todayFiber}
      todaySodium={todaySodium}
    />
  </Box>
);

}

/* 🎨 STYLES */

const sidebarStyle = {
  width: 250,
  height: "100vh",
  position: "fixed",
  left: 0,
  top: 0,
  bgcolor: "#0b0b0b",
  p: 2,
  display: "flex",
  flexDirection: "column"
};

const centerContent = (isMobile) => ({
  flex: 1,
  minWidth: 0,
  marginLeft: isMobile ? 0 : 250,
  marginRight: isMobile ? 0 : 280,
  width: isMobile ? "100%" : "calc(100vw - 530px)",
  display: "flex",
  justifyContent: "center",
  boxSizing: "border-box",
  paddingTop: isMobile ? 60 : 20,
  overflowX: "hidden"
});

const rightPanel = {
  width: 300,
  height: "100vh",
  position: "fixed",
  right: 0,
  top: 0,
  p: 2,
  bgcolor: "#0b0b0b"
};

const postCard = { bgcolor: "#111", mb: 2, borderRadius: 4 };

const headerStyle = { display: "flex", alignItems: "center", gap: 10, mb: 1 };
const username = { color: "#fff", fontWeight: "bold" };
const time = { color: "#777", fontSize: 12 };

const imageStyle = {
  width: "100%",
  height: 300,
  objectFit: "cover",
  borderRadius: 10,
  marginTop: 10
};

const actionsStyle = { display: "flex", gap: 1, mt: 1 };
const likes = { color: "#fff", mt: 1 };
const captionStyle = { color: "#ccc", mt: 1 };

const storiesContainer = {
  display: "flex",
  gap: 2,
  overflowX: "auto",
  mb: 2,
  '&::-webkit-scrollbar': { display: 'none' }
};

const storyCircle = {
  width: 80,
  height: 80,
  borderRadius: "50%",
  padding: 2,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "transform 0.2s"
};

const storyInner = {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  border: "2px solid #00ff88"
};

const storyItem = {
  textAlign: "center",
  width: 90,
  flexShrink: 0
};

const titleStyle = { color: "#00ff88" };

const avatarStyle = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  bgcolor: "#00ff88",
  backgroundSize: "cover",
  backgroundPosition: "center",
  border: "2px solid #00ff88"
};

const profileStyle = {
  display: "flex",
  gap: 2,
  mb: 2,
  cursor: "pointer"
};

const menuItemStyle = {
  mt: 2,
  p: 1.5,
  borderRadius: 3,
  cursor: "pointer",
  transition: "0.3s",
  '&:hover': {
    bgcolor: "#00ff8830",
    color: "#00ff88"
  }
};

const logoutStyle = {
  mt: "auto",
  bgcolor: "#00ff88",
  color: "#000",
  fontWeight: "bold",
  '&:hover': {
    bgcolor: "#00cc6a"
  }
};

const progressStyle = { height: 8, mt: 1 };

const topBar = {
  position: "fixed",
  top: 0,
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  bgcolor: "#000",
  zIndex: 100,
  height: 56,
  borderBottom: "1px solid rgba(255,255,255,0.06)"
};

const aiOverlay = {
  position: "fixed",
  inset: 0,
  background: "#000",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 500
};

// 🔥 MODAL CREAR POST (ESTILO PRO MEJORADO)

const overlayPro = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.92)",
  backdropFilter: "blur(8px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  overflowY: "auto",
  py: { xs: 2, md: 0 }
};

const modalPro = {
  width: 400,
  maxWidth: "90vw",
  bgcolor: "transparent",
  background: "linear-gradient(135deg, rgba(17,17,17,0.95) 0%, rgba(30,30,40,0.95) 100%)",
  borderRadius: "20px",
  p: 4,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  boxShadow: "0 20px 60px rgba(0,255,136,0.15), 0 0 40px rgba(0,255,136,0.08)",
  border: "1px solid rgba(0,255,136,0.2)",
  backdropFilter: "blur(10px)"
};

const titlePro = {
  color: "#00ff88",
  fontWeight: "700",
  mb: 3,
  fontSize: 24,
  letterSpacing: "0.5px",
  textShadow: "0 0 20px rgba(0,255,136,0.3)"
};

const previewImage = {
  width: "100%",
  height: 240,
  objectFit: "cover",
  borderRadius: "16px",
  marginBottom: 20,
  border: "2px solid rgba(0,255,136,0.3)",
  boxShadow: "0 10px 30px rgba(0,255,136,0.1)",
  transition: "all 0.3s ease"
};

const uploadBtn = {
  bgcolor: "#00ff88",
  color: "#000",
  fontWeight: "700",
  mt: 0,
  mb: 2,
  width: "100%",
  py: 1.5,
  borderRadius: "12px",
  fontSize: "15px",
  letterSpacing: "0.5px",
  boxShadow: "0 8px 20px rgba(0,255,136,0.3)",
  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
  '&:hover': {
    bgcolor: "#00ff88",
    boxShadow: "0 12px 30px rgba(0,255,136,0.4)",
    transform: "translateY(-2px)"
  },
  '&:active': {
    transform: "translateY(0px)"
  }
};

const inputPro = {
  width: "100%",
  marginTop: "0px",
  marginBottom: "20px",
  padding: "14px 16px",
  borderRadius: "12px",
  border: "1.5px solid rgba(0,255,136,0.2)",
  outline: "none",
  background: "rgba(25,25,35,0.6)",
  color: "#fff",
  fontSize: "15px",
  fontFamily: "inherit",
  letterSpacing: "0.3px",
  transition: "all 0.3s ease",
  backdropFilter: "blur(4px)",
  '&:focus': {
    borderColor: "rgba(0,255,136,0.5)",
    background: "rgba(25,25,35,0.8)",
    boxShadow: "0 0 0 3px rgba(0,255,136,0.1)"
  },
  '&::placeholder': {
    color: "rgba(255,255,255,0.4)"
  }
};

const postBtn = {
  bgcolor: "#00ff88",
  color: "#000",
  fontWeight: "700",
  flex: 1,
  py: 1.3,
  borderRadius: "12px",
  fontSize: "15px",
  letterSpacing: "0.5px",
  boxShadow: "0 8px 20px rgba(0,255,136,0.3)",
  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
  '&:hover': {
    bgcolor: "#00ff88",
    boxShadow: "0 12px 30px rgba(0,255,136,0.4)",
    transform: "translateY(-2px)"
  },
  '&:active': {
    transform: "translateY(0px)"
  },
  '&:disabled': {
    opacity: 0.6,
    boxShadow: "0 4px 10px rgba(0,255,136,0.2)"
  }
};

const cancelBtn = {
  bgcolor: "rgba(100,100,120,0.2)",
  color: "#fff",
  border: "1px solid rgba(100,100,120,0.4)",
  flex: 1,
  py: 1.3,
  borderRadius: "12px",
  fontSize: "15px",
  letterSpacing: "0.5px",
  fontWeight: "600",
  transition: "all 0.3s ease",
  backdropFilter: "blur(4px)",
  '&:hover': {
    bgcolor: "rgba(100,100,120,0.35)",
    border: "1px solid rgba(100,100,120,0.6)",
    transform: "translateY(-1px)"
  },
  '&:active': {
    transform: "translateY(0px)"
  },
  '&:disabled': {
    opacity: 0.5
  }
};

// 🔥 STORY VIEWER STYLES
const storyViewerOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.9)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const storyViewerContainer = {
  position: "relative",
  width: "100vw",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  justifyContent: "stretch",
  overflow: "hidden"
};

const storyTopBar = {
  position: "absolute",
  left: 0,
  top: 0,
  right: 0,
  padding: "14px 16px",
  zIndex: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  color: "#fff",
  backdropFilter: "blur(16px)",
  background: "rgba(0,0,0,0.24)"
};

const storyBottomText = {
  position: "absolute",
  left: 16,
  right: 16,
  bottom: 40,
  zIndex: 20,
  color: "#fff",
  fontSize: 20,
  fontWeight: 500,
  lineHeight: 1.3,
  textShadow: "0 0 14px rgba(0,0,0,0.8)",
  overflowWrap: "break-word"
};

const storyActionBar = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  height: 58,
  padding: "0 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  zIndex: 20,
  backdropFilter: "blur(16px)",
  background: "rgba(0,0,0,0.25)"
};

const progressContainer = {
  position: "absolute",
  top: 10,
  left: 10,
  right: 10,
  display: "flex",
  gap: 2,
  zIndex: 10
};

const progressBar = {
  flex: 1,
  height: 3,
  bgcolor: "rgba(255,255,255,0.3)",
  '& .MuiLinearProgress-bar': {
    bgcolor: "#fff"
  }
};

const closeButton = {
  position: "absolute",
  top: 20,
  right: 20,
  color: "#fff",
  bgcolor: "rgba(0,0,0,0.5)",
  zIndex: 10,
  '&:hover': {
    bgcolor: "rgba(0,0,0,0.7)"
  }
};

const userInfo = {
  position: "absolute",
  top: 30,
  left: 20,
  display: "flex",
  alignItems: "center",
  gap: 1,
  zIndex: 10
};

const userName = {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 16,
  textShadow: "0 0 10px rgba(0,0,0,0.5)"
};

const storyImage = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

const storyImageContainer = {
  position: "relative",
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden"
};

const navLeft = {
  position: "absolute",
  left: 0,
  top: 0,
  width: "50%",
  height: "100%",
  cursor: "pointer"
};

const navRight = {
  position: "absolute",
  right: 0,
  top: 0,
  width: "50%",
  height: "100%",
  cursor: "pointer"
};

export default Home;