import type { CreateOrderItemRequest, ItemOption, ItemVariant, MenuItem } from '@/types'

/**
 * Rules for menu item sizes (variants) and add-ons (options).
 *
 * The server enforces these too and refuses an order that breaks one, so the
 * point of validating here is to catch it before submit rather than two screens
 * later. Where `required`/`maxSelections` disagree across options in a group
 * (they are stored per option but describe the group) the server takes the
 * STRICTEST value — so we must too, or we would build orders it then refuses.
 */

export const UNGROUPED = 'Прочее'

/** Withdrawn (`active: false`) choices are hidden; sold-out ones are shown disabled. */
export function visibleVariants(item?: MenuItem): ItemVariant[] {
  return (item?.variants ?? []).filter((v) => v.active !== false)
}

export function visibleOptions(item?: MenuItem): ItemOption[] {
  return (item?.options ?? []).filter((o) => o.active !== false)
}

/** Add-ons are grouped by `groupName`. */
export function groupOptions(options: ItemOption[]): [string, ItemOption[]][] {
  const groups = new Map<string, ItemOption[]>()
  for (const option of options) {
    const key = option.groupName || UNGROUPED
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(option)
  }
  return Array.from(groups.entries())
}

/** Strictest cap in the group — the smallest maxSelections, defaulting to 1. */
export function groupMax(group: ItemOption[]): number {
  const caps = group.map((o) => o.maxSelections ?? 1)
  return caps.length > 0 ? Math.min(...caps) : 1
}

/** Strictest requirement — required if ANY option in the group says so. */
export function groupRequired(group: ItemOption[]): boolean {
  return group.some((o) => o.required)
}

/** The price actually charged for an item before add-ons. */
export function basePrice(item: MenuItem): number {
  return item.effectivePrice ?? item.price
}

/**
 * Display price of a size. Derived from `effectivePrice + priceDelta` rather
 * than the server's `totalPrice`, so what is shown always equals what is
 * charged even when the item is on sale.
 */
export function variantPrice(item: MenuItem, variant: ItemVariant): number {
  return basePrice(item) + variant.priceDelta
}

/** Preselect the first in-stock size; a dish with sizes requires one. */
export function defaultVariantId(item?: MenuItem): number | undefined {
  return visibleVariants(item).find((v) => v.inStock)?.id
}

/**
 * Options to preselect: `isDefault` marks them, but never preselect a sold-out
 * one or more than the group's (strictest) cap allows.
 */
export function defaultOptionIds(item?: MenuItem): number[] {
  const options = visibleOptions(item)
  if (options.length === 0) return []
  return groupOptions(options).flatMap(([, opts]) =>
    opts
      .filter((o) => o.isDefault && o.inStock)
      .slice(0, groupMax(opts))
      .map((o) => o.id)
  )
}

type OrderLine = Pick<CreateOrderItemRequest, 'quantity' | 'variantId' | 'optionIds'>

/**
 * Line price, matching the server's arithmetic exactly:
 *   (effectivePrice + variantPriceDelta + sum of option priceDeltas) x quantity
 */
export function lineTotal(item: MenuItem | undefined, line: OrderLine): number {
  if (!item) return 0
  const variantDelta = item.variants?.find((v) => v.id === line.variantId)?.priceDelta ?? 0
  const optionsDelta = (item.options ?? [])
    .filter((o) => line.optionIds?.includes(o.id))
    .reduce((sum, o) => sum + o.priceDelta, 0)
  return (basePrice(item) + variantDelta + optionsDelta) * (line.quantity || 0)
}

/** An option id can appear in two groups; sending it twice is refused. */
export function dedupeOptionIds(ids?: number[]): number[] {
  return Array.from(new Set(ids ?? []))
}

/**
 * Everything the server would refuse this line for, as operator-readable
 * messages. Empty = safe to submit.
 */
export function validateLine(item: MenuItem | undefined, line: OrderLine): string[] {
  if (!item) return []
  const issues: string[] = []

  // A dish that has sizes needs one chosen — including when they are all sold
  // out, in which case the dish simply cannot be ordered.
  const variants = visibleVariants(item)
  if (variants.length > 0 && !line.variantId) {
    issues.push(`Выберите размер: ${variants.map((v) => v.name).join(', ')}`)
  }

  const options = visibleOptions(item)
  for (const [groupName, opts] of groupOptions(options)) {
    const max = groupMax(opts)
    const chosen = opts.filter((o) => line.optionIds?.includes(o.id)).length
    if (groupRequired(opts) && chosen === 0) issues.push(`«${groupName}»: нужно выбрать вариант`)
    if (chosen > max) issues.push(`«${groupName}»: максимум ${max}`)
  }

  const variant = item.variants?.find((v) => v.id === line.variantId)
  if (variant && (!variant.inStock || variant.active === false)) {
    issues.push(`Размер «${variant.name}» недоступен`)
  }

  for (const option of item.options ?? []) {
    if (line.optionIds?.includes(option.id) && (!option.inStock || option.active === false)) {
      issues.push(`Добавка «${option.name}» недоступна`)
    }
  }

  if (dedupeOptionIds(line.optionIds).length !== (line.optionIds?.length ?? 0)) {
    issues.push('Одна и та же добавка выбрана дважды')
  }

  return issues
}

/**
 * Apply a click on an add-on, honouring the group rule: a cap of 1 behaves like
 * a radio (replaces the group's selection), otherwise it toggles up to the cap.
 */
export function toggleOption(
  selected: number[],
  option: ItemOption,
  group: ItemOption[]
): number[] {
  const groupIds = group.map((o) => o.id)
  if (selected.includes(option.id)) return selected.filter((id) => id !== option.id)

  const max = groupMax(group)
  if (max === 1) return [...selected.filter((id) => !groupIds.includes(id)), option.id]

  const chosenInGroup = selected.filter((id) => groupIds.includes(id)).length
  if (chosenInGroup >= max) return selected
  return [...selected, option.id]
}
