import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

// Hook para obtener posts (infinite scroll)
export function usePosts() {
  return useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get(`/api/posts?page=${pageParam}`);
      return {
        posts: response.data.posts || [],
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
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previous = queryClient.getQueryData(["posts"]);

      queryClient.setQueryData(["posts"], (oldData) => {
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

      return { previous };
    },
    onError: (error, _postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["posts"], context.previous);
      }
      console.error("Error deleting post:", error.response?.data || error.message);
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
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
    onMutate: async (formData) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["feed"] });

      const previousPosts = queryClient.getQueryData(["posts"]);
      const previousFeed = queryClient.getQueryData(["feed"]);

      const tempPost = {
        id: `temp-${Date.now()}`,
        user_id: null,
        image_url: URL.createObjectURL(formData.get('image')),
        caption: formData.get('caption'),
        time: new Date().toISOString(),
        nombre: 'Tu publicación',
        avatar: null,
        likes: 0,
        commentsCount: 0,
        liked: 0,
        isDraft: true,
      };

      queryClient.setQueryData(["posts"], (old) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page, index) => {
            if (index !== 0) return page;
            return { ...page, posts: [tempPost, ...(page.posts || [])] };
          }),
        };
      });

      queryClient.setQueryData(["feed"], (old) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page, index) => {
            if (index !== 0) return page;
            return { ...page, data: [tempPost, ...(page.data || [])] };
          }),
        };
      });

      return { previousPosts, previousFeed, tempPostId: tempPost.id };
    },
    onSuccess: (data, _variables, context) => {
      if (data?.post) {
        queryClient.setQueryData(["posts"], (old) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: (page.posts || []).map((post) =>
                post.id === context?.tempPostId ? data.post : post
              ),
            })),
          };
        });

        queryClient.setQueryData(["feed"], (old) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: (page.data || []).map((p) =>
                p.id === context?.tempPostId ? data.post : p
              ),
            })),
          };
        });
      }

      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (error, _vars, context) => {
      console.error("Error creating post:", error.response?.data || error.message);
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      if (context?.previousFeed) {
        queryClient.setQueryData(["feed"], context.previousFeed);
      }
    },
  });
}