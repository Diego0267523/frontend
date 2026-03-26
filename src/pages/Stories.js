import React, { useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useStories } from '../hooks/useStories';

const Stories = () => {
  const { data: stories, isLoading } = useStories();
  const [seenUsers, setSeenUsers] = useState(new Set());

  const getRingColor = (userName) => seenUsers.has(userName) ? '#888' : '#00ff88';

  const openStories = (userName) => {
    // Similar logic as Home.js
    setSeenUsers(prev => new Set(prev).add(userName));
    // Open viewer
  };

  if (isLoading) return <CircularProgress sx={{ color: '#00ff88' }} />;

  const uniqueUsers = [...new Set(stories.map(s => s.nombre))];

  return (
    <Box sx={{ p: 2, bgcolor: '#000', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ color: '#fff', mb: 2 }}>Historias</Typography>
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
        {uniqueUsers.map((userName, i) => {
          const userStory = stories.find(s => s.nombre === userName);
          return (
            <Box
              key={i}
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                border: `3px solid ${getRingColor(userName)}`,
                padding: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              onClick={() => openStories(userName)}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundImage: `url(${userStory?.avatarUrl || userStory?.image_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default Stories;