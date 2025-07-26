import useSWR from 'swr';

type CarouselImage = {
  id: string;
  url: string;
  altText?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

export function useCarousel() {
  const { data, error, mutate } = useSWR<CarouselImage[]>('/api/carousel', (url: string) =>
    fetch(url).then((res) => res.json())
  );

  return {
    images: data || [],
    isLoading: !error && !data,
    error,
    mutate,
  };
} 