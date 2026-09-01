import { useState, isValidElement } from 'react'
import {
  ChevronDown,
  Plus,
  SearchLg,
  Check,
  ChevronRight
} from '@untitledui/icons'
import {
  MenuTrigger,
  Popover,
  Menu,
  MenuItem,
  SubmenuTrigger,
  SearchField,
  Input,
  Button as AriaButton,
  Autocomplete,
  useFilter
} from 'react-aria-components'

// ── Base Reusable Button Component ──
export const Button = ({
  size = 'md',
  color = 'secondary',
  iconLeading: IconLeading,
  iconTrailing: IconTrailing,
  className = '',
  children,
  ...props
}) => {
  const sizeClasses = {
    xs: 'px-2.5 py-1 text-[11px] font-semibold gap-1.5',
    sm: 'px-3 py-1.5 text-xs font-semibold gap-2',
    md: 'px-3.5 py-2 text-xs font-semibold gap-2',
    lg: 'px-4 py-2.5 text-sm font-semibold gap-2.5'
  }[size] || 'px-3 py-1.5 text-xs font-semibold gap-2'

  const colorStyles =
    color === 'primary'
      ? {
          background: 'var(--color-500, #BF4040)',
          color: '#ffffff',
          borderColor: 'transparent'
        }
      : {
          background: 'var(--color-card, #ffffff)',
          color: 'var(--color-text)',
          borderColor: 'var(--color-border)'
        }

  return (
    <AriaButton
      className={`inline-flex items-center justify-center rounded-[5px] border font-medium transition-all shadow-xs cursor-pointer select-none hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-500,#BF4040)]/30 ${sizeClasses} ${className}`}
      style={colorStyles}
      {...props}
    >
      {renderIcon(IconLeading, { size: 14, className: 'shrink-0' })}
      {children}
      {renderIcon(IconTrailing, { size: 14, className: 'shrink-0' })}
    </AriaButton>
  )
}

// ── Base Input Component with Icon ──
export const InputBase = ({
  size = 'md',
  placeholder = 'Search',
  icon: Icon,
  value,
  onChange,
  className = '',
  ...props
}) => {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      {Icon && (
        <div className="absolute left-2.5 text-[var(--color-muted)] pointer-events-none flex items-center justify-center">
          <Icon size={15} />
        </div>
      )}
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[5px] outline-none transition-all placeholder:text-[var(--color-muted)] text-[var(--color-text)] focus:border-[var(--color-500,#BF4040)] focus:ring-1 focus:ring-[var(--color-500,#BF4040)] ${
          Icon ? 'pl-8 pr-3' : 'px-3'
        } ${size === 'sm' ? 'py-1 text-xs' : 'py-1.5 text-xs'}`}
        {...props}
      />
    </div>
  )
}

// ── Base Dropdown Namespace ──
export const Dropdown = {
  Root: MenuTrigger,
  Popover: ({ className = '', children, placement = 'bottom start', offset = 6, ...props }) => (
    <Popover
      placement={placement}
      offset={offset}
      className={`rounded-[6px] border shadow-xl backdrop-blur-md overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 ${className}`}
      style={{
        background: 'var(--color-surface, #ffffff)',
        borderColor: 'var(--color-border)'
      }}
      {...props}
    >
      {children}
    </Popover>
  ),
  Menu: ({ className = '', children, ...props }) => (
    <Menu
      className={`p-1.5 space-y-0.5 outline-none max-h-64 overflow-y-auto ${className}`}
      {...props}
    >
      {children}
    </Menu>
  ),
  Item: ({ id, textValue, selectionIndicator, avatarUrl, className = '', children, ...props }) => (
    <MenuItem
      id={id}
      textValue={textValue || (typeof children === 'string' ? children : undefined)}
      className={({ isFocused, isDisabled }) =>
        `flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer select-none rounded-[4px] outline-none transition-colors ${
          isFocused ? 'bg-black/5 dark:bg-white/5' : ''
        } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`
      }
      {...props}
    >
      {({ isSelected, hasSubmenu }) => (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            {selectionIndicator === 'checkbox' && (
              <div
                className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[var(--color-500,#BF4040)] border-[var(--color-500,#BF4040)] text-white'
                    : 'border-[var(--color-border)] bg-[var(--color-bg)]'
                }`}
              >
                {isSelected && <Check size={11} strokeWidth={3} />}
              </div>
            )}
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt=""
                className="w-5 h-5 rounded-full object-cover shrink-0 border border-black/10 dark:border-white/10"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            )}
            <span className="truncate" style={{ color: 'var(--color-text)' }}>
              {children}
            </span>
          </div>
          {hasSubmenu && (
            <ChevronRight size={13} className="shrink-0 text-[var(--color-muted)] ml-2" />
          )}
        </div>
      )}
    </MenuItem>
  )
}

// ── DropdownSearchAdvanced Component ──
export const DropdownSearchAdvanced = () => {
  const [selectedUsers, setSelectedUsers] = useState(new Set(['untitledui', 'shutterframe']))
  const { contains } = useFilter({ sensitivity: 'base' })

  return (
    <Dropdown.Root>
      <Button
        size="sm"
        className="group"
        color="secondary"
        iconTrailing={(props) => (
          <ChevronDown
            data-icon="trailing"
            {...props}
            className="w-4 h-4 stroke-[2.25px]"
          />
        )}
      >
        Manage access
      </Button>

      <Dropdown.Popover className="w-60">
        <Autocomplete filter={contains}>
          <SearchField
            aria-label="Search items"
            className="flex gap-3 border-b p-2.5"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <InputBase size="md" placeholder="Search" icon={SearchLg} />
          </SearchField>

          <Dropdown.Menu
            selectionMode="multiple"
            selectedKeys={selectedUsers}
            onSelectionChange={setSelectedUsers}
          >
            <SubmenuTrigger>
              <Dropdown.Item id="untitledui" textValue="Olivia Rhye" selectionIndicator="checkbox">
                Untitled UI
              </Dropdown.Item>
              <Dropdown.Popover placement="right top" offset={-6} className="w-52">
                <Dropdown.Menu selectionMode="multiple">
                  <Dropdown.Item
                    id="olivia"
                    selectionIndicator="checkbox"
                    avatarUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  >
                    Olivia Rhye
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="phoenix"
                    selectionIndicator="checkbox"
                    avatarUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  >
                    Phoenix Baker
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="lana"
                    selectionIndicator="checkbox"
                    avatarUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                  >
                    Lana Steiner
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="demi"
                    selectionIndicator="checkbox"
                    avatarUrl="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                  >
                    Demi Wilkinson
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </SubmenuTrigger>

            <Dropdown.Item id="shutterframe" textValue="Phoenix Baker" selectionIndicator="checkbox">
              Shutterframe
            </Dropdown.Item>
            <Dropdown.Item id="warpspeed" textValue="Lana Steiner" selectionIndicator="checkbox">
              Warpspeed
            </Dropdown.Item>
            <Dropdown.Item id="contrastai" textValue="Demi Wilkinson" selectionIndicator="checkbox">
              ContrastAI
            </Dropdown.Item>
            <Dropdown.Item id="launchsimple" textValue="Candice Wu" selectionIndicator="checkbox">
              LaunchSimple
            </Dropdown.Item>
            <Dropdown.Item id="elasticware" textValue="Natali Craig" selectionIndicator="checkbox">
              Elasticware
            </Dropdown.Item>
          </Dropdown.Menu>

          <div
            className="flex flex-col gap-3 border-t p-2.5"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <Button size="xs" color="secondary" iconLeading={Plus} className="w-full">
              Create team
            </Button>
          </div>
        </Autocomplete>
      </Dropdown.Popover>
    </Dropdown.Root>
  )
}

export default DropdownSearchAdvanced
