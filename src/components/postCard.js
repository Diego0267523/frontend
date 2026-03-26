import { memo } from "react";
import { Card, CardContent, Box, Typography, IconButton } from "@mui/material";
import { motion } from "framer-motion";

import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

const PostCard = memo(({ post }) => {
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
                {post.user}
              </Typography>
              <Typography sx={{ color: "#777", fontSize: 12 }}>
                {post.time}
              </Typography>
            </Box>
          </Box>

          <Box component="img" src={post.image} sx={{
            width: "100%",
            height: 300,
            objectFit: "cover",
            borderRadius: 2,
            mt: 1
          }} />

          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton>
              <FavoriteIcon sx={{ color: "#aaa" }} />
            </IconButton>
            <IconButton>
              <ChatBubbleOutlineIcon sx={{ color: "#aaa" }} />
            </IconButton>
          </Box>

          <Typography sx={{ color: "#fff" }}>
            {post.likes} likes
          </Typography>

          <Typography sx={{ color: "#ccc" }}>
            <b>{post.user}</b> {post.caption}
          </Typography>

        </CardContent>
      </Card>
    </motion.div>
  );
});

export default PostCard;