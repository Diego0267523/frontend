// =======================
// 🔹 IMPORTACIONES
// =======================
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

import ChatAssistant from "../components/ChatAssistant";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// =======================
// 🔹 COMPONENTE
// =======================
function Home() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");

  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  // =======================
  // 🔹 FETCH POSTS
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

      queryClient.invalidateQueries(["feed"]);
      setShowCreatePost(false);
      setFile(null);
      setCaption("");

    } catch (error) {
      console.error(error);
    }
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) => lastPage.nextPage
  });

  const handleScroll = useCallback((e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 50;

    if (bottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // =======================
  // 🔹 MENÚ
  // =======================
  const menuItems = [
    { label: "🏋️ Rutinas", path: "/" },
    { label: "📈 Progreso", path: "/progreso" },
    { label: "🔥 Calorías", path: "/calorias" },
    { label: "🎯 Objetivos", path: "/objetivos" },
    { label: "🤖 AI", action: () => setShowAI(true) },
    { label: "➕ Crear", action: () => setShowCreatePost(true) }
  ];

  // =======================
  // 🔹 POST
  // =======================
  const PostCard = memo(({ post }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
            sx={imageStyle}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/500x300";
            }}
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

          <Typography sx={captionStyle}>
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
      <Box onClick={() => navigate("/profile")} sx={profileStyle}>
        <Box sx={avatarStyle} />
        <Typography sx={{ color: "#fff" }}>
          {user?.nombre || "Usuario"}
        </Typography>
      </Box>

      <Box sx={{ flex: 1 }}>
        {menuItems.map((item, i) => (
          <Box
            key={i}
            onClick={() => {
              if (item.path) navigate(item.path);
              if (item.action) item.action();
            }}
            sx={menuItemStyle}
          >
            {item.label}
          </Box>
        ))}
      </Box>

      <Button onClick={logout} sx={logoutStyle}>
        EXIT
      </Button>
    </Box>
  );

  // =======================
  // 🔹 UI
  // =======================
  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#000" }}>

      {!isMobile && (
        <Box sx={{ width: 250, flexShrink: 0 }}>
          <SidebarContent />
        </Box>
      )}

      <Drawer open={open} onClose={() => setOpen(false)}>
        <SidebarContent />
      </Drawer>

      <Box onScroll={handleScroll} sx={{ flex: 1, overflowY: "auto" }}>
        <Box sx={{ maxWidth: 500, margin: "auto" }}>

          {/* 🔥 STORIES BONITAS */}
          <Box sx={storiesContainer}>
            {[1,2,3,4,5].map((_,i)=>(
              <Box key={i} sx={storyItem}>
                <Box sx={storyCircle} />
                <Typography sx={{ color: "#aaa", fontSize: 12 }}>
                  user{i+1}
                </Typography>
              </Box>
            ))}
          </Box>

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

      {showAI && (
        <Box sx={aiOverlay}>
          <Box sx={aiBox}>
            <Typography>GYM AI</Typography>
            <Button onClick={() => setShowAI(false)}>Cerrar</Button>
            <ChatAssistant />
          </Box>
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
  mb: 2
};

const storyItem = { textAlign: "center" };

const storyCircle = {
  width: 60,
  height: 60,
  borderRadius: "50%",
  background: "linear-gradient(45deg,#00ff88,#00ccff)"
};

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
  bgcolor: "#151515"
};

const logoutStyle = {
  mt: "auto",
  bgcolor: "#00ff88",
  color: "#000"
};

const aiOverlay = {
  position: "fixed",
  inset: 0,
  background: "#000",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const aiBox = { bgcolor: "#111", padding: 3 };

export default Home;