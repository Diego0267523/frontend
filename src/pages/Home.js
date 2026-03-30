import CreateStoryModalPremium from "../components/modals/CreateStoryModalPremium";
import FeedCenterPremium from "../components/feed/FeedCenterPremium";
import LeftSidebarPremium from "../components/dashboard/LeftSidebarPremium";
import RightPanelContent from "../components/dashboard/RightPanelContent";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../context/SocketContext";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import React, { useState, useCallback, useRef, useMemo } from "react";
import PostCard from "../components/postCard";
import Profile from "./Profile";
import { useCreatePost, usePosts } from "../hooks/usePosts";
import {
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import BarChartIcon from "@mui/icons-material/BarChart";

import FoodModal from "../components/FoodModal"; // 🔥 Agregado: componente separado
import ChatAssistant from "../components/ChatAssistant"; // 🔥 Agregado: componente de chat IA

import { getStories, getFoodEntries, getDailyTotals, getWeeklyTotals, deleteFoodEntry } from "../api";
import { useQueryClient } from '@tanstack/react-query';
import { getStoryMediaType } from "../services/storyService";

function Home() {



  const [activeSection, setActiveSection] = React.useState("home");
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const createPostMutation = useCreatePost();

  const [file, setFile] = useState(null);

  const [postCaption, setPostCaption] = useState("");

  // 🔥 HISTORIAS
  const [stories, setStories] = useState([]);

  // 🔥 STORY VIEWER
  const [viewingStory, setViewingStory] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const storyTimerRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userStories, setUserStories] = useState([]);
  const [storyUsers, setStoryUsers] = useState([]);

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
  const creatingPostRef = useRef(false);
  const storyUploaderRef = useRef(null);

  const [dailyFoodEntries, setDailyFoodEntries] = useState([]);
  const [, setWeeklyCalories] = useState([]);
  const [foodModalOpen, setFoodModalOpen] = useState(false); // 🔥 Agregado de vuelta para el modal
  const [targetCalories] = useState(2000);
  const [targetProtein] = useState(150); // Objetivo de proteína en gramos
  const [todayTotal, setTodayTotal] = useState(0);
  const [todayProtein, setTodayProtein] = useState(0);
  const [todayCarbs, setTodayCarbs] = useState(0);
  const [todayFats, setTodayFats] = useState(0);
  const [todayFiber, setTodayFiber] = useState(0);
  const [todaySodium, setTodaySodium] = useState(0);
  const [loadingFood, setLoadingFood] = useState(false); // 🔥 Agregado: estado de carga para operaciones de comida
  // const [debouncedFoodText, setDebouncedFoodText] = useState("");

  // React.useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setDebouncedFoodText(foodText);
  //   }, 300);
  //   return () => clearTimeout(timer);
  // }, [foodText]);
const postPreviewUrl = useMemo(() => {
  if (typeof File === "undefined" || !(file instanceof File)) return null;
  return URL.createObjectURL(file);
}, [file]);

React.useEffect(() => {
  return () => {
    if (postPreviewUrl) {
      URL.revokeObjectURL(postPreviewUrl);
    }
  };
}, [postPreviewUrl]);

React.useEffect(() => {
  return () => {
    if (storyTimerRef.current) {
      clearInterval(storyTimerRef.current);
      storyTimerRef.current = null;
    }
  };
}, []);
React.useEffect(() => {
  setNewPostsAvailable(0);
}, [location.pathname]);

React.useEffect(() => {
  const shouldHideFloatingChat =
    activeSection !== "home" ||
    open ||
    openRight ||
    showAI ||
    showCreatePost ||
    showCreateStory ||
    viewingStory ||
    foodModalOpen;

  window.dispatchEvent(
    new CustomEvent("app:chat-visibility", {
      detail: { hidden: shouldHideFloatingChat },
    })
  );

  return () => {
    window.dispatchEvent(
      new CustomEvent("app:chat-visibility", {
        detail: { hidden: true },
      })
    );
  };
}, [
  activeSection,
  open,
  openRight,
  showAI,
  showCreatePost,
  showCreateStory,
  viewingStory,
  foodModalOpen,
]);

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
 }, [socket, connected, queryClient]);

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

// 🔥 Crear historia premium: cámara nativa directa + fullscreen pro
const handleStoryOptimisticInsert = useCallback((optimisticStory) => {
  if (!optimisticStory) return;

  setStories((prev) => {
    const currentStories = Array.isArray(prev) ? prev : [];
    return [
      optimisticStory,
      ...currentStories.filter((story) => String(story?.id) !== String(optimisticStory?.id)),
    ];
  });
}, []);

const handleStoryUploaded = useCallback((savedStory, optimisticId) => {
  setStories((prev) => {
    const currentStories = Array.isArray(prev) ? prev : [];
    const withoutOptimistic = currentStories.filter(
      (story) => String(story?.id) !== String(optimisticId)
    );

    if (!savedStory) {
      return withoutOptimistic;
    }

    return [
      savedStory,
      ...withoutOptimistic.filter((story) => String(story?.id) !== String(savedStory?.id)),
    ];
  });
}, []);

const handleStoryUploadError = useCallback((_error, optimisticId) => {
  if (!optimisticId) return;

  setStories((prev) =>
    (Array.isArray(prev) ? prev : []).filter(
      (story) => String(story?.id) !== String(optimisticId)
    )
  );
}, []);

const handleOpenStoryCreator = useCallback((options = {}) => {
  const { facingMode = "environment", proCamera = false } = options;
  setShowCreateStory(true);

  if (proCamera) {
    storyUploaderRef.current?.openProCamera?.(facingMode);
    return;
  }

  storyUploaderRef.current?.openNativeCapture?.(facingMode);
}, []);

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
const loadStories = useCallback(async () => {
  try {
    const response = await getStories();
    const safeStories = Array.isArray(response.data?.stories) ? response.data.stories : [];
    setStories(safeStories);
  } catch (error) {
    console.error("Error loading stories:", error.response?.data || error.message || error);
    setStories([]);
  }
}, []);

React.useEffect(() => {
  loadStories();
}, [loadStories]);

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
        const safeEntries = Array.isArray(entriesResponse.data?.entries)
          ? entriesResponse.data.entries
          : [];
        setDailyFoodEntries(safeEntries);
      } else {
        console.warn("Error cargando entradas:", entriesResponse.data.message);
        setDailyFoodEntries([]);
      }

      if (totalsResponse.data.success) {
        const totals = totalsResponse.data?.totals || {};
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
      }

      if (weeklyResponse.data.success) {
        setWeeklyCalories(Array.isArray(weeklyResponse.data?.week) ? weeklyResponse.data.week : []);
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
        setDailyFoodEntries(Array.isArray(entriesResponse.data?.entries) ? entriesResponse.data.entries : []);
      }

      if (totalsResponse.data.success) {
        const totals = totalsResponse.data?.totals || {};
        setTodayTotal(totals.total_calorias || 0);
        setTodayProtein(totals.total_proteina || 0);
        setTodayCarbs(totals.total_carbohidratos || 0);
        setTodayFats(totals.total_grasas || 0);
        setTodayFiber(totals.total_fibra || 0);
        setTodaySodium(totals.total_sodio || 0);
      }

      if (weeklyResponse.data.success) {
        setWeeklyCalories(Array.isArray(weeklyResponse.data?.week) ? weeklyResponse.data.week : []);
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

  // 🔥 STORY VIEWER FUNCTIONS
  const getStoryOwnerName = useCallback((story) => {
    return (
      story?.nombre ||
      story?.username ||
      story?.user?.nombre ||
      story?.user?.name ||
      story?.user?.username ||
      story?.author?.nombre ||
      story?.author?.username ||
      "Usuario"
    );
  }, []);

  const getStoryMediaUrl = useCallback((story) => {
    return (
      story?.video_url ||
      story?.video ||
      story?.videoUrl ||
      story?.image_url ||
      story?.image ||
      story?.media_url ||
      story?.mediaUrl ||
      story?.photo ||
      story?.story_url ||
      story?.url ||
      ""
    );
  }, []);

  const getStoryMediaKind = useCallback((story) => getStoryMediaType(story), []);

  const getStoryCaption = useCallback((story) => {
    return story?.caption || story?.texto || story?.description || story?.content || "";
  }, []);

const getStoryRingColor = (userName) => {
  const safeStories = Array.isArray(stories) ? stories : [];
  const userStoriesByName = safeStories.filter((s) => getStoryOwnerName(s) === userName);
  const isSeen = userStoriesByName.length > 0 && userStoriesByName.every((s) => Boolean(s?.visto || s?.seen));

  return isSeen
    ? "linear-gradient(90deg, #4a5058, #69707b)"
    : "linear-gradient(90deg, #00ff88, #00c6ff)";
};

  const openUserStories = (userName) => {
    const safeStories = Array.isArray(stories) ? stories : [];
    const userStoriesFiltered = safeStories.filter((s) => getStoryOwnerName(s) === userName);
    if (!userStoriesFiltered.length) return;

    const uniqueUsers = [...new Set(safeStories.map(getStoryOwnerName).filter(Boolean))];
    setStoryUsers(uniqueUsers);
    setCurrentUser(userName);
    setUserStories(userStoriesFiltered);
    setCurrentStoryIndex(0);
    setViewingStory(true);
    setStoryProgress(0);
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

  storyTimerRef.current = interval;
};

  const stopStoryTimer = () => {
    if (storyTimerRef.current) {
      clearInterval(storyTimerRef.current);
      storyTimerRef.current = null;
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
  const currentViewedStory = userStories[currentStoryIndex] || null;

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
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": { display: "none" },
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
            onOpenStories={() => handleOpenStoryCreator({ facingMode: "environment" })}
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
          handleOpenStoryCreator({ facingMode: "environment" });
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
              minWidth: 0,
              px: { xs: 0, md: 1 },
            }}
          >
            {activeSection === "home" && (
              <FeedCenterPremium
                isMobile={isMobile}
                stories={stories}
                currentUserName={user?.nombre || user?.username || user?.email?.split("@")[0] || ""}
                onCreateStory={handleOpenStoryCreator}
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
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": { display: "none" },
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
            {postPreviewUrl && (
              <Box
                component="img"
                src={postPreviewUrl}
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
                onClick={handleCreatePost}
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
      ref={storyUploaderRef}
      open={showCreateStory}
      user={user}
      preferredCamera="environment"
      onOptimisticStory={handleStoryOptimisticInsert}
      onStoryUploaded={handleStoryUploaded}
      onStoryUploadError={handleStoryUploadError}
      onRefreshStories={loadStories}
      onClose={() => setShowCreateStory(false)}
    />

    {viewingStory && currentViewedStory && (
      <Box sx={storyViewerOverlay}>
        <Box sx={storyViewerContainer}>
          <Box sx={progressContainer}>
            {userStories.map((story, index) => {
              const progress = index < currentStoryIndex ? 100 : index === currentStoryIndex ? storyProgress : 0;
              return (
                <Box
                  key={story?.id || `${currentUser}-${index}`}
                  sx={{
                    flex: 1,
                    height: 4,
                    bgcolor: "rgba(255,255,255,0.18)",
                    borderRadius: 999,
                    overflow: "hidden",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
                  }}
                >
                  <Box
                    sx={{
                      width: `${progress}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #ffffff 0%, #c4ffe8 100%)",
                      transition: "width 150ms linear",
                    }}
                  />
                </Box>
              );
            })}
          </Box>

          <Box sx={storyTopBar}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                component="img"
                src={
                  currentViewedStory?.avatar ||
                  currentViewedStory?.user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser || "Usuario")}&background=111827&color=00ff88`
                }
                alt={currentUser || "Usuario"}
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid rgba(255,255,255,0.82)",
                  boxShadow: "0 0 18px rgba(0,255,136,0.14)",
                }}
              />
              <Box>
                <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>
                  {currentUser || getStoryOwnerName(currentViewedStory)}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.72)", fontSize: 11.5 }}>
                  Historia activa
                </Typography>
              </Box>
            </Box>

            <IconButton
              onClick={closeStoryViewer}
              sx={{
                color: "#fff",
                bgcolor: "rgba(0,0,0,0.38)",
                border: "1px solid rgba(255,255,255,0.08)",
                '&:hover': { bgcolor: "rgba(0,0,0,0.52)" },
              }}
            >
              <Typography sx={{ color: "#fff", fontWeight: 700 }}>✕</Typography>
            </IconButton>
          </Box>

          <Box sx={storyImageContainer}>
            <Box sx={navLeft} onClick={prevStory} />
            <Box sx={navRight} onClick={nextStory} />

            <Box
              sx={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 26,
                width: 30,
                height: 30,
                borderRadius: "50%",
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                bgcolor: "rgba(0,0,0,0.28)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
                pointerEvents: "none",
              }}
            >
              ‹
            </Box>

            <Box
              sx={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 26,
                width: 30,
                height: 30,
                borderRadius: "50%",
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                bgcolor: "rgba(0,0,0,0.28)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
                pointerEvents: "none",
              }}
            >
              ›
            </Box>

            {getStoryMediaKind(currentViewedStory) === "video" ? (
              <Box
                component="video"
                src={getStoryMediaUrl(currentViewedStory) || ""}
                autoPlay
                controls
                muted
                playsInline
                sx={storyImage}
              />
            ) : (
              <Box
                component="img"
                src={getStoryMediaUrl(currentViewedStory) || "https://via.placeholder.com/900x1600?text=Historia"}
                alt={getStoryCaption(currentViewedStory) || "Historia"}
                sx={storyImage}
              />
            )}

            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.36) 0%, rgba(0,0,0,0.04) 28%, rgba(0,0,0,0.08) 58%, rgba(0,0,0,0.66) 100%)",
                pointerEvents: "none",
              }}
            />

            {getStoryCaption(currentViewedStory) && (
              <Box
                sx={{
                  position: "absolute",
                  left: 16,
                  right: 16,
                  bottom: 20,
                  zIndex: 20,
                  px: 1.6,
                  py: 1.15,
                  borderRadius: "16px",
                  background: "rgba(0,0,0,0.34)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(14px)",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.24)",
                }}
              >
                <Typography sx={storyBottomText}>
                  {getStoryCaption(currentViewedStory)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    )}

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
  background:
    "radial-gradient(circle at top, rgba(0,255,136,0.08) 0%, rgba(0,0,0,0.96) 48%, rgba(0,0,0,0.99) 100%)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1400,
  p: { xs: 0, sm: 2 }
};

const storyViewerContainer = {
  position: "relative",
  width: { xs: "100vw", sm: "min(430px, 92vw)" },
  height: { xs: "100vh", sm: "88vh" },
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  justifyContent: "stretch",
  overflow: "hidden",
  borderRadius: { xs: 0, sm: "28px" },
  border: { xs: "none", sm: "1px solid rgba(255,255,255,0.08)" },
  boxShadow: "0 30px 80px rgba(0,0,0,0.45), 0 0 40px rgba(0,255,136,0.06)",
  background: "#040404"
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
  backdropFilter: "blur(18px)",
  background: "linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.14) 100%)"
};

const storyBottomText = {
  position: "relative",
  color: "#fff",
  fontSize: 15,
  fontWeight: 600,
  lineHeight: 1.45,
  textShadow: "0 0 14px rgba(0,0,0,0.8)",
  overflowWrap: "break-word"
};

const progressContainer = {
  position: "absolute",
  top: 10,
  left: 10,
  right: 10,
  display: "flex",
  gap: 0.75,
  zIndex: 22,
  padding: "0 2px"
};

const storyImage = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  filter: "saturate(1.04) contrast(1.02)"
};

const storyImageContainer = {
  position: "relative",
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  background: "#050505"
};

const navLeft = {
  position: "absolute",
  left: 0,
  top: 0,
  width: "50%",
  height: "100%",
  cursor: "pointer",
  zIndex: 25
};

const navRight = {
  position: "absolute",
  right: 0,
  top: 0,
  width: "50%",
  height: "100%",
  cursor: "pointer",
  zIndex: 25
};

export default Home;