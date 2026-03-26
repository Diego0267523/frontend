import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/postCard';

const Feed = () => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePosts();

  if (isLoading) return <CircularProgress sx={{ color: '#00ff88' }} />;

  return (
    <Box sx={{ p: 2, bgcolor: '#000', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ color: '#fff', mb: 2 }}>Feed</Typography>
      {data?.pages && data.pages.map((page, i) =>
        page?.posts && Array.isArray(page.posts) && page.posts.map((post, j) => (
          <PostCard key={`${i}-${j}`} post={post} />
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