// =======================
// 🔹 IMPORTACIONES
// =======================
import React, { useContext, useState, useCallback, memo } from "react";
import { AuthContext } from "../context/AuthContext"; // contexto de usuario
import { useNavigate, useLocation } from "react-router-dom"; // navegación
import { motion } from "framer-motion"; // animaciones

// 🔹 Material UI
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
  Skeleton
} from "@mui/material";

// 🔹 Iconos
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MenuIcon from "@mui/icons-material/Menu";
import BarChartIcon from "@mui/icons-material/BarChart";

// 🔹 Componente externo
import ChatAssistant from "../components/ChatAssistant";

// 🔹 React Query + Axios
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";



// =======================
// 🔹 COMPONENTE PRINCIPAL
// =======================
function Home() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  // 🔹 Contexto de usuario
  const { logout, user } = useContext(AuthContext);

  // 🔹 Navegación
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Responsive
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // 🔹 React Query cache
  const queryClient = useQueryClient();

  // =======================
  // 🔹 ESTADOS
  // =======================
  const [open, setOpen] = useState(false); // sidebar izquierdo
  const [openRight, setOpenRight] = useState(false); // panel derecho
  const [showAI, setShowAI] = useState(false); // modal AI
  const [showCreatePost, setShowCreatePost] = useState(false);

  const [visiblePosts, setVisiblePosts] = useState(2); // (no usado)
  const [loading, setLoading] = useState(false); // (no usado)

  // =======================
  // 🔹 FETCH DE POSTS
  // =======================
  const fetchPosts = async ({ pageParam = 1 }) => {
    const { data } = await axios.get(
      `https://jsonplaceholder.typicode.com/photos?_limit=5&_page=${pageParam}`
    );

    return {
      data: data.map((item, i) => ({
        user: "User" + (i + pageParam * 5),
        image: item.url,
        caption: item.title,
        likes: Math.floor(Math.random() * 200),
        time: "Hace " + (i + 1) + "h"
      })),
      nextPage: pageParam + 1
    };
  };
  const handleCreatePost = async () => {
  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", caption);
    formData.append("user_id", user?.id);

    await axios.post("https://TU_BACKEND/api/posts", formData);

    // 🔥 refrescar feed
    queryClient.invalidateQueries(["feed"]);

    // cerrar modal
    setShowCreatePost(false);

    // limpiar
    setFile(null);
    setCaption("");

  } catch (error) {
    console.error(error);
  }
};

  // =======================
  // 🔹 INFINITE SCROLL (React Query)
  // =======================
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60 * 5
  });

  // =======================
  // 🔹 SCROLL DETECCIÓN
  // =======================
  let scrollTimeout = null;

  const handleScroll = useCallback((e) => {
    if (scrollTimeout) return;

    scrollTimeout = setTimeout(() => {
      scrollTimeout = null;

      const bottom =
        e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 50;

      // 🔥 Carga más posts
      if (bottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, 200);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // =======================
  // 🔹 MENÚ LATERAL
  // =======================
  const menuItems = [
    { label: "🏋️ Rutinas", path: "/" },
    { label: "📈 Progreso", path: "/progreso" },
    { label: "🔥 Calorías", path: "/calorias" },
    { label: "🎯 Objetivos", path: "/objetivos" },
    { label: "🤖 AI", action: () => setShowAI(true) },
   // { label: "➕ Crear", action: () => setShowCreatePost(true) }
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
  // 🔹 COMPONENTE POST
  // =======================
  const PostCard = memo(({ post }) => (
    <motion.div
      whileHover={{ scale: 1.01 }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <Card sx={postCard}>
        <CardContent>

          {/* 🔹 Header del post */}
          <Box sx={headerStyle}>
            <Box sx={avatarStyle} />
            <Box>
              <Typography sx={username}>{post.user}</Typography>
              <Typography sx={time}>{post.time}</Typography>
            </Box>
          </Box>

          {/* 🔹 Imagen */}
          <Box component="img" src={post.image} sx={imageStyle} />

          {/* 🔹 Acciones */}
          <Box sx={actionsStyle}>
            <IconButton>
              <FavoriteIcon sx={{ color: "#aaa" }} />
            </IconButton>
            <IconButton>
              <ChatBubbleOutlineIcon sx={{ color: "#aaa" }} />
            </IconButton>
          </Box>

          {/* 🔹 Texto */}
          <Typography sx={likes}>{post.likes} likes</Typography>
          <Typography sx={caption}>
            <b>{post.user}</b> {post.caption}
          </Typography>

        </CardContent>
      </Card>
    </motion.div>
  ));

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

  // =======================
  // 🔹 RENDER PRINCIPAL (UI)
  // =======================
  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#000" }}>

      {/* 🔹 Sidebar desktop */}
      {!isMobile && (
        <Box sx={{ width: 250 }}>
          <SidebarContent />
        </Box>
      )}

      {/* 🔹 Topbar móvil */}
      {isMobile && (
        <Box sx={topBar}>
          <IconButton onClick={() => setOpen(true)}>
            <MenuIcon />
          </IconButton>
        </Box>
      )}

      {/* 🔹 Drawer móvil */}
      <Drawer open={open} onClose={() => setOpen(false)}>
        <SidebarContent />
      </Drawer>

      {/* 🔹 FEED CENTRAL */}
      <Box onScroll={handleScroll} sx={{ flex: 1, overflowY: "auto" }}>
        <Box sx={{ maxWidth: 500, margin: "auto" }}>

          {/* 🔹 Stories */}
          <Box sx={storiesContainer}>
            {[1,2,3].map((_,i)=>(
              <Box key={i}>user{i}</Box>
            ))}
          </Box>

          {/* 🔹 POSTS */}
          {isLoading ? (
            <Skeleton height={300} />
          ) : (
            data.pages.map((page, i) =>
              page.data.map((post, j) => (
                <PostCard key={i + "-" + j} post={post} />
              ))
            )
          )}

        </Box>
      </Box>

      {/* 🔹 MODAL AI */}
      {showAI && (
        <Box sx={aiOverlay}>
          <Box sx={aiBox}>
            <Typography>GYM AI</Typography>
            <Button onClick={() => setShowAI(false)}>Cerrar</Button>
            <ChatAssistant />
          </Box>
        </Box>
      )}

      {/* 🔹 MODAL CREAR POST */}

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
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </Button>

              {/* CAPTION */}
              <input
                placeholder="¿Qué estás pensando?"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                style={inputPro}
              />

              {/* BOTONES */}
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button onClick={handleCreatePost} sx={postBtn}>
                  Publicar
                </Button>

                <Button onClick={() => setShowCreatePost(false)} sx={cancelBtn}>
                  Cancelar
                </Button>
              </Box>

            </Box>
          </motion.div>
        </Box>
      )}

    </Box>
  );
}



/* 🎨 STYLES */

const sidebarStyle = {
  width: 250,
  height: "100vh",
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
const caption = { color: "#ccc", mt: 1 };

const storiesContainer = {
  display: "flex",
  gap: 2,
  overflowX: "auto",
  mb: 2
};

const storyItem = { textAlign: "center" };

const storyCircle = {
  width: 60,
  height: 60,
  borderRadius: "50%",
  background: "linear-gradient(45deg,#00ff88,#00ccff)"
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

export default Home;