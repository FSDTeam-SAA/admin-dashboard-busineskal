'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Edit2,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Lock,
  PencilLine,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { apiClient } from '@/lib/api'
import axiosInstance from '@/lib/axios'
import {
  useCountriesQuery,
  useCountryMutation,
  useDeleteCountryMutation,
} from '@/lib/hooks/queries'

type CountryFormState = {
  name: string
  flagFile: File | null
  flagPreview: string
}

const COUNTRY_PAGE_SIZE = 5

const createEmptyCountryForm = (): CountryFormState => ({
  name: '',
  flagFile: null,
  flagPreview: '',
})

const formatDateInput = (value?: string | Date | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

const getVisiblePages = (currentPage: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
  return Array.from({ length: 5 }, (_, index) => start + index)
}

export default function SettingPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoadingPassword, setIsLoadingPassword] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [countryPage, setCountryPage] = useState(1)
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false)
  const [isDeleteCountryOpen, setIsDeleteCountryOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<any>(null)

  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    address: '',
  })

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  })

  const [countryFormData, setCountryFormData] =
    useState<CountryFormState>(createEmptyCountryForm)

  const countriesQuery = useCountriesQuery({
    page: countryPage,
    limit: COUNTRY_PAGE_SIZE,
  })
  const countryMutation = useCountryMutation()
  const deleteCountryMutation = useDeleteCountryMutation()

  const countries = countriesQuery.data?.data ?? []
  const totalCountries = countriesQuery.data?.total ?? 0
  const totalCountryPages = countriesQuery.data?.totalPages ?? 1
  const visiblePages = useMemo(
    () => getVisiblePages(countryPage, totalCountryPages),
    [countryPage, totalCountryPages],
  )

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await axiosInstance.get('/user/profile')
        const profile = data?.data

        if (!profile) return

        setUser(profile)
        setProfileData({
          fullName: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          dob: formatDateInput(profile.dob),
          gender:
            typeof profile.gender === 'string'
              ? profile.gender.toLowerCase()
              : '',
          address: profile.address || '',
        })
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load profile')
      }
    }

    loadProfile()
  }, [])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !passwordData.oldPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error('Please fill in all password fields')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoadingPassword(true)
    try {
      await apiClient.changePassword(
        passwordData.oldPassword,
        passwordData.newPassword,
      )
      toast.success('Password changed successfully')
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordModal(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setIsLoadingPassword(false)
    }
  }

  const handleProfileUpdate = async () => {
    try {
      const response = await axiosInstance.put('/user/profile', {
        name: profileData.fullName,
        phone: profileData.phone,
        address: profileData.address,
        dob: profileData.dob || undefined,
        gender: profileData.gender || undefined,
      })

      const updatedProfile = response?.data?.data
      if (updatedProfile) {
        setUser(updatedProfile)
        setProfileData((current) => ({
          ...current,
          fullName: updatedProfile.name || current.fullName,
          phone: updatedProfile.phone || '',
          address: updatedProfile.address || '',
          dob: formatDateInput(updatedProfile.dob),
          gender:
            typeof updatedProfile.gender === 'string'
              ? updatedProfile.gender.toLowerCase()
              : '',
        }))
      }

      toast.success('Profile updated successfully')
      setIsEditingProfile(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    }
  }

  const resetCountryModal = () => {
    setSelectedCountry(null)
    setCountryFormData(createEmptyCountryForm())
  }

  const openCreateCountryModal = () => {
    resetCountryModal()
    setIsCountryModalOpen(true)
  }

  const openEditCountryModal = (country: any) => {
    setSelectedCountry(country)
    setCountryFormData({
      name: country.name || '',
      flagFile: null,
      flagPreview: country.image || '',
    })
    setIsCountryModalOpen(true)
  }

  const handleCountryFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null
    setCountryFormData((current) => ({
      ...current,
      flagFile: file,
      flagPreview: file ? URL.createObjectURL(file) : current.flagPreview,
    }))
  }

  const handleCountrySubmit = () => {
    const trimmedName = countryFormData.name.trim()
    const isCreating = !selectedCountry

    if (!trimmedName) {
      toast.error('Country name is required')
      return
    }

    if (isCreating && !countryFormData.flagFile) {
      toast.error('Flag image is required')
      return
    }

    const payload = new FormData()
    payload.append('name', trimmedName)
    if (countryFormData.flagFile) {
      payload.append('flag', countryFormData.flagFile)
    }

    countryMutation.mutate(
      {
        id: selectedCountry?.id,
        payload,
      },
      {
        onSuccess: () => {
          if (isCreating) {
            setCountryPage(1)
          }
          setIsCountryModalOpen(false)
          resetCountryModal()
        },
      },
    )
  }

  const handleDeleteCountry = () => {
    if (!selectedCountry?.id) return

    deleteCountryMutation.mutate(selectedCountry.id, {
      onSuccess: () => {
        if (countries.length === 1 && countryPage > 1) {
          setCountryPage((current) => current - 1)
        }
        setIsDeleteCountryOpen(false)
        resetCountryModal()
      },
    })
  }

  const displayName = user?.name || 'Mr. Raja'
  const username =
    user?.username || user?.name?.toLowerCase().replace(/\s+/g, '') || 'rajuser'
  const initials =
    user?.name
      ?.split(' ')
      .map((part: string) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'MR'

  const showingFrom = totalCountries === 0 ? 0 : (countryPage - 1) * COUNTRY_PAGE_SIZE + 1
  const showingTo = Math.min(countryPage * COUNTRY_PAGE_SIZE, totalCountries)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Setting</h1>
        <p className="mt-1 text-sm text-slate-600">Dashboard &gt; Setting</p>
      </div>

      <div className="rounded-[28px] border border-[#F0E7D8] bg-[#FFFDF8] p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 pb-8 sm:pb-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#C98A2E] to-[#8B5704] text-2xl font-semibold text-white sm:h-24 sm:w-24">
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 sm:text-[30px]">
                {displayName}
              </h2>
              <p className="mt-1 text-base text-slate-500">@{username}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="h-11 rounded-xl border-slate-300 px-6 text-sm font-medium text-slate-700"
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </Button>
            <Button
              className="h-11 rounded-xl bg-[#A56A08] px-6 text-sm font-medium text-white hover:bg-[#8B5704]"
              onClick={() =>
                isEditingProfile ? handleProfileUpdate() : setIsEditingProfile(true)
              }
            >
              <PencilLine className="h-4 w-4" />
              {isEditingProfile ? 'Save Profile' : 'Update Profile'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Full Name
            </label>
            <Input
              value={profileData.fullName}
              onChange={(e) =>
                setProfileData((current) => ({
                  ...current,
                  fullName: e.target.value,
                }))
              }
              disabled={!isEditingProfile}
              className="h-12 rounded-xl border-[#E8E1D6] bg-white disabled:bg-[#FBF8F2]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              User Name
            </label>
            <Input
              value={username}
              disabled
              className="h-12 rounded-xl border-[#E8E1D6] bg-[#FBF8F2] text-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <Input
              value={profileData.email}
              disabled
              className="h-12 rounded-xl border-[#E8E1D6] bg-[#FBF8F2] text-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Phone Number
            </label>
            <Input
              value={profileData.phone}
              onChange={(e) =>
                setProfileData((current) => ({
                  ...current,
                  phone: e.target.value,
                }))
              }
              disabled={!isEditingProfile}
              className="h-12 rounded-xl border-[#E8E1D6] bg-white disabled:bg-[#FBF8F2]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Date of Birth
            </label>
            <Input
              type="date"
              value={profileData.dob}
              onChange={(e) =>
                setProfileData((current) => ({
                  ...current,
                  dob: e.target.value,
                }))
              }
              disabled={!isEditingProfile}
              className="h-12 rounded-xl border-[#E8E1D6] bg-white disabled:bg-[#FBF8F2]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Gender
            </label>
            <select
              value={profileData.gender}
              onChange={(e) =>
                setProfileData((current) => ({
                  ...current,
                  gender: e.target.value,
                }))
              }
              disabled={!isEditingProfile}
              className="h-12 w-full rounded-xl border border-[#E8E1D6] bg-white px-3 text-sm text-slate-900 disabled:bg-[#FBF8F2] disabled:text-slate-500"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Address
            </label>
            <textarea
              value={profileData.address}
              onChange={(e) =>
                setProfileData((current) => ({
                  ...current,
                  address: e.target.value,
                }))
              }
              disabled={!isEditingProfile}
              rows={3}
              className="w-full rounded-xl border border-[#E8E1D6] bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-[#C98A2E] focus:ring-2 focus:ring-[#F4D7A9] disabled:bg-[#FBF8F2] disabled:text-slate-500"
            />
          </div>
        </div>

        {isEditingProfile ? (
          <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="rounded-xl border-slate-300 px-6"
              onClick={() => {
                setIsEditingProfile(false)
                setProfileData((current) => ({
                  ...current,
                  fullName: user?.name || '',
                  email: user?.email || '',
                  phone: user?.phone || '',
                  dob: formatDateInput(user?.dob),
                  gender:
                    typeof user?.gender === 'string'
                      ? user.gender.toLowerCase()
                      : '',
                  address: user?.address || '',
                }))
              }}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-[#A56A08] px-6 text-white hover:bg-[#8B5704]"
              onClick={handleProfileUpdate}
            >
              Save Changes
            </Button>
          </div>
        ) : null}

        <div className="mt-10 border-t border-[#F0E7D8] pt-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">
                Add country where user can use your app
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Upload a flag image and country name, then manage them from this page.
              </p>
            </div>
            <div className="text-sm text-slate-500">
              {totalCountries > 0
                ? `Showing ${showingFrom}-${showingTo} of ${totalCountries}`
                : 'No countries added yet'}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-5">
            <div className="flex w-[92px] flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#E7DECF] bg-white text-slate-500 shadow-sm">
                <Globe className="h-7 w-7" />
              </div>
              <span className="text-center text-xs font-medium text-[#D08C2F]">
                Global
              </span>
            </div>

            {countries.map((country: any) => (
              <div
                key={country.id}
                className="group flex w-[92px] flex-col items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => openEditCountryModal(country)}
                  className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-[#E7DECF] bg-white shadow-sm transition hover:border-[#C98A2E] hover:shadow-md"
                >
                  {country.image ? (
                    <img
                      src={country.image}
                      alt={country.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Globe className="h-6 w-6 text-slate-400" />
                  )}
                </button>
                <span className="text-center text-xs font-medium text-slate-700">
                  {country.name}
                </span>
                <div className="flex h-6 items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-amber-600 hover:bg-amber-50"
                    onClick={() => openEditCountryModal(country)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setSelectedCountry(country)
                      setIsDeleteCountryOpen(true)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex w-[92px] flex-col items-center gap-2">
              <button
                type="button"
                onClick={openCreateCountryModal}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-[#C7BAA4] bg-white text-slate-700 shadow-sm transition hover:border-[#A56A08] hover:text-[#A56A08]"
              >
                <Plus className="h-6 w-6" />
              </button>
              <span className="text-center text-xs font-medium text-slate-700">
                Add more
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {totalCountries > 0
                ? `Showing ${showingFrom} to ${showingTo} of ${totalCountries} countries`
                : 'No country data to display'}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCountryPage((current) => Math.max(current - 1, 1))}
                disabled={countryPage === 1}
              >
                Previous
              </Button>

              {visiblePages.map((pageNumber) => (
                <Button
                  key={pageNumber}
                  type="button"
                  size="sm"
                  variant={pageNumber === countryPage ? 'default' : 'outline'}
                  className={
                    pageNumber === countryPage
                      ? 'bg-[#A56A08] text-white hover:bg-[#8B5704]'
                      : ''
                  }
                  onClick={() => setCountryPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setCountryPage((current) => Math.min(current + 1, totalCountryPages))
                }
                disabled={countryPage === totalCountryPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={isCountryModalOpen}
        onOpenChange={(open) => {
          setIsCountryModalOpen(open)
          if (!open) {
            resetCountryModal()
          }
        }}
      >
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCountry ? 'Update Country' : 'Add Country'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Country Name
              </label>
              <Input
                value={countryFormData.name}
                onChange={(e) =>
                  setCountryFormData((current) => ({
                    ...current,
                    name: e.target.value,
                  }))
                }
                placeholder="Enter country name"
                className="h-11 rounded-xl"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Flag Image
              </label>
              <div className="flex items-center gap-4 rounded-2xl border border-dashed border-slate-300 p-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                  {countryFormData.flagPreview ? (
                    <img
                      src={countryFormData.flagPreview}
                      alt="Country flag preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Globe className="h-6 w-6 text-slate-400" />
                  )}
                </div>

                <div className="flex-1">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                    <Upload className="h-4 w-4" />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCountryFileChange}
                    />
                  </label>
                  <p className="mt-2 text-xs text-slate-500">
                    JPG, PNG, or WEBP flag image
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setIsCountryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-[#A56A08] text-white hover:bg-[#8B5704]"
              onClick={handleCountrySubmit}
              disabled={countryMutation.isPending}
            >
              {countryMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteCountryOpen}
        onOpenChange={setIsDeleteCountryOpen}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Country</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCountry?.name}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeleteCountry}
              disabled={deleteCountryMutation.isPending}
            >
              {deleteCountryMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Current Password
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.old ? 'text' : 'password'}
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData((current) => ({
                      ...current,
                      oldPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter current password"
                  className="h-11 rounded-xl pr-11"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  onClick={() =>
                    setShowPasswords((current) => ({
                      ...current,
                      old: !current.old,
                    }))
                  }
                >
                  {showPasswords.old ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((current) => ({
                      ...current,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter new password"
                  className="h-11 rounded-xl pr-11"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  onClick={() =>
                    setShowPasswords((current) => ({
                      ...current,
                      new: !current.new,
                    }))
                  }
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((current) => ({
                      ...current,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Confirm new password"
                  className="h-11 rounded-xl pr-11"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  onClick={() =>
                    setShowPasswords((current) => ({
                      ...current,
                      confirm: !current.confirm,
                    }))
                  }
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-[#A56A08] text-white hover:bg-[#8B5704]"
                disabled={isLoadingPassword}
              >
                {isLoadingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
