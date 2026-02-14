"use client";

import { useState, Fragment } from "react";
import {
  useCategoriesQuery,
  useDeleteCategoryMutation,
  useCategoryMutation,
} from "@/lib/hooks/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeleton } from "@/components/table-skeleton";
import { Edit2, Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CategoriesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10;

  const { data, isLoading } = useCategoriesQuery({
    page,
    limit,
    search,
  });
  const deleteCategory = useDeleteCategoryMutation();
  const saveCategory = useCategoryMutation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<{
    name: string;
    color: string;
    parent: string;
    imageFile: File | null;
    imagePreview: string;
  }>({
    name: "",
    color: "",
    parent: "",
    imageFile: null,
    imagePreview: "",
  });
  const normalizedColor = formData.color.trim();
  const colorValue = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalizedColor)
    ? normalizedColor
    : "#000000";

  const handleDelete = (category: any) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleOpenCreate = () => {
    setSelectedCategory(null);
    setFormData({
      name: "",
      color: "",
      parent: "",
      imageFile: null,
      imagePreview: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenCreateSubcategory = (category: any) => {
    setSelectedCategory(null);
    setFormData({
      name: "",
      color: "",
      parent: category?.id ?? category?._id ?? "",
      imageFile: null,
      imagePreview: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category: any, parentId?: string) => {
    setSelectedCategory(category);
    setFormData({
      name: category?.name || "",
      color: category?.raw?.color || category?.color || "",
      parent:
        parentId ?? category?.raw?.parent?._id ?? category?.parent?._id ?? "",
      imageFile: null,
      imagePreview: category?.raw?.image?.url || category?.image?.url || "",
    });
    setIsFormOpen(true);
  };

  const handleToggleRow = (categoryId: string) => {
    setExpandedRows((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const handleSubmit = () => {
    if (formData.imageFile) {
      const payload = new FormData();
      payload.append("name", formData.name);
      if (formData.color) payload.append("color", formData.color);
      if (formData.parent) payload.append("parent", formData.parent);
      payload.append("image", formData.imageFile);

      saveCategory.mutate(
        { id: selectedCategory?.id, payload },
        {
          onSuccess: () => {
            setIsFormOpen(false);
          },
        },
      );
      return;
    }

    const payload: any = {
      name: formData.name,
      color: formData.color,
    };
    if (formData.parent) payload.parent = formData.parent;

    saveCategory.mutate(
      { id: selectedCategory?.id, payload },
      {
        onSuccess: () => {
          setIsFormOpen(false);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Categories List</h1>
          <p className="text-sm text-slate-600 mt-1">
            Dashboard › Categories › List
          </p>
        </div>
        <Button
          className="bg-amber-600 hover:bg-amber-700 text-white"
          onClick={handleOpenCreate}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Categories
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <TableSkeleton rows={5} columns={3} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data && data.data.length > 0 ? (
                  data.data.map((category: any, categoryIndex: number) => {
                    const children = category?.raw?.children ?? [];
                    const isExpanded = !!expandedRows[category.id];
                    if (category.raw.parent) {
                      return null;
                    }

                    return (
                      <Fragment key={`${category.id}-${categoryIndex}`}>
                        <TableRow className="hover:bg-slate-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-100"
                                onClick={() => handleToggleRow(category.id)}
                                aria-label={
                                  isExpanded
                                    ? "Collapse subcategories"
                                    : "Expand subcategories"
                                }
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                              <div className="h-10 w-10 rounded-md bg-slate-100 overflow-hidden border border-slate-200">
                                {category?.raw?.image?.url ? (
                                  <img
                                    src={category.raw.image.url}
                                    alt={category.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : null}
                              </div>
                              <button
                                type="button"
                                className="font-medium text-left"
                                onClick={() => handleToggleRow(category.id)}
                              >
                                {category.name}
                              </button>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {category.date}
                          </TableCell>
                          <TableCell className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-amber-600 hover:bg-amber-50"
                              onClick={() => handleOpenEdit(category)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(category)}
                              disabled={deleteCategory.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        {isExpanded &&
                          children.map((child: any, childIndex: number) => (
                            <TableRow
                              key={`${child?._id ?? childIndex}-${childIndex}`}
                              className="bg-slate-50/60"
                            >
                              <TableCell>
                                <div className="flex items-center gap-3 pl-12">
                                  <div className="h-8 w-8 rounded-md bg-slate-100 overflow-hidden border border-slate-200">
                                    {child?.image?.url ? (
                                      <img
                                        src={child.image.url}
                                        alt={child.name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : null}
                                  </div>
                                  <span className="text-sm text-slate-700">
                                    {child?.name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-slate-500">
                                -
                              </TableCell>
                              <TableCell className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-amber-600 hover:bg-amber-50"
                                  onClick={() =>
                                    handleOpenEdit(
                                      {
                                        id: child?._id,
                                        name: child?.name,
                                        raw: child,
                                      },
                                      category.id,
                                    )
                                  }
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={() =>
                                    handleDelete({
                                      id: child?._id,
                                      name: child?.name,
                                    })
                                  }
                                  disabled={deleteCategory.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        {isExpanded && (
                          <TableRow className="bg-slate-50/60">
                            <TableCell>
                              <div className="flex items-center gap-3 pl-12">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-amber-700 border-amber-200 hover:bg-amber-50"
                                  onClick={() =>
                                    handleOpenCreateSubcategory(category)
                                  }
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Subcategory
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-500">-</TableCell>
                            <TableCell />
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-slate-500 py-8"
                    >
                      No categories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Info */}
        {!isLoading && data && (
          <div className="mt-6 text-sm text-slate-600">
            Showing {Math.min((page - 1) * limit + 1, data.total)} to{" "}
            {Math.min(page * limit, data.total)} of {data.total} results
          </div>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "Update Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Category name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  aria-label="Pick color"
                  value={colorValue}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="h-10 w-12 cursor-pointer rounded-md border border-slate-200 bg-white p-1"
                />
                <Input
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  placeholder="Color code (optional)"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Image
              </label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-md border border-slate-200 bg-slate-50 overflow-hidden">
                  {formData.imagePreview ? (
                    <img
                      src={formData.imagePreview}
                      alt="Category preview"
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      imageFile: e.target.files?.[0] ?? null,
                      imagePreview: e.target.files?.[0]
                        ? URL.createObjectURL(e.target.files[0])
                        : formData.imagePreview,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              No
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleSubmit}
              disabled={saveCategory.isPending}
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCategory?.name}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedCategory && deleteCategory.mutate(selectedCategory.id)
              }
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
