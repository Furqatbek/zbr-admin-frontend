import type { CreateOrderItemRequest, ItemOption, MenuItem } from '@/types'

/**
 * Helpers for menu item sizes (variants) and add-ons (options).
 *
 * The backend validates only that each variantId/optionId belongs to the menu
 * item. It does NOT enforce `required` groups, `maxSelections`, or `inStock` —
 * so the client is the only thing preventing a ticket the kitchen cannot cook.
 * That is why the rules live here, in one tested place.
 */

export const UNGROUPED = 'Прочее'

/** Add-ons are grouped by `groupName`; `required`/`maxSelections` describe the group rule. */
export function groupOptions(options: ItemOption[]): [string, ItemOption[]][] {
  const groups = new Map<string, ItemOption[]>()
  for (const option of options) {
    const key = option.groupName || UNGROUPED
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(option)
  }
  return Array.from(groups.entries())
}

/** Max selections for a group (the rule is carried on its members; default 1). */
export function groupMax(group: ItemOption[]): number {
  return group[0]?.maxSelections ?? 1
}

/**
 * Options to preselect for a freshly chosen item: `isDefault` marks them, but
 * never preselect a sold-out one or more than the group's cap allows.
 */
export function defaultOptionIds(item?: MenuItem): number[] {
  if (!item?.options?.length) return []
  return groupOptions(item.options).flatMap(([, opts]) =>
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
  const base = item.effectivePrice ?? item.price
  const variantDelta = item.variants?.find((v) => v.id === line.variantId)?.priceDelta ?? 0
  const optionsDelta = (item.options ?? [])
    .filter((o) => line.optionIds?.includes(o.id))
    .reduce((sum, o) => sum + o.priceDelta, 0)
  return (base + variantDelta + optionsDelta) * (line.quantity || 0)
}

/**
 * Everything wrong with a line, as operator-readable messages. Empty = safe to
 * submit. Covers the three rules the backend accepts silently.
 */
export function validateLine(item: MenuItem | undefined, line: OrderLine): string[] {
  if (!item) return []
  const issues: string[] = []

  for (const [groupName, opts] of groupOptions(item.options ?? [])) {
    const max = groupMax(opts)
    const chosen = opts.filter((o) => line.optionIds?.includes(o.id)).length
    if (opts[0].required && chosen === 0) issues.push(`«${groupName}»: нужно выбрать вариант`)
    if (chosen > max) issues.push(`«${groupName}»: максимум ${max}`)
  }

  const variant = item.variants?.find((v) => v.id === line.variantId)
  if (variant && !variant.inStock) issues.push(`Размер «${variant.name}» нет в наличии`)

  for (const option of item.options ?? []) {
    if (line.optionIds?.includes(option.id) && !option.inStock) {
      issues.push(`Добавка «${option.name}» нет в наличии`)
    }
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
