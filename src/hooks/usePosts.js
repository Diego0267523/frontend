import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

// Hook para obtener posts (infinite scroll)
export function usePosts() {
  return useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get(`/api/posts?page=${pageParam}`);
      return {
        data: response.data.posts || [],
        nextPage: response.data.posts?.length > 0 ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });
}

// Hook para eliminar post
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId) => {
      const response = await api.delete(`/api/posts/${postId}`);
      return response.data;
    },
    onSuccess: (data, postId) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      // Optimistic update: remover del cache
      queryClient.setQueryData(["posts"], (oldData) => {
        if (!oldData || !oldData.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: page.data.filter((post) => String(post.id) !== String(postId)),
          })),
        };
      });
    },
    onError: (error) => {
      console.error("Error deleting post:", error.response?.data || error.message);
    },
  });
}

// Hook para crear post
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const response = await api.post("/api/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (error) => {
      console.error("Error creating post:", error.response?.data || error.message);
    },
  });
}