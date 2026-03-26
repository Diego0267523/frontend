import React, { useContext, useState, useCallback, memo } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

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

import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MenuIcon from "@mui/icons-material/Menu";
import BarChartIcon from "@mui/icons-material/BarChart";

import ChatAssistant from "../components/ChatAssistant";

// 🔥 NUEVO
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

function Home() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");

  const { logout, user } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const queryClient = useQueryClient(); // 🔥 PREFETCH

  const [open, setOpen] = useState(false);
  const [openRight, setOpenRight] = useState(false);
  
  const [showAI, setShowAI] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);


  // 🔥 FETCH PAGINADO REAL
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

  // 🔥 INFINITE QUERY
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

  // 🔥 THROTTLE + SCROLL REAL
  let scrollTimeout = null;

  const handleScroll = useCallback((e) => {
    if (scrollTimeout) return;

    scrollTimeout = setTimeout(() => {
      scrollTimeout = null;

      const bottom =
        e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 50;

      if (bottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage(); // 🔥 REAL
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

  // 🔥 PREFETCH (ejemplo)
  const prefetchProgreso = () => {
    queryClient.prefetchQuery({
      queryKey: ["progreso"],
      queryFn: async () => {
        const { data } = await axios.get("https://jsonplaceholder.typicode.com/posts?_limit=5");
        return data;
      }
    });
  };

  // 🔥 POST MEMOIZADO
  const PostCard = memo(({ post }) => (
    <motion.div
      whileHover={{ scale: 1.01 }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={postCard}>
        <CardContent>

          <Box sx={headerStyle}>
            <Box sx={avatarStyle} />
            <Box>
              <Typography sx={username}>{post.user}</Typography>
              <Typography sx={time}>{post.time}</Typography>
            </Box>
          </Box>

          <Box
            component="img"
            src={post.image}
            loading="lazy"
            sx={imageStyle}
          />

          <Box sx={actionsStyle}>
            <IconButton>
              <FavoriteIcon sx={{ color: "#aaa" }} />
            </IconButton>
            <IconButton>
              <ChatBubbleOutlineIcon sx={{ color: "#aaa" }} />
            </IconButton>
          </Box>

          <Typography sx={likes}>{post.likes} likes</Typography>
          <Typography sx={caption}>
            <b>{post.user}</b> {post.caption}
          </Typography>

        </CardContent>
      </Card>
    </motion.div>
  ));

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

  const SidebarContent = () => (
    <Box sx={sidebarStyle}>
      <motion.div whileHover={{ scale: 1.05 }}>
        <Box onClick={() => navigate("/profile")} sx={profileStyle}>
          <Box sx={avatarStyle} />
          <Typography sx={{ color: "#fff", fontWeight: "bold" }}>
            {user?.nombre || "Usuario"}
          </Typography>
        </Box>
      </motion.div>

      <Box sx={{ flex: 1 }}>
        {menuItems.map((item, i) => {
          const isActive = location.pathname === item.path;

          return (
            <motion.div key={i} whileHover={{ scale: 1.03 }}>
              <Box
                onMouseEnter={item.path === "/progreso" ? prefetchProgreso : undefined} // 🔥 PREFETCH
                onClick={() => {
                  if (item.path) navigate(item.path);
                  if (item.action) item.action();
                }}
                sx={{
                  ...menuItemStyle,
                  bgcolor: isActive ? "#00ff8820" : "#151515",
                  color: isActive ? "#00ff88" : "#ccc"
                }}
              >
                {item.label}
              </Box>
            </motion.div>
          );
        })}
      </Box>

      <Button onClick={logout} sx={logoutStyle} fullWidth>
        EXIT
      </Button>
    </Box>
  );

 return (
  <Box sx={{
    display: "flex",
    height: "100vh",
    bgcolor: "#000",
    overflow: "hidden"
  }}>

    {!isMobile && (
      <Box sx={{ width: 250, flexShrink: 0, overflowY: "auto" }}>
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
      overflowY: "auto"
    }}>
      <Box sx={{ width: "100%", maxWidth: 500, py: 2 }}>

        <Box sx={storiesContainer}>
          {[1,2,3,4,5].map((_,i) => (
            <motion.div key={i} whileHover={{ scale: 1.1 }}>
              <Box sx={storyItem}>
                <Box sx={storyCircle} />
                <Typography sx={{ color: "#aaa", fontSize: 12 }}>
                  user{i+1}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </Box>

        {/* 🔥 POSTS REALES */}
        {isLoading ? (
          <Skeleton variant="rectangular" height={300} />
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
      <Box sx={{ width: 300, flexShrink: 0, p: 2, overflowY: "auto" }}>
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