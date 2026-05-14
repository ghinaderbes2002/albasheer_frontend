import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Inbox, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAdminUsers,
  useCreateAdminUser,
  useDeleteAdminUser,
  useUpdateAdminUser,
} from '@/features/admin/queries'
import { useAdminBranches } from '@/features/admin/queries'
import { extractApiError } from '@/lib/api'
import type { AdminUser, CreateUserPayload, Role } from '@/types/api'

const ROLES: Role[] = ['customer', 'branch_manager', 'delivery', 'admin']

export function AdminUsersPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = useAdminUsers({
    search: search || undefined,
    role: roleFilter || undefined,
  })
  const deleteUser = useDeleteAdminUser()

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin.users.confirmDelete'))) return
    try {
      await deleteUser.mutateAsync(id)
      toast.success(t('admin.users.deleted'))
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">{t('admin.users.title')}</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          {t('admin.users.add')}
        </Button>
      </header>

      <div className="flex flex-wrap gap-3">
        <Input
          className="w-full sm:w-64"
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="flex h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">{t('common.all')}</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : !data?.length ? (
        <EmptyState message={t('admin.users.empty')} />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.users.phone')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden sm:table-cell">Name</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.users.role')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden md:table-cell">{t('admin.users.branch')}</th>
                <th className="px-4 py-3 text-end font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">#{u.id}</td>
                  <td className="px-4 py-3 font-medium" dir="ltr">{u.phone}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${roleColor(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {u.branch?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditUser(u)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(u.id)}
                        disabled={deleteUser.isPending}
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

      {(showCreate || editUser) && (
        <UserFormDialog
          user={editUser}
          onClose={() => { setShowCreate(false); setEditUser(null) }}
        />
      )}
    </div>
  )
}

function UserFormDialog({
  user,
  onClose,
}: {
  user: AdminUser | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { data: branches } = useAdminBranches()
  const create = useCreateAdminUser()
  const update = useUpdateAdminUser(user?.id ?? 0)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateUserPayload & { is_active: boolean }>({
    defaultValues: {
      phone: user?.phone ?? '',
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      role: user?.role ?? 'customer',
      branch_id: user?.branch?.id,
      password: '',
      is_active: user?.is_active ?? true,
    },
  })

  const role = watch('role')
  const needsBranch = role === 'branch_manager' || role === 'delivery'
  const isEdit = !!user

  const onSubmit = async (values: CreateUserPayload & { is_active: boolean }) => {
    try {
      if (isEdit) {
        const { password, ...rest } = values
        await update.mutateAsync(password ? values : rest)
        toast.success(t('admin.users.updated'))
      } else {
        await create.mutateAsync(values)
        toast.success(t('admin.users.created'))
      }
      onClose()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  const pending = create.isPending || update.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-semibold">
          {isEdit ? t('admin.users.editTitle') : t('admin.users.addTitle')}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Field label={t('admin.users.phone')}>
            <Input {...register('phone')} dir="ltr" disabled={isEdit} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('auth.profile.firstName')}>
              <Input {...register('first_name')} />
            </Field>
            <Field label={t('auth.profile.lastName')}>
              <Input {...register('last_name')} />
            </Field>
          </div>
          <Field label={t('admin.users.role')}>
            <select
              {...register('role')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          {needsBranch && (
            <Field label={`${t('admin.users.branch')} *`} error={errors.branch_id?.message}>
              <select
                {...register('branch_id', {
                  valueAsNumber: true,
                  validate: (v) =>
                    needsBranch && (!v || isNaN(v as number) || (v as number) <= 0)
                      ? t('common.required')
                      : true,
                })}
                className={`flex h-10 w-full rounded-md border bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.branch_id ? 'border-destructive' : 'border-input'}`}
              >
                <option value="">— {t('admin.users.branch')} —</option>
                {branches?.map((b) => (
                  <option key={b.id} value={b.id}>{b.name_ar}</option>
                ))}
              </select>
            </Field>
          )}
          <Field label={isEdit ? `${t('admin.users.newPassword')} (${t('common.cancel').toLowerCase()} = don't change)` : t('admin.users.newPassword')}>
            <Input {...register('password')} type="password" required={!isEdit} />
          </Field>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" {...register('is_active')} className="size-4" />
            <Label htmlFor="is_active">{t('admin.users.active')}</Label>
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

function Field({
  label,
  children,
  error,
}: {
  label: string
  children: React.ReactNode
  error?: string
}) {
  return (
    <div className="space-y-1">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
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

function roleColor(role: Role) {
  const map: Record<Role, string> = {
    admin: 'bg-purple-100 text-purple-700',
    branch_manager: 'bg-blue-100 text-blue-700',
    delivery: 'bg-amber-100 text-amber-700',
    customer: 'bg-gray-100 text-gray-700',
  }
  return map[role]
}
