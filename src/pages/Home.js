
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import React, { useContext, useState, useCallback, useRef } from "react";
import PostCard from "../components/postCard";


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
  Alert
} from "@mui/material";

import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MenuIcon from "@mui/icons-material/Menu";
import BarChartIcon from "@mui/icons-material/BarChart";
import CloseIcon from "@mui/icons-material/Close";

import ChatAssistant from "../components/ChatAssistant";

// 🔥 NUEVO
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import API_URL from "../config";

function Home() {
  const { user, logout } = useContext(AuthContext);

  const [file, setFile] = useState(null);
  const [postCaption, setPostCaption] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // 🔥 HISTORIAS
  const [storyFile, setStoryFile] = useState(null);
  const [showStoryPreview, setShowStoryPreview] = useState(false);
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

  // 🔹 Evitar múltiples clics
  if (isPosting) return;
  setIsPosting(true);

  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", postCaption);

    // 🔹 1️⃣ Crear post en backend
    await axios.post(`${API_URL}/api/posts`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    // 🔹 2️⃣ Actualizar feed instantáneo (optimistic update)
    queryClient.setQueryData(["feed"], (oldData) => {
      if (!oldData) return oldData;

      const newPost = {
        nombre: user?.nombre || "Usuario",
        image_url: URL.createObjectURL(file),
        caption: postCaption,
        likes: 0,
        time: "Ahora"
      };

      return {
        ...oldData,
        pages: [
          {
            ...oldData.pages[0],
            data: [newPost, ...oldData.pages[0].data]
          },
          ...oldData.pages.slice(1)
        ]
      };
    });

    // 🔹 3️⃣ Refrescar feed desde backend para tener datos reales
    queryClient.invalidateQueries({ queryKey: ["feed"] });

    // ✅ NOTIFICACIÓN DE ÉXITO
    setSnackbar({ open: true, message: "¡Post publicado exitosamente!", severity: "success" });

    // 🔹 4️⃣ Cerrar modal y limpiar después de 800ms
    setTimeout(() => {
      setShowCreatePost(false);
      setFile(null);
      setPostCaption("");
      setIsPosting(false);
    }, 800);

  } catch (error) {
    console.error(error);
    // ❌ NOTIFICACIÓN DE ERROR
    setSnackbar({ open: true, message: "Error al publicar el post. Inténtalo de nuevo.", severity: "error" });
    setIsPosting(false);
  }
};


  // 🔥 HISTORIAS - Cargar historias al montar
  React.useEffect(() => {
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
    loadStories();
  }, []);

  // 🔥 HISTORIAS - Subir historia
  const handleUploadStory = async () => {
    if (!storyFile) {
      setSnackbar({ open: true, message: "Selecciona una imagen para tu historia", severity: "error" });
      return;
    }

    setIsUploadingStory(true);
    try {
      const formData = new FormData();
      formData.append("image", storyFile);

      const response = await axios.post(`${API_URL}/api/stories`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.data.success) {
        // Recargar historias
        const storiesResponse = await axios.get(`${API_URL}/api/stories`);
        if (storiesResponse.data.success) {
          setStories(storiesResponse.data.stories || []);
        }

        setSnackbar({ open: true, message: "¡Historia publicada!", severity: "success" });
        setTimeout(() => {
          setShowStoryPreview(false);
          setStoryFile(null);
          setIsUploadingStory(false);
        }, 800);
      }
    } catch (error) {
      console.error("Error uploading story:", error);
      setSnackbar({ open: true, message: "Error al publicar la historia", severity: "error" });
      setIsUploadingStory(false);
    }
  };

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
    if (seenStoryUsers.has(userName)) {
      return "#888"; // visto = gris
    }
    return "#00ff88"; // nuevo = verde
  };

  const openUserStories = (userName) => {
    const userStoriesFiltered = stories.filter(s => s.nombre === userName);
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
    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + 1; // 15 seconds total (150ms * 100)
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

  // 🔥 FETCH POSTS (AQUÍ VA)
const fetchPosts = async ({ pageParam = 1 }) => {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(`${API_URL}/api/posts?page=${pageParam}`, { headers });
    console.log("Response data:", response.data); // 🔥 DEBUG
    const { posts } = response.data; // Backend devuelve { success: true, posts: [...] }
    return {
      data: posts || [],
      nextPage: posts && posts.length > 0 ? pageParam + 1 : undefined
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error; // Re-throw para que React Query maneje el error
  }
};
  const [showRetry, setShowRetry] = useState(false);

  // 🔥 INFINITE QUERY
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60 * 5,
    retry: false, // No auto-retry para control manual
    onError: () => setShowRetry(true)
  });

  // 🔥 TIMEOUT PARA MOSTRAR RETRY DESPUÉS DE 3s
  React.useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        if (!data?.pages?.some(p => p.data?.length > 0)) {
          setShowRetry(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowRetry(false);
    }
  }, [isLoading, data]);

    // =======================
  // 🔹 SCROLL DETECCIÓN
  // =======================
 const scrollTimeout = useRef(null);

const handleScroll = useCallback((e) => {
  if (scrollTimeout.current) return;

  scrollTimeout.current = setTimeout(() => {
    scrollTimeout.current = null;

    const bottom =
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 50;

    if (bottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, 200);
}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const menuItems = [
    { label: "🏋️ Rutinas", path: "/" },
    { label: "📈 Progreso", path: "/progreso" },
    { label: "🔥 Calorías", path: "/calorias" },
    { label: "🎯 Objetivos", path: "/objetivos" },
    { label: "🤖 AI", action: () => setShowAI(true) },
    { label: "➕ Crear", action: () => setShowCreatePost(true) }
  ];

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
   const SidebarContent = () => (
     <Box sx={sidebarStyle}>
 
       {/* 🔹 Perfil */}
       <Box onClick={() => navigate("/profile")} sx={profileStyle}>
         <Box sx={avatarStyle} />
         <Typography sx={{ color: "#fff" }}>
           {user?.nombre || "Usuario"}
         </Typography>
       </Box>
 
       {/* 🔹 Menú */}
       <Box sx={{ flex: 1 }}>
         {menuItems.map((item, i) => {
           const isActive = location.pathname === item.path;
 
           return (
             <Box
               key={i}
               onMouseEnter={item.path === "/progreso" ? prefetchProgreso : undefined}
               onClick={() => {
                 if (item.path) navigate(item.path);
                 if (item.action) item.action();
               }}
               sx={{
                 ...menuItemStyle,
                 bgcolor: isActive ? "#00ff8820" : "#151515"
               }}
             >
               {item.label}
             </Box>
           );
         })}
       </Box>
 
       {/* 🔹 Logout */}
       <Button onClick={logout} sx={logoutStyle}>
         EXIT
       </Button>
     </Box>
   );

  const hasPosts = data?.pages?.some((page) => Array.isArray(page.data) && page.data.length > 0);

 return (
  <Box sx={{
    display: "flex",
    height: "100vh",
    bgcolor: "#000",
    overflow: "hidden"
  }}>

    {!isMobile && (
      <Box sx={{ width: 250, flexShrink: 0, overflowY: "auto", '&::-webkit-scrollbar': { display: 'none' } }}>
        <SidebarContent />
      </Box>
    )}

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

    <Drawer open={open} onClose={() => setOpen(false)}>
      <SidebarContent />
    </Drawer>

    <Drawer
      anchor="right"
      open={openRight}
      onClose={() => setOpenRight(false)}
      PaperProps={{ sx: { bgcolor: "#0b0b0b", width: 300 } }}
    >
      <Box sx={{ p: 2 }}>
        <Card sx={postCard}>
          <CardContent>
            <Typography sx={titleStyle}>📊 Calorías semana</Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              {[40,60,80,50,70,90,65].map((v,i)=>(
                <Box key={i} sx={{ width: 10, height: v, bgcolor: "#00ff88", borderRadius: 2 }} />
              ))}
            </Box>
          </CardContent>
        </Card>

        {["🔥 Calorías", "🥩 Proteína", "💧 Agua"].map((item, i) => (
          <Card key={i} sx={postCard}>
            <CardContent>
              <Typography sx={titleStyle}>{item}</Typography>
              <LinearProgress variant="determinate" value={60} sx={progressStyle} />
            </CardContent>
          </Card>
        ))}
      </Box>
    </Drawer>

    <Box onScroll={handleScroll} sx={{
      flex: 1,
      display: "flex",
      justifyContent: "center",
      overflowY: "auto",
      '&::-webkit-scrollbar': { display: 'none' }
    }}>
      <Box sx={{ width: "100%", maxWidth: 500, py: 2 }}>

        <Box sx={storiesContainer}>
          {/* Tu historia (solo en móviles) */}
          {isMobile && (
            <motion.div whileHover={{ scale: 1.1 }} onClick={() => setShowStoryPreview(true)}>
              <Box sx={storyItem}>
                <Box sx={storyCircle}>
                  <Box sx={storyInner}>
                    <Typography sx={{ color: "#000", fontSize: 28, fontWeight: "bold" }}>+</Typography>
                  </Box>
                </Box>
                <Typography sx={{ color: "#aaa", fontSize: 12, textAlign: "center" }}>
                  Tu historia
                </Typography>
              </Box>
            </motion.div>
          )}

          {/* Historias de otros usuarios */}
          {stories && [...new Set(stories.map(s => s.nombre))].map((userName, i) => {
            const userStory = stories.find(s => s.nombre === userName);
            const profileImage = userStory?.profile_image || userStory?.avatar || userStory?.image_url;
            const ringColor = getStoryRingColor(userName);
            return (
              <motion.div key={i} whileHover={{ scale: 1.1 }}>
                <Box sx={storyItem} onClick={() => openUserStories(userName)}>
                  <Box sx={{ ...storyCircle, border: `3px solid ${ringColor}` }}>
                    <Box 
                      sx={{ 
                        ...storyInner, 
                        backgroundImage: `url(${profileImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                      }} 
                    />
                  </Box>
                  <Typography sx={{ color: "#aaa", fontSize: 12, textAlign: "center" }}>
                    {userName}
                  </Typography>
                </Box>
              </motion.div>
            );
          })}
        </Box>

        {/* 🔥 POSTS REALES */}
        {isLoading ? (
          <>
            <Skeleton variant="rectangular" height={300} sx={{ bgcolor: "#111", mb: 2 }} />
            <Skeleton variant="rectangular" height={300} sx={{ bgcolor: "#111", mb: 2 }} />
            <Skeleton variant="rectangular" height={300} sx={{ bgcolor: "#111", mb: 2 }} />
          </>
        ) : !hasPosts ? (
          <Card sx={postCard}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography sx={{ color: "#fff", mb: 2 }}>No hay posts disponibles aún.</Typography>
              {showRetry && (
                <Button
                  onClick={() => {
                    setShowRetry(false);
                    queryClient.invalidateQueries({ queryKey: ["feed"] });
                  }}
                  sx={{ bgcolor: "#00ff88", color: "#000", fontWeight: "bold" }}
                >
                  Intentar otra vez
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          data.pages.map((page, i) =>
            page.data.map((post, j) => (
              <PostCard key={i + "-" + j} post={post} />
            ))
          )
        )}

        {isFetchingNextPage && (
          <Card sx={postCard}>
            <CardContent>
              <Skeleton variant="rectangular" height={300} />
            </CardContent>
          </Card>
        )}

      </Box>
    </Box>

    {!isMobile && (
      <Box sx={{ width: 300, flexShrink: 0, p: 2, overflowY: "auto", '&::-webkit-scrollbar': { display: 'none' } }}>
        <Card sx={postCard}>
          <CardContent>
            <Typography sx={titleStyle}>📊 Calorías semana</Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              {[40,60,80,50,70,90,65].map((v,i)=>(
                <Box key={i} sx={{ width: 10, height: v, bgcolor: "#00ff88", borderRadius: 2 }} />
              ))}
            </Box>
          </CardContent>
        </Card>

        {["🔥 Calorías", "🥩 Proteína", "💧 Agua"].map((item, i) => (
          <Card key={i} sx={postCard}>
            <CardContent>
              <Typography sx={titleStyle}>{item}</Typography>
              <LinearProgress variant="determinate" value={60} sx={progressStyle} />
            </CardContent>
          </Card>
        ))}
      </Box>
    )}

    {showAI && (
      <Box sx={aiOverlay}>
        <Box sx={aiBox}>
          <Typography sx={titleStyle}>GYM AI</Typography>
          <Button onClick={() => setShowAI(false)}>Cerrar</Button>
          <ChatAssistant />
        </Box>
      </Box>
    )}

          {showCreatePost && (
            <Box sx={overlayPro} onClick={() => setShowCreatePost(false)}>
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={modalPro} onClick={(e) => e.stopPropagation()}>
    
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
                      onChange={(e) => setFile(e.target.files[0])}
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
                      sx={postBtn}
                      disabled={isPosting}
                    >
                      {isPosting ? "Publicando..." : "Publicar"}
                    </Button>
    
                    <Button 
                      onClick={() => setShowCreatePost(false)} 
                      sx={cancelBtn}
                      disabled={isPosting}
                    >
                      Cancelar
                    </Button>
                  </Box>
    
                </Box>
              </motion.div>
            </Box>
          )}

          {/* 🔥 MODAL PARA SUBIR HISTORIA */}
          {showStoryPreview && (
            <Box sx={overlayPro} onClick={() => setShowStoryPreview(false)}>
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={modalPro} onClick={(e) => e.stopPropagation()}>
    
                  <Typography sx={titlePro}>
                    Nueva Historia 📸
                  </Typography>
    
                  {/* PREVIEW */}
                  {storyFile && (
                    <Box
                      component="img"
                      src={URL.createObjectURL(storyFile)}
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
                      onChange={(e) => setStoryFile(e.target.files[0])}
                    />
                  </Button>
    
                  {/* BOTONES */}
                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <Button 
                      onClick={handleUploadStory} 
                      sx={postBtn}
                      disabled={isUploadingStory}
                    >
                      {isUploadingStory ? "Subiendo..." : "Compartir Historia"}
                    </Button>
    
                    <Button 
                      onClick={() => setShowStoryPreview(false)} 
                      sx={cancelBtn}
                      disabled={isUploadingStory}
                    >
                      Cancelar
                    </Button>
                  </Box>
    
                </Box>
              </motion.div>
            </Box>
          )}

          {/* 🔥 STORY VIEWER MODAL */}
          <AnimatePresence>
            {viewingStory && userStories.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={storyViewerOverlay} onClick={closeStoryViewer}>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Box sx={storyViewerContainer}>
                      {/* Top bar (user + time) */}
                      <Box sx={storyTopBar}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              backgroundImage: `url(${userStories[currentStoryIndex]?.profile_image || userStories[currentStoryIndex]?.avatar || userStories[currentStoryIndex]?.image_url})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              border: "2px solid #fff"
                            }}
                          />
                          <Box>
                            <Typography sx={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                              {currentUser}
                            </Typography>
                            <Typography sx={{ color: "#ccc", fontSize: 12 }}>
                              22h
                            </Typography>
                          </Box>
                        </Box>

                        <IconButton onClick={closeStoryViewer} sx={{ color: "#fff" }}>
                          <CloseIcon />
                        </IconButton>
                      </Box>

                      {/* Progress Bars */}
                      <Box sx={progressContainer}>
                        {userStories.map((_, i) => (
                          <LinearProgress
                            key={i}
                            variant="determinate"
                            value={i < currentStoryIndex ? 100 : i === currentStoryIndex ? storyProgress : 0}
                            sx={progressBar}
                          />
                        ))}
                      </Box>

                      {/* Story Image with Navigation */}
                      <Box sx={storyImageContainer}>
                        <AnimatePresence mode="wait">
                          <motion.img
                            key={currentStoryIndex}
                            src={userStories[currentStoryIndex]?.image_url}
                            alt={currentUser}
                            style={storyImage}
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onMouseEnter={stopStoryTimer}
                            onMouseLeave={startStoryTimer}
                          />
                        </AnimatePresence>

                        {/* Navigation Areas */}
                        <Box sx={navLeft} onClick={prevStory} />
                        <Box sx={navRight} onClick={nextStory} />

                        {/* Bottom text overlay */}
                        <Box sx={storyBottomText}>
                          {userStories[currentStoryIndex]?.caption || "Escribe algo interesante..."}
                        </Box>

                        {/* Action bar */}
                        <Box sx={storyActionBar}>
                          <Button sx={{ color: "#fff" }} startIcon={<ChatBubbleOutlineIcon />}>
                            Enviar mensaje
                          </Button>
                          <IconButton sx={{ color: "#fff" }}>
                            <FavoriteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </motion.div>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 🔥 SNACKBAR PARA NOTIFICACIONES */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>

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
  background: "linear-gradient(45deg,#00ff88,#00ccff)",
  padding: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const storyInner = {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  background: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden"
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
  bgcolor: "#00ff88"
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
  zIndex: 10
};

const aiOverlay = {
  position: "fixed",
  inset: 0,
  background: "#000",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

// 🔥 MODAL CREAR POST (ESTILO PRO)

const overlayPro = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.85)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999
};

const modalPro = {
  width: 350,
  bgcolor: "#111",
  borderRadius: 4,
  p: 3,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  boxShadow: "0 0 30px #00ff8840"
};

const titlePro = {
  color: "#00ff88",
  fontWeight: "bold",
  mb: 2,
  fontSize: 20
};

const previewImage = {
  width: "100%",
  height: 200,
  objectFit: "cover",
  borderRadius: 10,
  marginBottom: 10
};

const uploadBtn = {
  bgcolor: "#00ff88",
  color: "#000",
  fontWeight: "bold",
  mt: 1,
  '&:hover': {
    bgcolor: "#00cc6a"
  }
};

const inputPro = {
  width: "100%",
  marginTop: "10px",
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  outline: "none",
  background: "#222",
  color: "#fff"
};

const postBtn = {
  bgcolor: "#00ff88",
  color: "#000",
  fontWeight: "bold",
  flex: 1,
  '&:hover': {
    bgcolor: "#00cc6a"
  }
};

const cancelBtn = {
  bgcolor: "#222",
  color: "#fff",
  flex: 1
};

const aiBox = { bgcolor: "#111", padding: 3 };

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