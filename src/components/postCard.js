import { memo, useState, useContext, useEffect } from "react";
import { Card, CardContent, Box, Typography, IconButton, TextField, Button, Collapse } from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";
import { useSocket } from "../context/SocketContext";

import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import API_URL from "../utils/config";
import { AuthContext } from "../context/AuthContext";

const PostCard = memo(({ post }) => {
  const { token } = useContext(AuthContext);
  const { socket, connected } = useSocket();
  const [liked, setLiked] = useState(post.liked || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);

  // 🔥 Actualizar estado cuando el post cambia (ej: infinite scroll)
  useEffect(() => {
    setLiked(post.liked || false);
    setLikesCount(post.likes || 0);
    setCommentsCount(post.commentsCount || 0);
  }, [post.id, post.liked, post.likes, post.commentsCount]);

  // Suscribirse al post room y eventos cuando cambia el post
  useEffect(() => {
    if (!socket || !post.id) return;

    const roomName = `post_${post.id}`;
    socket.emit("join_post", { postId: post.id });
    console.log(`PostCard: unido a ${roomName}`);

    const handleLikeUpdate = (data) => {
      if (data.postId !== post.id) return;
      setLikesCount(data.likes);
      if (typeof data.likedByCurrent === 'boolean') {
        setLiked(data.likedByCurrent);
      }
    };

    const handleCommentAdded = (data) => {
      if (data.postId !== post.id) return;
      setCommentsCount((prev) => prev + 1);
      setComments((prev) => [...prev, data.comment]);
    };

    socket.on("post_like_updated", handleLikeUpdate);
    socket.on("post_comment_added", handleCommentAdded);

    return () => {
      socket.emit("leave_post", { postId: post.id });
      socket.off("post_like_updated", handleLikeUpdate);
      socket.off("post_comment_added", handleCommentAdded);
    };
  }, [socket, post.id]);

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
    if (!token) {
      console.error("No token found");
      return;
    }

    setLoadingLike(true);

    if (socket && connected) {
      socket.emit("like_post", { postId: post.id });
      setLoadingLike(false);
      return;
    }

    try {
      console.log(`Intentando dar like a post ${post.id}`);
      const response = await axios.post(`${API_URL}/api/posts/${post.id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Response like:", response.data);

      if (response.data.success) {
        const newLikesCount = response.data.data.likes;
        const isLiked = response.data.data.action === 'liked';

        setLiked(isLiked);
        setLikesCount(newLikesCount);
        console.log(`Like actualizado: ${isLiked ? 'liked' : 'unliked'}, total: ${newLikesCount}`);
      }
    } catch (error) {
      console.error("Error liking post:", error.response?.data || error.message);
    } finally {
      setLoadingLike(false);
    }
  };

  const handleAddComment = async () => {
    if (!token || !newComment.trim()) {
      console.warn("No token o comentario vacío");
      return;
    }

    setLoadingComment(true);

    if (socket && connected) {
      socket.emit("comment_post", { postId: post.id, comment: newComment });
      setNewComment("");
      setLoadingComment(false);
      return;
    }

    try {
      console.log(`Agregando comentario a post ${post.id}: "${newComment}"`);
      const response = await axios.post(`${API_URL}/api/posts/${post.id}/comments`, {
        comment: newComment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Response comment:", response.data);

      if (response.data.success) {
        setComments([...comments, response.data.comment]);
        setCommentsCount((prev) => prev + 1);
        setNewComment("");
        console.log("Comentario agregado exitosamente");
      }
    } catch (error) {
      console.error("Error adding comment:", error.response?.data || error.message);
    } finally {
      setLoadingComment(false);
    }
  };

  const loadComments = async () => {
    if (comments.length > 0) {
      setShowComments(!showComments);
      return;
    }

    try {
      console.log(`Cargando comentarios del post ${post.id}`);
      const response = await axios.get(`${API_URL}/api/posts/${post.id}/comments`);
      
      console.log("Comments response:", response.data);
      
      if (response.data.success) {
        // Backend devuelve: { success: true, comments: [...] }
        const fetchedComments = response.data.comments || [];
        setComments(fetchedComments);
        setCommentsCount(fetchedComments.length);
        setShowComments(true);
        console.log(`${fetchedComments.length} comentarios cargados`);
      }
    } catch (error) {
      console.error("Error fetching comments:", error.response?.data || error.message);
      setShowComments(true); // Mostrar sección vacía aunque falle
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <Card sx={{ bgcolor: "#111", mb: 2, borderRadius: 4 }}>
        <CardContent>

          {/* Header - Usuario y Tiempo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box component="img"
              src={post.avatar || post.userAvatar || '/default-avatar.png'}
              alt="User avatar"
              sx={{ width: 40, height: 40, borderRadius: "50%", objectFit: 'cover', border: '2px solid #00ff88' }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ color: "#fff", fontWeight: "bold" }}>
                {post.nombre || post.user || "Usuario"}
              </Typography>
              <Typography sx={{ color: "#777", fontSize: 12 }}>
                {getTimeAgo(post.time)}
              </Typography>
            </Box>
          </Box>

          {/* Imagen */}
          <Box component="img" src={post.image_url || post.image} sx={{
            width: "100%",
            height: 300,
            objectFit: "cover",
            borderRadius: 2,
            mt: 1
          }} />

          {/* Pie de foto (caption) */}
          <Typography sx={{ color: "#ccc", mt: 1 }}>
            <b>{post.nombre || post.user || "Usuario"}</b> {post.caption}
          </Typography>

          {/* Contadores Likes / Comentarios (debajo del caption) */}
          <Typography sx={{ color: "#fff", mt: 1, fontWeight: "bold" }}>
            {likesCount} {likesCount === 1 ? "like" : "likes"} • {commentsCount} {commentsCount === 1 ? "comentario" : "comentarios"}
          </Typography>

          {/* Botones Like y Comentarios */}
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <IconButton onClick={handleLike} disabled={loadingLike}>
              <FavoriteIcon sx={{ color: liked ? "#ff0000" : "#aaa" }} />
            </IconButton>
            <IconButton onClick={loadComments}>
              <ChatBubbleOutlineIcon sx={{ color: "#aaa" }} />
            </IconButton>
          </Box>

          {/* Sección de Comentarios */}
          <Collapse in={showComments}>
            <Box sx={{ mt: 2, borderTop: "1px solid #333", pt: 2 }}>
              {/* Lista de comentarios */}
              {comments && comments.length > 0 ? (
                <Box sx={{ maxHeight: 200, overflowY: "auto", mb: 2 }}>
                  {comments.map((comment, i) => (
                    <Box key={i} sx={{ mb: 1.5 }}>
                      <Typography sx={{ color: "#ccc", fontSize: 14 }}>
                        <b>{comment.user || "Usuario"}</b> {comment.comment}
                      </Typography>
                      <Typography sx={{ color: "#777", fontSize: 12, mt: 0.5 }}>
                        {getTimeAgo(comment.time)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography sx={{ color: "#777", fontSize: 14, mb: 2 }}>
                  Sin comentarios aún
                </Typography>
              )}

              {/* Input para nuevo comentario */}
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                <TextField
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Agregar comentario..."
                  size="small"
                  disabled={loadingComment}
                  sx={{
                    flex: 1,
                    input: { color: "#fff", fontSize: 14 },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#00ff88' },
                      '&:hover fieldset': { borderColor: '#00ff88' },
                      '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                    }
                  }}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={loadingComment || !newComment.trim()}
                  sx={{
                    bgcolor: "#00ff88",
                    color: "#000",
                    fontWeight: "bold",
                    "&:hover": { bgcolor: "#00dd77" },
                    "&:disabled": { bgcolor: "#666", color: "#999" }
                  }}
                >
                  {loadingComment ? "..." : "Enviar"}
                </Button>
              </Box>
            </Box>
          </Collapse>

        </CardContent>
      </Card>
    </motion.div>
  );
});

PostCard.displayName = 'PostCard';
export default PostCard;