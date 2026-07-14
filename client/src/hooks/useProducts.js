import { useQuery } from '@tanstack/react-query';
import { getProducts, getFeaturedProducts, getProduct, getCategories, deepParse } from '../services/api';

export const useProducts = (params) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params).then((res) => deepParse(res.data)),
    keepPreviousData: true,
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => getFeaturedProducts().then((res) => deepParse(res.data)),
  });
};

export const useProduct = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id).then((res) => deepParse(res.data)),
    enabled: !!id,
  });
};

export const useCategories = (params) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => getCategories(params).then((res) => deepParse(res.data)),
  });
};
