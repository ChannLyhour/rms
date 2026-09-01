import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { Plus, Minus, ChevronRight, ChevronDown } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Headless Tree Feature Constants & Helpers
// ─────────────────────────────────────────────────────────────────────────────
export const hotkeysCoreFeature = { name: 'hotkeysCoreFeature' }
export const syncDataLoaderFeature = { name: 'syncDataLoaderFeature' }
export const selectionFeature = { name: 'selectionFeature' }

// ─────────────────────────────────────────────────────────────────────────────
// Tree Context
// ─────────────────────────────────────────────────────────────────────────────
const TreeContext = createContext({
  tree: null,
  indent: 24,
  toggleIconType: 'plus-minus',
})

export function useTreeContext() {
  return useContext(TreeContext)
}

// ─────────────────────────────────────────────────────────────────────────────
// useTree Hook
// ─────────────────────────────────────────────────────────────────────────────
export function useTree({
  initialState = {},
  indent = 24,
  rootItemId = 'root',
  getItemName = (item) => item.getItemData()?.name || item.getId(),
  isItemFolder = (item) => (item.getItemData()?.children?.length ?? 0) > 0,
  dataLoader = {
    getItem: (id) => null,
    getChildren: (id) => [],
  },
  features = [],
} = {}) {
  const [expandedItems, setExpandedItems] = useState(
    () => new Set(initialState.expandedItems || [])
  )

  const isItemExpanded = useCallback(
    (id) => expandedItems.has(id),
    [expandedItems]
  )

  const toggleExpandedState = useCallback((id) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const expand = useCallback((id) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const collapse = useCallback((id) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const expandAll = useCallback((ids) => {
    if (ids && Array.isArray(ids)) {
      setExpandedItems(new Set(ids))
    }
  }, [])

  const collapseAll = useCallback(() => {
    setExpandedItems(new Set())
  }, [])

  const createTreeItemObject = useCallback(
    (id, level = 0) => {
      const data = dataLoader.getItem(id)
      const childrenIds = dataLoader.getChildren(id) || []

      const itemObj = {
        getId: () => id,
        getItemData: () => data,
        getItemName: () => (getItemName ? getItemName(itemObj) : data?.name || id),
        isFolder: () => {
          if (isItemFolder) {
            return Boolean(isItemFolder(itemObj))
          }
          return childrenIds.length > 0
        },
        isExpanded: () => expandedItems.has(id),
        getItemLevel: () => level,
        toggleExpandedState: () => toggleExpandedState(id),
        expand: () => expand(id),
        collapse: () => collapse(id),
      }

      return itemObj
    },
    [dataLoader, getItemName, isItemFolder, expandedItems, toggleExpandedState, expand, collapse]
  )

  const getItems = useCallback(() => {
    const list = []

    const traverse = (parentId, level) => {
      const childIds = dataLoader.getChildren(parentId) || []
      for (const childId of childIds) {
        const itemObj = createTreeItemObject(childId, level)
        list.push(itemObj)

        if (itemObj.isFolder() && expandedItems.has(childId)) {
          traverse(childId, level + 1)
        }
      }
    }

    // Traverse root children
    traverse(rootItemId, 0)
    return list
  }, [rootItemId, dataLoader, createTreeItemObject, expandedItems])

  return useMemo(
    () => ({
      getItems,
      expandedItems: Array.from(expandedItems),
      isItemExpanded,
      toggleExpandedState,
      expand,
      collapse,
      expandAll,
      collapseAll,
      setExpandedItems,
      indent,
      rootItemId,
    }),
    [getItems, expandedItems, isItemExpanded, toggleExpandedState, expand, collapse, expandAll, collapseAll, setExpandedItems, indent, rootItemId]
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tree Components
// ─────────────────────────────────────────────────────────────────────────────

export function Tree({
  tree,
  indent = 24,
  toggleIconType = 'plus-minus', // 'plus-minus' | 'chevron'
  className = '',
  children,
  ...props
}) {
  const contextValue = useMemo(
    () => ({
      tree,
      indent,
      toggleIconType,
    }),
    [tree, indent, toggleIconType]
  )

  return (
    <TreeContext.Provider value={contextValue}>
      <div
        role="tree"
        className={`w-full select-none font-sans text-sm ${className}`}
        {...props}
      >
        {children}
      </div>
    </TreeContext.Provider>
  )
}

export function TreeItem({
  item,
  className = '',
  children,
  onClick,
  onKeyDown,
  ...props
}) {
  const { indent, toggleIconType } = useTreeContext()
  const isFolder = item?.isFolder ? item.isFolder() : false
  const isExpanded = item?.isExpanded ? item.isExpanded() : false
  const level = item?.getItemLevel ? item.getItemLevel() : 0

  const handleClick = (e) => {
    if (onClick) onClick(e)
    if (!e.defaultPrevented && isFolder && item?.toggleExpandedState) {
      item.toggleExpandedState()
    }
  }

  const handleKeyDown = (e) => {
    if (onKeyDown) onKeyDown(e)
    if (!e.defaultPrevented) {
      if (e.key === 'Enter' || e.key === ' ') {
        if (isFolder && item?.toggleExpandedState) {
          e.preventDefault()
          item.toggleExpandedState()
        }
      } else if (e.key === 'ArrowRight') {
        if (isFolder && !isExpanded && item?.expand) {
          e.preventDefault()
          item.expand()
        }
      } else if (e.key === 'ArrowLeft') {
        if (isFolder && isExpanded && item?.collapse) {
          e.preventDefault()
          item.collapse()
        }
      }
    }
  }

  return (
    <div
      role="treeitem"
      tabIndex={0}
      aria-expanded={isFolder ? isExpanded : undefined}
      data-folder={isFolder ? 'true' : undefined}
      data-expanded={isExpanded ? 'true' : undefined}
      data-level={level}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{ paddingLeft: `${level * indent}px` }}
      className={`group flex min-h-[32px] items-center gap-1.5 py-1 px-1.5 rounded-md text-sm text-slate-800 dark:text-slate-200 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600 cursor-pointer ${className}`}
      {...props}
    >
      {/* Folder Expand/Collapse Icon */}
      {isFolder ? (
        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation()
            if (item?.toggleExpandedState) {
              item.toggleExpandedState()
            }
          }}
          className="inline-flex size-4 shrink-0 items-center justify-center rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {toggleIconType === 'plus-minus' ? (
            isExpanded ? (
              <Minus className="size-3.5 stroke-[2.5]" />
            ) : (
              <Plus className="size-3.5 stroke-[2.5]" />
            )
          ) : (
            isExpanded ? (
              <ChevronDown className="size-3.5 stroke-[2]" />
            ) : (
              <ChevronRight className="size-3.5 stroke-[2]" />
            )
          )}
        </button>
      ) : null}

      {children}
    </div>
  )
}

export function TreeItemLabel({
  className = '',
  children,
  ...props
}) {
  return (
    <div
      className={`flex items-center gap-2 grow truncate text-sm font-medium leading-none ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Tree
