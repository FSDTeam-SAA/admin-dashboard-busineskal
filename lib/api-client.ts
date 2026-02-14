import axiosInstance from './axios'

export interface PaginationParams {
  page: number
  limit: number
  search?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

type ListResponse<T> = {
  data: T[]
  total: number
}

// Dashboard APIs
export const dashboardAPI = {
  getOverview: async () => {
    const { data } = await axiosInstance.get('/admin/dashboard/overview')
    return {
      totalRevenue: data?.data?.overview?.totalRevenue ?? 0,
      totalSellers: data?.data?.overview?.totalSeller ?? 0,
      totalUsers: data?.data?.overview?.totalUser ?? 0,
    }
  },

  getRevenueReport: async (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
    const { data } = await axiosInstance.get('/admin/dashboard/overview', {
      params: { period },
    })
    return data?.data?.revenueReport
  },

  getUserReport: async (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
    const { data } = await axiosInstance.get('/admin/dashboard/overview', {
      params: { period },
    })
    return data?.data?.joiningReport
  },
}

// Categories APIs
export const categoriesAPI = {
  list: async (params: PaginationParams): Promise<ListResponse<any>> => {
    const { data } = await axiosInstance.get('/category', { params })
    const items = (data?.data ?? data ?? []).map((category: any) => ({
      id: category._id,
      name: category.name,
      date: category.createdAt,
      raw: category,
    }))
    return { data: items, total: items.length }
  },

  create: async (payload: any) => {
    const isFormData = payload instanceof FormData
    const { data } = await axiosInstance.post('/category/add', payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    })
    return data?.data ?? data
  },

  update: async (id: string, payload: any) => {
    const isFormData = payload instanceof FormData
    const { data } = await axiosInstance.put(`/category/${id}`, payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    })
    return data?.data ?? data
  },

  delete: async (id: string) => {
    const { data } = await axiosInstance.delete(`/category/${id}`)
    return data?.data ?? data
  },
}

// Products APIs
export const productsAPI = {
  list: async (params: PaginationParams): Promise<ListResponse<any>> => {
    const { data } = await axiosInstance.get('/product', { params })
    const payload = data?.data ?? data ?? {}
    const items = (payload.products ?? payload ?? []).map((product: any) => ({
      id: product._id,
      name: product.title,
      productId: product.sku ?? product._id,
      price: product.price,
      quantity: product.stock,
      date: product.createdAt,
      image: product.thumbnail ?? product.photos?.[0]?.url,
      raw: product,
    }))
    const total =
      payload.pagination?.total ??
      data?.pagination?.total ??
      items.length
    return { data: items, total }
  },

  requestProduct: async (payload: any) => {
    const { data } = await axiosInstance.post('/product/add', payload)
    return data?.data ?? data
  },

  approve: async (id: string) => {
    const { data } = await axiosInstance.patch(`/product/${id}/verify`, {
      verified: true,
    })
    return data?.data ?? data
  },

  reject: async (id: string) => {
    const { data } = await axiosInstance.patch(`/product/${id}/verify`, {
      verified: false,
    })
    return data?.data ?? data
  },
}

// Sellers APIs
export const sellersAPI = {
  list: async (params: PaginationParams): Promise<ListResponse<any>> => {
    const { data } = await axiosInstance.get('/user/sellers', { params })
    const items = (data?.data ?? data ?? []).map((seller: any) => ({
      id: seller._id,
      name: seller.name,
      avatar: seller.avatar?.url,
      email: seller.email,
      raw: seller,
    }))
    return { data: items, total: items.length }
  },

  getRequests: async (params: PaginationParams): Promise<ListResponse<any>> => {
    const { data } = await axiosInstance.get('/user/sellers/pending', { params })
    const items = (data?.data ?? data ?? []).map((seller: any) => ({
      id: seller._id,
      name: seller.name,
      email: seller.email,
      shop: seller.shopId ?? '',
      date: seller.createdAt,
      raw: seller,
    }))
    return { data: items, total: items.length }
  },

  approve: async (id: string) => {
    const { data } = await axiosInstance.patch(`/user/sellers/${id}/status`, {
      status: 'approved',
    })
    return data?.data ?? data
  },

  reject: async (id: string) => {
    const { data } = await axiosInstance.patch(`/user/sellers/${id}/status`, {
      status: 'rejected',
    })
    return data?.data ?? data
  },
}

// Buyers APIs
export const buyersAPI = {
  list: async (params: PaginationParams): Promise<ListResponse<any>> => {
    const { data } = await axiosInstance.get('/admin/dashboard/users', { params })
    const payload = data?.data ?? {}
    const items = (payload.users ?? []).map((buyer: any) => ({
      id: buyer.userId,
      name: buyer.buyerName,
      totalOrders: buyer.totalOrders,
      deliveredOrders: buyer.deliveredOrders,
      status: buyer.activityLog,
      raw: buyer,
    }))
    const total = payload.pagination?.total ?? items.length
    return { data: items, total }
  },
}

// Banner Ads APIs
export const bannerAdsAPI = {
  list: async (params: PaginationParams): Promise<ListResponse<any>> => {
    const { data } = await axiosInstance.get('/banner', { params })
    const items = (data?.data ?? data ?? []).map((banner: any) => ({
      id: banner._id,
      image: banner.banner?.url ?? banner.image?.url,
      date: banner.createdAt,
      raw: banner,
    }))
    return { data: items, total: items.length }
  },

  upload: async (formData: FormData) => {
    const { data } = await axiosInstance.post('/banner/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data?.data ?? data
  },

  delete: async (id: string) => {
    const { data } = await axiosInstance.delete(`/banner/${id}`)
    return data?.data ?? data
  },
}

// Subscriptions APIs
export const subscriptionsAPI = {
  list: async (): Promise<ListResponse<any>> => {
    const { data } = await axiosInstance.get('/subscription')
    const items = (data?.data ?? data ?? []).map((plan: any) => ({
      id: plan._id,
      name: plan.planName,
      pricePerMonth: plan.pricePerMonth,
      pricePerYear: plan.pricePerYear,
      features: plan.features,
      date: plan.createdAt,
      raw: plan,
    }))
    return { data: items, total: items.length }
  },

  create: async (payload: any) => {
    const { data } = await axiosInstance.post('/subscription', payload)
    return data?.data ?? data
  },

  update: async (id: string, payload: any) => {
    const { data } = await axiosInstance.put(`/subscription/${id}`, payload)
    return data?.data ?? data
  },

  delete: async (id: string) => {
    const { data } = await axiosInstance.delete(`/subscription/${id}`)
    return data?.data ?? data
  },
}
