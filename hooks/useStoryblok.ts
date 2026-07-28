import { useEffect, useState } from 'react';
import {
  fetchArticle,
  fetchArticles,
  fetchFaqList,
  fetchService,
  fetchServices,
  fetchStory,
  type ArticleContent,
  type BlogIndexContent,
  type FaqListContent,
  type ServiceStoryContent,
  type ServicesIndexContent,
  type StoryblokStory,
} from '../services/storyblokService';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

function useAsync<T>(load: () => Promise<T>, deps: ReadonlyArray<unknown>): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });
    load()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err : new Error(String(err)),
          });
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

export function useService(slug: string | undefined): AsyncState<StoryblokStory<ServiceStoryContent>> {
  const state = useAsync(
    () => (slug ? fetchService(slug) : Promise.reject(new Error('No slug'))),
    [slug],
  );
  if (!slug) return { data: null, loading: false, error: null };
  return state;
}

export function useServicesIndex(): AsyncState<StoryblokStory<ServicesIndexContent>> {
  return useAsync(() => fetchStory<ServicesIndexContent>('services'), []);
}

export function useServices(): AsyncState<StoryblokStory<ServiceStoryContent>[]> {
  return useAsync(() => fetchServices(), []);
}

export function useArticle(slug: string | undefined): AsyncState<StoryblokStory<ArticleContent>> {
  const state = useAsync(
    () => (slug ? fetchArticle(slug) : Promise.reject(new Error('No slug'))),
    [slug],
  );
  if (!slug) return { data: null, loading: false, error: null };
  return state;
}

export function useBlogIndex(): AsyncState<StoryblokStory<BlogIndexContent>> {
  return useAsync(() => fetchStory<BlogIndexContent>('blog'), []);
}

export function useArticles(): AsyncState<StoryblokStory<ArticleContent>[]> {
  return useAsync(() => fetchArticles(), []);
}

export function useFaqList(slug: string): AsyncState<StoryblokStory<FaqListContent>> {
  return useAsync(() => fetchFaqList(slug), [slug]);
}
