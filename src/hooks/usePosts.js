import { useInfiniteQuery } from '@tanstack/react-query';
import { getPosts } from '../api';

export const usePosts = () => {
  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = 1 }) => getPosts(pageParam, 10).then(res => res.data),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60 * 5,
  });
};