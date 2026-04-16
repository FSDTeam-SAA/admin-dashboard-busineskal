'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import axiosInstance from '@/lib/axios'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

const emptyForm = { text1: '', text2: '', text3: '' }

export default function OnboardingPage() {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [formData, setFormData] = useState(emptyForm)

  const fetchTexts = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await axiosInstance.get('/text')
      const list = (data?.data ?? data ?? []).map((item: any) => ({
        id: item._id,
        text1: item.text1,
        text2: item.text2,
        text3: item.text3,
        date: item.createdAt,
      }))
      setItems(list)
    } catch {
      toast.error('Failed to load onboarding texts')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTexts()
  }, [fetchTexts])

  const handleOpenCreate = () => {
    setSelected(null)
    setFormData(emptyForm)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (item: any) => {
    setSelected(item)
    setFormData({ text1: item.text1, text2: item.text2, text3: item.text3 })
    setIsFormOpen(true)
  }

  const handleOpenDelete = (item: any) => {
    setSelected(item)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.text1 || !formData.text2 || !formData.text3) {
      toast.error('All three fields are required')
      return
    }
    setIsSaving(true)
    try {
      if (selected) {
        await axiosInstance.patch(`/text/${selected.id}`, formData)
        toast.success('Text updated successfully')
      } else {
        await axiosInstance.post('/text', formData)
        toast.success('Text created successfully')
      }
      setIsFormOpen(false)
      fetchTexts()
    } catch {
      toast.error(selected ? 'Failed to update text' : 'Failed to create text')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selected) return
    setIsDeleting(true)
    try {
      await axiosInstance.delete(`/text/${selected.id}`)
      toast.success('Text deleted successfully')
      setIsDeleteOpen(false)
      fetchTexts()
    } catch {
      toast.error('Failed to delete text')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Onboarding Texts</h1>
          <p className="text-sm text-slate-600 mt-1">Dashboard › Onboarding</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {isLoading ? (
          <p className="text-slate-500 py-8 text-center">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Welcome to MANSA</TableHead>
                  <TableHead className="font-semibold">Discover Products</TableHead>
                  <TableHead className="font-semibold">Get Started</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length > 0 ? (
                  items.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50">
                      <TableCell className="capitalize">{item.text1}</TableCell>
                      <TableCell className="capitalize">{item.text2}</TableCell>
                      <TableCell className="capitalize">{item.text3}</TableCell>
                      <TableCell className="text-slate-600">
                        {item.date ? new Date(item.date).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell className="flex gap-2 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-600 hover:bg-amber-50"
                          onClick={() => handleOpenEdit(item)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                      No onboarding texts found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected ? 'Update Text' : 'Add Text'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {(['text1', 'text2', 'text3'] as const).map((field, i) => (
              <div key={field}>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Text {i + 1}
                </label>
                <Input
                  value={formData[field]}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  placeholder={`Enter text ${i + 1}`}
                />
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Text</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this text entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Yes'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
