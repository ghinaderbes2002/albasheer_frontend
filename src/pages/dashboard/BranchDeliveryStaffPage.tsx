import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Inbox, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useBranchStaffList,
  useCreateBranchStaff,
  useDeleteBranchStaff,
  useUpdateBranchStaff,
} from '@/features/branchDashboard/queries'
import { extractApiError } from '@/lib/api'
import { useStaffMe } from '@/features/auth/queries'
import type { AdminUser, CreateBranchStaffPayload } from '@/types/api'

function fullName(s: AdminUser) {
  return [s.first_name, s.last_name].filter(Boolean).join(' ') || s.phone
}

export function BranchDeliveryStaffPage() {
  const { t } = useTranslation()
  const [showCreate, setShowCreate] = useState(false)
  const [editStaff, setEditStaff] = useState<AdminUser | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null)

  const { data: me } = useStaffMe()
  const { data, isLoading } = useBranchStaffList()
  const deleteStaff = useDeleteBranchStaff()

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      await deleteStaff.mutateAsync(confirmDelete.id)
      toast.success(t('dashboard.staff.deleted'))
      setConfirmDelete(null)
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{t('dashboard.staff.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('dashboard.staff.subtitle')}</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          {t('dashboard.staff.add')}
        </Button>
      </header>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : !data?.length ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
          <Inbox className="size-10" />
          <p>{t('dashboard.staff.empty')}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.users.phone')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden sm:table-cell">{t('dashboard.staff.name')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden md:table-cell">{t('admin.users.active')}</th>
                <th className="px-4 py-3 text-end font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    <span dir="ltr">{s.phone}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                    {fullName(s)}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.is_active ? t('admin.users.active') : t('branches.inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditStaff(s)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setConfirmDelete(s)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(showCreate || editStaff) && (
        <StaffFormDialog
          staff={editStaff}
          onClose={() => { setShowCreate(false); setEditStaff(null) }}
          branchId={me?.branch_id ?? undefined}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="size-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-base font-semibold">{t('common.confirmDelete')}</h2>
                <p className="text-sm text-muted-foreground">{fullName(confirmDelete)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="flex-1"
                disabled={deleteStaff.isPending}
                onClick={handleDelete}
              >
                {deleteStaff.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                {t('common.delete')}
              </Button>
              <Button variant="outline" disabled={deleteStaff.isPending} onClick={() => setConfirmDelete(null)}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StaffFormDialog({
  staff,
  onClose,
  branchId,
}: {
  staff: AdminUser | null
  onClose: () => void
  branchId?: number
}) {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const isEdit = !!staff

  const create = useCreateBranchStaff()
  const update = useUpdateBranchStaff(staff?.id ?? 0)

  const { register, handleSubmit, formState: { errors } } = useForm<CreateBranchStaffPayload & { first_name: string; last_name: string }>({
    defaultValues: {
      phone: staff?.phone?.replace(/^\+/, '') ?? '',
      first_name: staff?.first_name ?? '',
      last_name: staff?.last_name ?? '',
      password: '',
    },
  })

  const onSubmit = async (values: CreateBranchStaffPayload & { first_name: string; last_name: string }) => {
    const phone = values.phone.startsWith('+') ? values.phone : `+${values.phone}`
    try {
      if (isEdit) {
        const payload: Partial<CreateBranchStaffPayload> = {
          first_name: values.first_name || undefined,
          last_name: values.last_name || undefined,
          ...(values.password ? { password: values.password } : {}),
        }
        await update.mutateAsync(payload)
        toast.success(t('dashboard.staff.updated'))
      } else {
        await create.mutateAsync({ ...values, phone, branch_id: branchId })
        toast.success(t('dashboard.staff.created'))
      }
      onClose()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  const pending = create.isPending || update.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-lg font-semibold">
          {isEdit ? t('dashboard.staff.editTitle') : t('dashboard.staff.addTitle')}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t('admin.users.phone')}</Label>
            <Input
              {...register('phone', { required: !isEdit })}
              dir="ltr"
              disabled={isEdit}
              placeholder="963XXXXXXXXX"
            />
            {errors.phone && <p className="text-xs text-destructive">{t('common.required')}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">{t('auth.profile.firstName')}</Label>
              <Input {...register('first_name')} />
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">{t('auth.profile.lastName')}</Label>
              <Input {...register('last_name')} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">
              {isEdit
                ? `${t('admin.users.newPassword')} (${t('dashboard.staff.leaveBlankToKeep')})`
                : t('admin.users.newPassword')}
            </Label>
            <div className="relative">
              <Input
                {...register('password', { required: !isEdit })}
                type={showPassword ? 'text' : 'password'}
                required={!isEdit}
                className="pe-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 inset-e-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{t('common.required')}</p>}
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
