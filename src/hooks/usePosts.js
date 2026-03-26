import { useInfiniteQuery } from '@tanstack/react-query';
import { getPosts } from '../api';

export const usePosts = () => {
  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = 1 }) => getPosts(pageParam, 10).then(res => {
      const { posts, page } = res.data;
      return {
        posts: posts || [],
        page,
        nextPage: posts && posts.length > 0 ? pageParam + 1 : undefined
      };
    }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60 * 5,
  });
};