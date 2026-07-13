import { useQuery } from '@tanstack/react-query';
import { getProducts, getFeaturedProducts, getProduct, getCategories } from '../services/api';

export const useProducts = (params) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params).then((res) => res.data),
    keepPreviousData: true,
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => getFeaturedProducts().then((res) => res.data),
  });
};

export const useProduct = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id).then((res) => res.data),
    enabled: !!id,
  });
};

export const useCategories = (params) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => getCategories(params).then((res) => res.data),
  });
};
