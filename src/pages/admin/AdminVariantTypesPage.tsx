import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { ChevronDown, ChevronRight, Inbox, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAdminVariantTypes,
  useCreateAdminVariantType,
  useUpdateAdminVariantType,
  useDeleteAdminVariantType,
  useAdminVariantOptions,
  useCreateAdminVariantOption,
  useUpdateAdminVariantOption,
  useDeleteAdminVariantOption,
} from '@/features/admin/queries'
import { extractApiError } from '@/lib/api'
import type { VariantOption, VariantType } from '@/types/api'

export function AdminVariantTypesPage() {
  const { t } = useTranslation()
  const { data: types, isLoading } = useAdminVariantTypes()
  const deleteType = useDeleteAdminVariantType()

  const [expandedTypeId, setExpandedTypeId] = useState<number | null>(null)
  const [editType, setEditType] = useState<VariantType | null>(null)
  const [showCreateType, setShowCreateType] = useState(false)
  const [confirmDeleteType, setConfirmDeleteType] = useState<VariantType | null>(null)

  const handleDeleteType = async () => {
    if (!confirmDeleteType) return
    try {
      await deleteType.mutateAsync(confirmDeleteType.id)
      toast.success(t('admin.variants.typeDeleted'))
      setConfirmDeleteType(null)
      if (expandedTypeId === confirmDeleteType.id) setExpandedTypeId(null)
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('admin.variants.title')}</h1>
        <Button onClick={() => setShowCreateType(true)}>
          <Plus className="size-4" />
          {t('admin.variants.addType')}
        </Button>
      </header>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : !types?.length ? (
        <EmptyState message={t('admin.variants.emptyTypes')} />
      ) : (
        <div className="space-y-3">
          {types.map((type) => (
            <TypeCard
              key={type.id}
              type={type}
              expanded={expandedTypeId === type.id}
              onToggle={() => setExpandedTypeId(expandedTypeId === type.id ? null : type.id)}
              onEdit={() => setEditType(type)}
              onDelete={() => setConfirmDeleteType(type)}
            />
          ))}
        </div>
      )}

      {(showCreateType || editType) && (
        <TypeFormDialog
          type={editType}
          onClose={() => { setShowCreateType(false); setEditType(null) }}
        />
      )}

      {confirmDeleteType && (
        <ConfirmDeleteDialog
          name={confirmDeleteType.name_ar || confirmDeleteType.name}
          isPending={deleteType.isPending}
          onConfirm={handleDeleteType}
          onCancel={() => setConfirmDeleteType(null)}
        />
      )}
    </div>
  )
}

function TypeCard({
  type,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  type: VariantType
  expanded: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { t } = useTranslation()

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 bg-card cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onToggle}
      >
        <button
          type="button"
          className="text-muted-foreground"
          onClick={(e) => { e.stopPropagation(); onToggle() }}
        >
          {expanded
            ? <ChevronDown className="size-4" />
            : <ChevronRight className="size-4" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-medium">{type.name_ar}</p>
          <p className="text-xs text-muted-foreground">{type.name}</p>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {expanded && <OptionsPanel typeId={type.id} />}
    </div>
  )
}

function OptionsPanel({ typeId }: { typeId: number }) {
  const { t } = useTranslation()
  const { data: options, isLoading } = useAdminVariantOptions(typeId)
  const deleteOption = useDeleteAdminVariantOption(typeId)

  const [editOption, setEditOption] = useState<VariantOption | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<VariantOption | null>(null)

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      await deleteOption.mutateAsync(confirmDelete.id)
      toast.success(t('admin.variants.optionDeleted'))
      setConfirmDelete(null)
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="border-t border-border bg-muted/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{t('admin.variants.options')}</p>
        <Button size="sm" variant="outline" onClick={() => setShowCreate(true)}>
          <Plus className="size-3" />
          {t('admin.variants.addOption')}
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-10 rounded-lg" />
      ) : !options?.length ? (
        <p className="text-sm text-muted-foreground text-center py-4">{t('admin.variants.emptyOptions')}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <div
              key={opt.id}
              className="flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-sm"
            >
              <span>{opt.value_ar}</span>
              <span className="text-muted-foreground text-xs">({opt.value})</span>
              <button
                type="button"
                onClick={() => setEditOption(opt)}
                className="ms-1 text-muted-foreground hover:text-foreground"
              >
                <Pencil className="size-3" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(opt)}
                className="text-destructive hover:text-destructive/80"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {(showCreate || editOption) && (
        <OptionFormDialog
          typeId={typeId}
          option={editOption}
          onClose={() => { setShowCreate(false); setEditOption(null) }}
        />
      )}

      {confirmDelete && (
        <ConfirmDeleteDialog
          name={confirmDelete.value_ar || confirmDelete.value}
          isPending={deleteOption.isPending}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}

function TypeFormDialog({ type, onClose }: { type: VariantType | null; onClose: () => void }) {
  const { t } = useTranslation()
  const create = useCreateAdminVariantType()
  const update = useUpdateAdminVariantType(type?.id ?? 0)
  const isEdit = !!type

  const { register, handleSubmit } = useForm<{ name: string; name_ar: string }>({
    defaultValues: { name: type?.name ?? '', name_ar: type?.name_ar ?? '' },
  })

  const onSubmit = async (values: { name: string; name_ar: string }) => {
    try {
      if (isEdit) {
        await update.mutateAsync(values)
        toast.success(t('admin.variants.typeUpdated'))
      } else {
        await create.mutateAsync(values)
        toast.success(t('admin.variants.typeCreated'))
      }
      onClose()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  const pending = create.isPending || update.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-lg font-semibold">
          {isEdit ? t('admin.variants.editType') : t('admin.variants.addType')}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t('admin.variants.nameAr')}</Label>
            <Input {...register('name_ar')} required />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t('admin.variants.nameEn')}</Label>
            <Input {...register('name')} required dir="ltr" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={pending} className="flex-1">
              {pending && <Loader2 className="animate-spin size-4" />}
              {t('common.save')}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function OptionFormDialog({
  typeId,
  option,
  onClose,
}: {
  typeId: number
  option: VariantOption | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const create = useCreateAdminVariantOption(typeId)
  const update = useUpdateAdminVariantOption(typeId)
  const isEdit = !!option

  const { register, handleSubmit } = useForm<{ value: string; value_ar: string }>({
    defaultValues: { value: option?.value ?? '', value_ar: option?.value_ar ?? '' },
  })

  const onSubmit = async (values: { value: string; value_ar: string }) => {
    try {
      if (isEdit) {
        await update.mutateAsync({ id: option.id, payload: values })
        toast.success(t('admin.variants.optionUpdated'))
      } else {
        await create.mutateAsync(values)
        toast.success(t('admin.variants.optionCreated'))
      }
      onClose()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  const pending = create.isPending || update.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-lg font-semibold">
          {isEdit ? t('admin.variants.editOption') : t('admin.variants.addOption')}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t('admin.variants.valueAr')}</Label>
            <Input {...register('value_ar')} required />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t('admin.variants.valueEn')}</Label>
            <Input {...register('value')} required dir="ltr" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={pending} className="flex-1">
              {pending && <Loader2 className="animate-spin size-4" />}
              {t('common.save')}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfirmDeleteDialog({
  name,
  isPending,
  onConfirm,
  onCancel,
}: {
  name: string
  isPending: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
            <Trash2 className="size-5 text-destructive" />
          </div>
          <div>
            <h2 className="text-base font-semibold">{t('common.confirmDelete')}</h2>
            <p className="text-sm text-muted-foreground">{name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" className="flex-1" disabled={isPending} onClick={onConfirm}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            {t('common.delete')}
          </Button>
          <Button variant="outline" disabled={isPending} onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
      <Inbox className="size-10" />
      <p>{message}</p>
    </div>
  )
}
