import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@workspace/ui/components/button'
import { Fragment, useCallback, useState } from 'react'
import { toast } from 'sonner'

import { useBankAccounts, useRestoreBankAccount } from '@/api/bank-accounts'
import type { BankAccount } from '@/api/bank-accounts'

import { AccountFormDialog } from './components/AccountFormDialog'
import { AccountItem } from './components/AccountItem'
import { AccountItemSkeleton } from './components/AccountItemSkeleton'
import { AdjustBalanceDialog } from './components/AdjustBalanceDialog'
import { ArchiveAccountDialog } from './components/ArchiveAccountDialog'

export const AccountsPage = () => {
  const { data: activeData, isLoading: isLoadingActive } = useBankAccounts()
  const { data: archivedData } = useBankAccounts(true)
  const restore = useRestoreBankAccount()

  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [archiveDialogAccount, setArchiveDialogAccount] =
    useState<BankAccount | null>(null)
  const [adjustBalanceAccount, setAdjustBalanceAccount] =
    useState<BankAccount | null>(null)
  const [archivedExpanded, setArchivedExpanded] = useState(false)

  const activeAccounts = activeData?.bankAccounts ?? []
  const archivedAccounts = archivedData?.bankAccounts ?? []

  const handleEdit = useCallback((account: BankAccount) => {
    setEditingAccount(account)
    setFormDialogOpen(true)
  }, [])

  const handleNewAccount = useCallback(() => {
    setEditingAccount(null)
    setFormDialogOpen(true)
  }, [])

  const handleFormClose = useCallback((open: boolean) => {
    setFormDialogOpen(open)
    if (!open) setEditingAccount(null)
  }, [])

  const handleAdjustBalance = useCallback((account: BankAccount) => {
    setAdjustBalanceAccount(account)
  }, [])

  const handleAdjustBalanceClose = useCallback((open: boolean) => {
    if (!open) setAdjustBalanceAccount(null)
  }, [])

  const handleArchiveClose = useCallback((open: boolean) => {
    if (!open) setArchiveDialogAccount(null)
  }, [])

  const handleRestore = useCallback(
    (account: BankAccount) => {
      restore.mutate(account.id, {
        onSuccess: () => toast.success('Conta restaurada'),
        onError: () => toast.error('Erro ao restaurar conta'),
      })
    },
    [restore]
  )

  return (
    <Fragment>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Contas</h1>
          <Button onClick={handleNewAccount} size="sm">
            + Nova conta
          </Button>
        </div>

        <div className="flex flex-col">
          {isLoadingActive ? (
            <Fragment>
              <AccountItemSkeleton />
              <AccountItemSkeleton />
              <AccountItemSkeleton />
            </Fragment>
          ) : activeAccounts.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <p className="text-muted-foreground">
                Você ainda não tem contas cadastradas.
              </p>
              <Button onClick={handleNewAccount}>Criar primeira conta</Button>
            </div>
          ) : (
            activeAccounts.map((account) => (
              <AccountItem
                key={account.id}
                account={account}
                onEdit={handleEdit}
                onAdjustBalance={handleAdjustBalance}
                onArchive={setArchiveDialogAccount}
              />
            ))
          )}
        </div>

        {archivedAccounts.length > 0 && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setArchivedExpanded((prev) => !prev)}
            >
              <HugeiconsIcon
                icon={archivedExpanded ? ArrowUp01Icon : ArrowDown01Icon}
                strokeWidth={2}
                className="size-4"
              />
              Arquivadas ({archivedAccounts.length})
            </button>

            {archivedExpanded && (
              <div className="flex flex-col">
                {archivedAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between rounded-xl px-3 py-2 opacity-60"
                  >
                    <span className="text-sm">{account.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRestore(account)}
                      disabled={restore.isPending}
                    >
                      Restaurar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <AccountFormDialog
        account={editingAccount}
        open={formDialogOpen}
        onOpenChange={handleFormClose}
      />

      <AdjustBalanceDialog
        account={adjustBalanceAccount}
        open={!!adjustBalanceAccount}
        onOpenChange={handleAdjustBalanceClose}
      />

      <ArchiveAccountDialog
        account={archiveDialogAccount}
        open={!!archiveDialogAccount}
        onOpenChange={handleArchiveClose}
      />
    </Fragment>
  )
}
