import { describe, it, expect } from 'vitest'
import {
  groupOptions,
  groupMax,
  defaultOptionIds,
  lineTotal,
  validateLine,
  toggleOption,
  UNGROUPED,
} from '../menu'
import type { ItemOption, ItemVariant, MenuItem } from '@/types'

const option = (o: Partial<ItemOption> & { id: number; name: string }): ItemOption => ({
  groupName: 'Sauce',
  priceDelta: 0,
  isDefault: false,
  required: false,
  maxSelections: 1,
  inStock: true,
  ...o,
})

const variant = (v: Partial<ItemVariant> & { id: number; name: string }): ItemVariant => ({
  priceDelta: 0,
  inStock: true,
  ...v,
})

// The doc's worked example: Lavash 30000 with Large (+8000) and Cheese (+5000).
const lavash: MenuItem = {
  id: 4417,
  categoryId: 6,
  name: 'Lavash',
  price: 30000,
  effectivePrice: 30000,
  inStock: true,
  featured: false,
  variants: [
    variant({ id: 11, name: 'Regular', priceDelta: 0 }),
    variant({ id: 12, name: 'Large', priceDelta: 8000, inStock: false }),
  ],
  options: [
    option({ id: 51, name: 'Garlic', isDefault: true, required: true }),
    option({ id: 52, name: 'Spicy', required: true }),
    option({ id: 60, groupName: 'Extras', name: 'Cheese', priceDelta: 5000, maxSelections: 3 }),
    option({ id: 61, groupName: 'Extras', name: 'Bacon', priceDelta: 7000, maxSelections: 3 }),
  ],
}

describe('groupOptions', () => {
  it('groups add-ons by groupName', () => {
    const groups = groupOptions(lavash.options!)
    expect(groups.map(([name]) => name)).toEqual(['Sauce', 'Extras'])
    expect(groups[0][1]).toHaveLength(2)
  })

  it('falls back to a single bucket when groupName is absent', () => {
    const [[name]] = groupOptions([option({ id: 1, name: 'X', groupName: undefined })])
    expect(name).toBe(UNGROUPED)
  })

  it('reads the group cap from its members, defaulting to 1', () => {
    expect(groupMax([option({ id: 1, name: 'X', maxSelections: 3 })])).toBe(3)
    expect(groupMax([option({ id: 1, name: 'X', maxSelections: undefined })])).toBe(1)
  })
})

describe('lineTotal', () => {
  it('matches the documented formula', () => {
    // (30000 + 8000 + 0 + 5000) x 2 = 86000
    const total = lineTotal(lavash, { quantity: 2, variantId: 12, optionIds: [52, 60] })
    expect(total).toBe(86000)
  })

  it('works with no variant and no options', () => {
    expect(lineTotal(lavash, { quantity: 1 })).toBe(30000)
  })

  it('prefers effectivePrice over price', () => {
    const item = { ...lavash, price: 30000, effectivePrice: 25000 }
    expect(lineTotal(item, { quantity: 1 })).toBe(25000)
  })

  it('is zero for an unknown item', () => {
    expect(lineTotal(undefined, { quantity: 3 })).toBe(0)
  })
})

describe('defaultOptionIds', () => {
  it('preselects isDefault add-ons', () => {
    expect(defaultOptionIds(lavash)).toEqual([51])
  })

  it('never preselects a sold-out default', () => {
    const item = { ...lavash, options: [option({ id: 9, name: 'Gone', isDefault: true, inStock: false })] }
    expect(defaultOptionIds(item)).toEqual([])
  })

  it('never preselects more than the group cap', () => {
    const item = {
      ...lavash,
      options: [
        option({ id: 1, name: 'A', isDefault: true, maxSelections: 1 }),
        option({ id: 2, name: 'B', isDefault: true, maxSelections: 1 }),
      ],
    }
    expect(defaultOptionIds(item)).toEqual([1])
  })
})

describe('validateLine — the rules the backend does NOT enforce', () => {
  it('flags a required group with nothing chosen', () => {
    const issues = validateLine(lavash, { quantity: 1, optionIds: [] })
    expect(issues.some((i) => i.includes('Sauce'))).toBe(true)
  })

  it('accepts a required group once chosen', () => {
    const issues = validateLine(lavash, { quantity: 1, optionIds: [51] })
    expect(issues).toEqual([])
  })

  it('flags exceeding maxSelections', () => {
    const item = {
      ...lavash,
      options: [
        option({ id: 1, groupName: 'Extras', name: 'A', required: false, maxSelections: 1 }),
        option({ id: 2, groupName: 'Extras', name: 'B', required: false, maxSelections: 1 }),
      ],
    }
    const issues = validateLine(item, { quantity: 1, optionIds: [1, 2] })
    expect(issues.some((i) => i.includes('максимум 1'))).toBe(true)
  })

  it('flags a sold-out variant', () => {
    const issues = validateLine(lavash, { quantity: 1, variantId: 12, optionIds: [51] })
    expect(issues.some((i) => i.includes('Large'))).toBe(true)
  })

  it('flags a sold-out add-on', () => {
    const item = {
      ...lavash,
      options: [option({ id: 70, groupName: 'Extras', name: 'Truffle', inStock: false })],
    }
    const issues = validateLine(item, { quantity: 1, optionIds: [70] })
    expect(issues.some((i) => i.includes('Truffle'))).toBe(true)
  })
})

describe('toggleOption', () => {
  const sauce = lavash.options!.filter((o) => o.groupName === 'Sauce')
  const extras = lavash.options!.filter((o) => o.groupName === 'Extras')

  it('replaces the selection in a cap-1 group (radio behaviour)', () => {
    expect(toggleOption([51], sauce[1], sauce)).toEqual([52])
  })

  it('toggles off an already-selected option', () => {
    expect(toggleOption([51], sauce[0], sauce)).toEqual([])
  })

  it('accumulates up to the cap in a multi-select group', () => {
    expect(toggleOption([60], extras[1], extras)).toEqual([60, 61])
  })

  it('refuses to exceed the cap in a multi-select group', () => {
    // Cap of 2, already two chosen -> a third is ignored. (A cap of 1 is a
    // radio group instead, covered above: it replaces rather than refuses.)
    const three = [
      option({ id: 1, groupName: 'Extras', name: 'A', maxSelections: 2 }),
      option({ id: 2, groupName: 'Extras', name: 'B', maxSelections: 2 }),
      option({ id: 3, groupName: 'Extras', name: 'C', maxSelections: 2 }),
    ]
    expect(toggleOption([1, 2], three[2], three)).toEqual([1, 2])
  })
})
