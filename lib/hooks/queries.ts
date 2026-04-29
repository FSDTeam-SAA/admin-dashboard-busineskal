import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  dashboardAPI,
  categoriesAPI,
  productsAPI,
  sellersAPI,
  buyersAPI,
  bannerAdsAPI,
  countriesAPI,
  subscriptionsAPI,
  PaginationParams,
} from '../api-client'

// Dashboard Queries
export const useOverviewQuery = () => {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: dashboardAPI.getOverview,
  })
}

export const useRevenueReportQuery = (period: 'day' | 'week' | 'month' | 'year') => {
  return useQuery({
    queryKey: ['dashboard', 'revenue', period],
    queryFn: () => dashboardAPI.getRevenueReport(period),
  })
}

export const useUserReportQuery = (period: 'day' | 'week' | 'month' | 'year') => {
  return useQuery({
    queryKey: ['dashboard', 'users', period],
    queryFn: () => dashboardAPI.getUserReport(period),
  })
}

// Categories Queries
export const useCategoriesQuery = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoriesAPI.list(params),
  })
}

export const useCategoryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: any }) =>
      id ? categoriesAPI.update(id, payload) : categoriesAPI.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category saved successfully')
    },
    onError: () => {
      toast.error('Failed to save category')
    },
  })
}

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoriesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete category')
    },
  })
}

// Products Queries
export const useProductsQuery = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsAPI.list(params),
  })
}

export const useRequestProductMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: any) => productsAPI.requestProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product request submitted')
    },
    onError: () => {
      toast.error('Failed to submit product request')
    },
  })
}

export const useApproveProductMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productsAPI.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product approved')
    },
    onError: () => {
      toast.error('Failed to approve product')
    },
  })
}

// Sellers Queries
export const useSellersQuery = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['sellers', params],
    queryFn: () => sellersAPI.list(params),
  })
}

export const useSellerRequestsQuery = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['seller-requests', params],
    queryFn: () => sellersAPI.getRequests(params),
  })
}

export const useApproveSellerMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => sellersAPI.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-requests', 'sellers'] })
      toast.success('Seller approved')
    },
    onError: () => {
      toast.error('Failed to approve seller')
    },
  })
}

export const useRejectSellerMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => sellersAPI.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-requests', 'sellers'] })
      toast.success('Seller rejected')
    },
    onError: () => {
      toast.error('Failed to reject seller')
    },
  })
}

// Buyers Queries
export const useBuyersQuery = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['buyers', params],
    queryFn: () => buyersAPI.list(params),
  })
}

// Banner Ads Queries
export const useBannerAdsQuery = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['banner-ads', params],
    queryFn: () => bannerAdsAPI.list(params),
  })
}

export const useUploadBannerMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => bannerAdsAPI.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banner-ads'] })
      toast.success('Banner uploaded successfully')
    },
    onError: () => {
      toast.error('Failed to upload banner')
    },
  })
}

export const useDeleteBannerMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bannerAdsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banner-ads'] })
      toast.success('Banner deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete banner')
    },
  })
}

// Countries Queries
export const useCountriesQuery = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['countries', params],
    queryFn: () => countriesAPI.list(params),
  })
}

export const useCountryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: FormData }) =>
      id ? countriesAPI.update(id, payload) : countriesAPI.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] })
      toast.success('Country saved successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to save country')
    },
  })
}

export const useDeleteCountryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => countriesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] })
      toast.success('Country deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete country')
    },
  })
}

// Subscriptions Queries
export const useSubscriptionsQuery = () => {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: subscriptionsAPI.list,
  })
}

export const useSubscriptionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: any }) =>
      id ? subscriptionsAPI.update(id, payload) : subscriptionsAPI.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      toast.success('Subscription saved successfully')
    },
    onError: () => {
      toast.error('Failed to save subscription')
    },
  })
}

export const useDeleteSubscriptionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => subscriptionsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      toast.success('Subscription deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete subscription')
    },
  })
}
