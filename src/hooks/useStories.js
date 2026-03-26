import { useQuery } from '@tanstack/react-query';
import { getStories } from '../api';

export const useStories = () => {
  return useQuery({
    queryKey: ['stories'],
    queryFn: () => getStories().then(res => res.data.stories || []),
    staleTime: 1000 * 60 * 5,
  });
};