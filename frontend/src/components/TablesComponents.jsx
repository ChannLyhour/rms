import { useMemo, useState, isValidElement } from 'react'
import { Check, ReverseLeft, X, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from '@untitledui/icons'
import { TableActionButtons, EditButton, DeleteButton, ViewButton } from './plugin/components/button-Action-Components'

// Helper to safely render icons
const renderIcon = (Icon, props = {}) => {
  if (!Icon) return null
  if (isValidElement(Icon)) return Icon
  const IconComponent = Icon
  return <IconComponent {...props} />
}

// ── Base Avatar Component ──────────────────────────────────────────────────
export const Avatar = ({ src, alt = '', initials = '', size = 'md', className = '' }) => {
  const [imgError, setImgError] = useState(!src)

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-12 h-12 text-base font-bold',
    xl: 'w-14 h-14 text-lg font-bold',
  }[size] || 'w-10 h-10 text-sm font-semibold'

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setImgError(true)}
        className={`rounded-full object-cover shrink-0 ${sizeClasses} ${className}`}
      />
    )
  }

  return null
}

// ── Base BadgeWithIcon Component ───────────────────────────────────────────
export const BadgeWithIcon = ({
  size = 'sm',
  color = 'gray',
  iconLeading: IconLeading,
  iconTrailing: IconTrailing,
  children,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1.5',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-semibold gap-2',
  }[size] || 'px-2 py-0.5 text-xs gap-1.5'

  const colorStyles = {
    success: {
      background: 'rgba(34, 197, 94, 0.12)',
      color: '#16a34a',
      borderColor: 'rgba(34, 197, 94, 0.25)',
    },
    gray: {
      background: 'var(--color-bg)',
      color: 'var(--color-muted)',
      borderColor: 'var(--color-border)',
    },
    error: {
      background: 'rgba(239, 68, 68, 0.12)',
      color: '#ef4444',
      borderColor: 'rgba(239, 68, 68, 0.25)',
    },
    warning: {
      background: 'rgba(245, 158, 11, 0.12)',
      color: '#d97706',
      borderColor: 'rgba(245, 158, 11, 0.25)',
    },
    primary: {
      background: 'rgba(191, 64, 64, 0.12)',
      color: 'var(--color-500, #BF4040)',
      borderColor: 'rgba(191, 64, 64, 0.25)',
    },
  }[color] || {
    background: 'var(--color-bg)',
    color: 'var(--color-text)',
    borderColor: 'var(--color-border)',
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-[5px] border shadow-2xs ${sizeClasses} ${className}`}
      style={colorStyles}
    >
      {renderIcon(IconLeading, { size: 12, className: 'shrink-0 stroke-[2.5px]' })}
      {children}
      {renderIcon(IconTrailing, { size: 12, className: 'shrink-0 stroke-[2.5px]' })}
    </span>
  )
}

// ── Base Button Component ──────────────────────────────────────────────────
export const Button = ({
  size = 'sm',
  color = 'secondary',
  iconLeading: IconLeading,
  iconTrailing: IconTrailing,
  className = '',
  children,
  ...props
}) => {
  const sizeClasses = {
    xs: 'px-2 py-1 text-[11px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  }[size] || 'px-2.5 py-1 text-xs'

  const colorStyles = {
    primary: {
      background: 'var(--color-500, #BF4040)',
      color: '#ffffff',
      border: '1px solid transparent',
    },
    secondary: {
      background: 'var(--color-card, #ffffff)',
      color: 'var(--color-text)',
      border: '1px solid var(--color-border)',
    },
    'link-gray': {
      background: 'transparent',
      color: 'var(--color-muted)',
      border: '1px solid transparent',
      padding: '0',
    },
    'link-color': {
      background: 'transparent',
      color: 'var(--color-500, #BF4040)',
      border: '1px solid transparent',
      padding: '0',
    },
  }[color] || {
    background: 'var(--color-card)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  }

  const isLink = color.startsWith('link-')

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center font-semibold rounded-[5px] transition-all cursor-pointer select-none outline-none ${
        isLink
          ? 'hover:underline active:opacity-80'
          : 'shadow-xs hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98]'
      } ${!isLink ? sizeClasses : ''} ${className}`}
      style={colorStyles}
      {...props}
    >
      {renderIcon(IconLeading, { size: 14, className: 'shrink-0 mr-1.5' })}
      {children}
      {renderIcon(IconTrailing, { size: 14, className: 'shrink-0 ml-1.5' })}
    </button>
  )
}

// ── Base Table & TableCard Components ──────────────────────────────────────
export const TableCard = {
  Root: ({ children, className = '', ...props }) => (
    <div
      className={`w-full rounded-[8px] border shadow-xs overflow-hidden flex flex-col ${className}`}
      style={{
        background: 'var(--color-card)',
        borderColor: 'var(--color-border)',
      }}
      {...props}
    >
      {children}
    </div>
  ),
}

export const Table = Object.assign(
  ({ children, className = '', sortDescriptor, onSortChange, ...props }) => {
    return (
      <div className="w-full overflow-x-auto">
        <table className={`w-full text-left border-collapse text-xs ${className}`} {...props}>
          {children}
        </table>
      </div>
    )
  },
  {
    Header: ({ children, className = '' }) => (
      <thead
        className={`border-b select-none ${className}`}
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <tr>{children}</tr>
      </thead>
    ),

    Head: ({ id, label, isRowHeader, allowsSorting, onSort, sortDescriptor, className = '', children, ...props }) => {
      const isSorted = sortDescriptor?.column === id
      const isAsc = isSorted && sortDescriptor?.direction === 'ascending'

      return (
        <th
          scope={isRowHeader ? 'row' : 'col'}
          onClick={() => {
            if (allowsSorting && onSort) {
              onSort(id)
            }
          }}
          className={`px-4 py-3 font-semibold uppercase tracking-wider text-[11px] text-[var(--color-muted)] ${
            allowsSorting ? 'cursor-pointer hover:text-[var(--color-text)] transition-colors' : ''
          } ${className}`}
          {...props}
        >
          <div className="flex items-center gap-1.5">
            <span>{label || children}</span>
            {allowsSorting && isSorted && (
              <span className="shrink-0 text-[var(--color-500,#BF4040)]">
                {isAsc ? <ArrowUp size={12} strokeWidth={2.5} /> : <ArrowDown size={12} strokeWidth={2.5} />}
              </span>
            )}
          </div>
        </th>
      )
    },

    Body: ({ items = [], children, className = '' }) => {
      return (
        <tbody className={`divide-y divide-[var(--color-border)] ${className}`}>
          {typeof children === 'function' ? items.map((item, idx) => children(item, idx)) : children}
        </tbody>
      )
    },

    Row: ({ id, children, className = '', ...props }) => (
      <tr
        className={`transition-colors hover:bg-black/2.5 dark:hover:bg-white/2.5 ${className}`}
        {...props}
      >
        {children}
      </tr>
    ),

    Cell: ({ children, className = '', ...props }) => (
      <td
        className={`px-4 py-3.5 text-xs text-[var(--color-text)] align-middle ${className}`}
        {...props}
      >
        {children}
      </td>
    ),
  }
)

// ── Base Pagination Minimal Component ──────────────────────────────────────
export const PaginationPageMinimalCenter = ({
  page = 1,
  total = 10,
  onPageChange,
  className = '',
}) => {
  const [currentPage, setCurrentPage] = useState(page)

  const handlePrev = () => {
    const next = Math.max(1, currentPage - 1)
    setCurrentPage(next)
    onPageChange?.(next)
  }

  const handleNext = () => {
    const next = Math.min(total, currentPage + 1)
    setCurrentPage(next)
    onPageChange?.(next)
  }

  return (
    <div
      className={`border-t flex items-center justify-between gap-4 text-xs font-medium ${className}`}
      style={{ borderColor: 'var(--color-border)' }}
    >
      <Button
        size="sm"
        color="secondary"
        onClick={handlePrev}
        disabled={currentPage === 1}
        iconLeading={ChevronLeft}
        className="disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Previous
      </Button>

      <span className="text-[var(--color-muted)] font-medium select-none">
        Page <span className="font-bold text-[var(--color-text)]">{currentPage}</span> of{' '}
        <span className="font-bold text-[var(--color-text)]">{total}</span>
      </span>

      <Button
        size="sm"
        color="secondary"
        onClick={handleNext}
        disabled={currentPage === total}
        iconTrailing={ChevronRight}
        className="disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
      </Button>
    </div>
  )
}

// ── Default Mock Invoices Data ─────────────────────────────────────────────
export const defaultInvoices = {
  items: [
    {
      id: "INV-001",
      date: "2026-08-30",
      status: "paid",
      customer: {
        name: "Olivia Rhye",
        email: "olivia@pos.com",
        avatarUrl: "",
      },
      purchase: "Grilled Salmon Steak (x2)",
    },
    {
      id: "INV-002",
      date: "2026-08-29",
      status: "paid",
      customer: {
        name: "Phoenix Baker",
        email: "phoenix@pos.com",
        avatarUrl: "",
      },
      purchase: "Truffle Mushroom Pizza (x1)",
    },
    {
      id: "INV-003",
      date: "2026-08-28",
      status: "refunded",
      customer: {
        name: "Lana Steiner",
        email: "lana@pos.com",
        avatarUrl: "",
      },
      purchase: "Iced Caramel Macchiato (x3)",
    },
    {
      id: "INV-004",
      date: "2026-08-27",
      status: "cancelled",
      customer: {
        name: "Demi Wilkinson",
        email: "demi@pos.com",
        avatarUrl: "",
      },
      purchase: "Spicy Tom Yum Soup (x1)",
    },
    {
      id: "INV-005",
      date: "2026-08-26",
      status: "paid",
      customer: {
        name: "Candice Wu",
        email: "candice@pos.com",
        avatarUrl: "",
      },
      purchase: "Crispy Fried Chicken (x2)",
    },
  ],
}

// ── Table03DividerLine Component ───────────────────────────────────────────
export const Table03DividerLine = ({ data = defaultInvoices }) => {
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "id",
    direction: "ascending",
  })

  const sortedItems = useMemo(() => {
    const list = [...(data?.items || [])]
    return list.sort((a, b) => {
      let first = a[sortDescriptor.column]
      let second = b[sortDescriptor.column]

      if (sortDescriptor.column === 'customer') {
        first = a.customer?.name || ''
        second = b.customer?.name || ''
      }

      if (
        (typeof first === 'number' && typeof second === 'number') ||
        (typeof first === 'boolean' && typeof second === 'boolean')
      ) {
        return sortDescriptor.direction === 'descending' ? second - first : first - second
      }

      if (typeof first === 'string' && typeof second === 'string') {
        let cmp = first.localeCompare(second)
        if (sortDescriptor.direction === 'descending') {
          cmp *= -1
        }
        return cmp
      }

      return 0
    })
  }, [data, sortDescriptor])

  const handleSort = (columnId) => {
    setSortDescriptor((prev) => ({
      column: columnId,
      direction:
        prev.column === columnId && prev.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }))
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <TableCard.Root>
      <Table aria-label="Team members" sortDescriptor={sortDescriptor}>
        <Table.Header>
          <Table.Head
            id="id"
            label="Invoice"
            isRowHeader
            allowsSorting
            sortDescriptor={sortDescriptor}
            onSort={handleSort}
          />
          <Table.Head
            id="date"
            label="Date"
            allowsSorting
            sortDescriptor={sortDescriptor}
            onSort={handleSort}
          />
          <Table.Head
            id="status"
            label="Status"
            allowsSorting
            sortDescriptor={sortDescriptor}
            onSort={handleSort}
          />
          <Table.Head
            id="customer"
            label="Customer"
            allowsSorting
            sortDescriptor={sortDescriptor}
            onSort={handleSort}
          />
          <Table.Head
            id="purchase"
            label="Purchase"
            className="hidden md:table-cell"
          />
          <Table.Head id="actions" className="text-right">
            Actions
          </Table.Head>
        </Table.Header>

        <Table.Body items={sortedItems}>
          {(item) => (
            <Table.Row key={item.id} id={item.id}>
              <Table.Cell className="font-bold text-[var(--color-500,#BF4040)]">
                #{item.id}
              </Table.Cell>

              <Table.Cell className="whitespace-nowrap font-medium text-[var(--color-muted)]">
                {new Date(item.date).toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Table.Cell>

              <Table.Cell>
                {item.status === 'paid' ? (
                  <BadgeWithIcon size="sm" color="success" iconLeading={Check} className="capitalize font-semibold">
                    {item.status}
                  </BadgeWithIcon>
                ) : item.status === 'refunded' ? (
                  <BadgeWithIcon size="sm" color="gray" iconLeading={ReverseLeft} className="capitalize font-semibold">
                    {item.status}
                  </BadgeWithIcon>
                ) : (
                  <BadgeWithIcon size="sm" color="error" iconLeading={X} className="capitalize font-semibold">
                    {item.status}
                  </BadgeWithIcon>
                )}
              </Table.Cell>

              <Table.Cell>
                <div className="flex items-center gap-3">
                  <Avatar
                    initials={getInitials(item.customer.name)}
                    src={item.customer.avatarUrl}
                    alt={item.customer.name}
                    size="sm"
                  />
                  <div className="whitespace-nowrap">
                    <p className="text-xs font-bold text-[var(--color-text)]">{item.customer.name}</p>
                    <p className="text-[11px] text-[var(--color-muted)]">{item.customer.email}</p>
                  </div>
                </div>
              </Table.Cell>

              <Table.Cell className="whitespace-nowrap hidden md:table-cell font-medium">
                {item.purchase}
              </Table.Cell>

              <Table.Cell>
                <TableActionButtons
                  onEdit={() => console.log('Edit order', item)}
                  onDelete={() => console.log('Delete order', item)}
                  confirmDelete={`Are you sure you want to delete order #${item.id}?`}
                />
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>

      <PaginationPageMinimalCenter
        page={1}
        total={10}
        className="px-4 py-3 md:px-6 md:pt-3 md:pb-4"
      />
    </TableCard.Root>
  )
}
