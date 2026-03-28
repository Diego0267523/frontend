import React, { useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/postCard';
import { useSocket } from '../context/SocketContext';
import { useQueryClient } from '@tanstack/react-query';

const Feed = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePosts();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handlePostDeleted = ({ postId }) => {
      queryClient.setQueryData(['posts'], (oldData) => {
        if (!oldData || !oldData.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            posts: Array.isArray(page.posts)
              ? page.posts.filter((post) => String(post.id) !== String(postId))
              : [],
          })),
        };
      });
    };

    socket.on('post_deleted', handlePostDeleted);

    return () => {
      socket.off('post_deleted', handlePostDeleted);
    };
  }, [socket, queryClient]);

  if (isLoading) return <CircularProgress sx={{ color: '#00ff88' }} />;

  return (
    <Box sx={{ p: 2, bgcolor: '#000', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ color: '#fff', mb: 2 }}>Feed</Typography>
      {data?.pages && data.pages.map((page, i) =>
        page?.posts && Array.isArray(page.posts) && page.posts.map((post) => (
          <PostCard key={post.id ?? `${i}-${Math.random()}`} post={post} />
        ))
      )}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </Box>
  );
};

export default Feed;