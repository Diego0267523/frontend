import { memo, useState, useContext } from "react";
import { Card, CardContent, Box, Typography, IconButton, TextField, Button, Collapse } from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";

import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import API_URL from "../config";
import { AuthContext } from "../context/AuthContext";

const PostCard = memo(({ post }) => {
  const { token } = useContext(AuthContext);
  const [liked, setLiked] = useState(post.liked || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");

  const getTimeAgo = (timeString) => {
    if (!timeString) return "Hace poco";
    
    const now = new Date();
    const postTime = new Date(timeString);
    const diffMs = now - postTime;
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMin < 2) return "Justo ahora";
    if (diffMin < 60) return `Hace ${diffMin} minutos`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffWeeks < 4) return `Hace ${diffWeeks} semanas`;
    if (diffMonths < 12) return `Hace ${diffMonths} meses`;
    return `Hace ${diffYears} años`;
  };

  const handleLike = async () => {
    if (!token) return;
    try {
      await axios.post(`${API_URL}/api/posts/${post.id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLiked(!liked);
      setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleAddComment = async () => {
    if (!token || !newComment.trim()) return;
    try {
      const response = await axios.post(`${API_URL}/api/posts/${post.id}/comments`, {
        comment: newComment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments([...comments, response.data.comment]); // Asumiendo que devuelve el comentario
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) {
      // Fetch comments if not loaded
      try {
        const response = await axios.get(`${API_URL}/api/posts/${post.id}/comments`);
        setComments(response.data.comments || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    }
    setShowComments(!showComments);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <Card sx={{ bgcolor: "#111", mb: 2, borderRadius: 4 }}>
        <CardContent>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "#00ff88" }} />
            <Box>
              <Typography sx={{ color: "#fff", fontWeight: "bold" }}>
                {post.nombre || post.user || "Usuario"}
              </Typography>
              <Typography sx={{ color: "#777", fontSize: 12 }}>
                {getTimeAgo(post.time)}
              </Typography>
            </Box>
          </Box>

          <Box component="img" src={post.image_url || post.image} sx={{
            width: "100%",
            height: 300,
            objectFit: "cover",
            borderRadius: 2,
            mt: 1
          }} />

          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <IconButton onClick={handleLike}>
              <FavoriteIcon sx={{ color: liked ? "#ff0000" : "#aaa" }} />
            </IconButton>
            <IconButton onClick={toggleComments}>
              <ChatBubbleOutlineIcon sx={{ color: "#aaa" }} />
            </IconButton>
          </Box>

          <Typography sx={{ color: "#fff", mt: 1 }}>
            {likesCount} likes
          </Typography>

          <Typography sx={{ color: "#ccc", mt: 1 }}>
            <b>{post.nombre || post.user || "Usuario"}</b> {post.caption}
          </Typography>

          <Collapse in={showComments}>
            <Box sx={{ mt: 2 }}>
              {comments.map((comment, i) => (
                <Typography key={i} sx={{ color: "#ccc", fontSize: 14, mb: 1 }}>
                  <b>{comment.user || "Usuario"}</b> {comment.comment}
                </Typography>
              ))}
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                <TextField
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Agregar comentario..."
                  size="small"
                  sx={{ flex: 1, input: { color: "#fff" }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#00ff88' } } }}
                />
                <Button onClick={handleAddComment} sx={{ bgcolor: "#00ff88", color: "#000" }}>
                  Enviar
                </Button>
              </Box>
            </Box>
          </Collapse>

        </CardContent>
      </Card>
    </motion.div>
  );
});

export default PostCard;