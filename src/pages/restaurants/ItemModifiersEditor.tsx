import { useState } from 'react'
import { Plus, Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { Button, Input, Badge } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { apiErrorMessage } from '@/lib/apiError'
import { groupOptions, groupMax, groupRequired, variantPrice, UNGROUPED } from '@/lib/menu'
import {
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
  useCreateOption,
  useUpdateOption,
  useDeleteOption,
} from '@/hooks/useRestaurants'
import type { MenuItem } from '@/types'

interface Props {
  restaurantId: number
  item: MenuItem
  onChanged: () => void
}

const EMPTY_VARIANT = { name: '', priceDelta: 0 }
const EMPTY_OPTION = {
  groupName: '',
  name: '',
  priceDelta: 0,
  required: false,
  maxSelections: 1,
  isDefault: false,
}

/**
 * Sizes and add-ons for an existing item, via the dedicated endpoints.
 * (PUT /menu/items/{id} refuses `variants`/`options` in its body.)
 */
export function ItemModifiersEditor({ restaurantId, item, onChanged }: Props) {
  const createVariant = useCreateVariant()
  const updateVariant = useUpdateVariant()
  const deleteVariant = useDeleteVariant()
  const createOption = useCreateOption()
  const updateOption = useUpdateOption()
  const deleteOption = useDeleteOption()

  const [variantForm, setVariantForm] = useState(EMPTY_VARIANT)
  const [optionForm, setOptionForm] = useState(EMPTY_OPTION)
  const [error, setError] = useState<string | null>(null)

  const busy =
    createVariant.isPending ||
    updateVariant.isPending ||
    deleteVariant.isPending ||
    createOption.isPending ||
    updateOption.isPending ||
    deleteOption.isPending

  const run = async (action: () => Promise<unknown>, after?: () => void) => {
    setError(null)
    try {
      await action()
      after?.()
      onChanged()
    } catch (err) {
      setError(apiErrorMessage(err, 'Не удалось сохранить изменение'))
    }
  }

  const variants = item.variants ?? []
  const options = item.options ?? []

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-md bg-[hsl(var(--destructive))]/10 p-2 text-xs text-[hsl(var(--destructive))]">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ---- Sizes ---- */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Размеры (выбор одного)</p>
        {variants.length === 0 && (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Размеров нет.</p>
        )}
        {variants.map((v) => (
          <div
            key={v.id}
            className={`flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] p-2 ${
              v.active === false ? 'opacity-60' : ''
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{v.name}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {formatCurrency(variantPrice(item, v))}
                {v.priceDelta !== 0 && ` (${v.priceDelta > 0 ? '+' : ''}${formatCurrency(v.priceDelta)})`}
              </p>
            </div>
            {v.active === false && <Badge variant="outline">Скрыт</Badge>}
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() =>
                run(() =>
                  updateVariant.mutateAsync({
                    restaurantId,
                    itemId: item.id,
                    variantId: v.id,
                    data: { inStock: !v.inStock },
                  })
                )
              }
            >
              {v.inStock ? 'В наличии' : 'Нет в наличии'}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={busy}
              title="Удалить безвозвратно"
              onClick={() =>
                run(() =>
                  deleteVariant.mutateAsync({ restaurantId, itemId: item.id, variantId: v.id })
                )
              }
            >
              <Trash2 className="h-4 w-4 text-[hsl(var(--destructive))]" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input
            placeholder="Например: Большой"
            value={variantForm.name}
            onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
          />
          <Input
            type="number"
            className="w-32"
            placeholder="+ к цене"
            value={variantForm.priceDelta}
            onChange={(e) => setVariantForm({ ...variantForm, priceDelta: parseFloat(e.target.value) || 0 })}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={busy || !variantForm.name.trim()}
            onClick={() =>
              run(
                () =>
                  createVariant.mutateAsync({
                    restaurantId,
                    itemId: item.id,
                    data: { name: variantForm.name.trim(), priceDelta: variantForm.priceDelta },
                  }),
                () => setVariantForm(EMPTY_VARIANT)
              )
            }
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* ---- Add-ons ---- */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Добавки</p>
        {options.length === 0 && (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Добавок нет.</p>
        )}
        {groupOptions(options).map(([groupName, opts]) => (
          <div key={groupName} className="space-y-1">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {groupName} ({groupRequired(opts) ? 'обязательно' : 'необязательно'}
              {groupMax(opts) > 1 ? `, макс. ${groupMax(opts)}` : ''})
            </p>
            {opts.map((o) => (
              <div
                key={o.id}
                className={`flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] p-2 ${
                  o.active === false ? 'opacity-60' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {o.isDefault && '★ '}
                    {o.name}
                  </p>
                  {o.priceDelta !== 0 && (
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      +{formatCurrency(o.priceDelta)}
                    </p>
                  )}
                </div>
                {o.active === false && <Badge variant="outline">Скрыт</Badge>}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    run(() =>
                      updateOption.mutateAsync({
                        restaurantId,
                        itemId: item.id,
                        optionId: o.id,
                        data: { inStock: !o.inStock },
                      })
                    )
                  }
                >
                  {o.inStock ? 'В наличии' : 'Нет в наличии'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={busy}
                  title="Удалить безвозвратно"
                  onClick={() =>
                    run(() =>
                      deleteOption.mutateAsync({ restaurantId, itemId: item.id, optionId: o.id })
                    )
                  }
                >
                  <Trash2 className="h-4 w-4 text-[hsl(var(--destructive))]" />
                </Button>
              </div>
            ))}
          </div>
        ))}

        <div className="space-y-2 rounded-lg border border-dashed border-[hsl(var(--border))] p-2">
          <div className="grid grid-cols-3 gap-2">
            <Input
              placeholder="Группа: Соус"
              value={optionForm.groupName}
              onChange={(e) => setOptionForm({ ...optionForm, groupName: e.target.value })}
            />
            <Input
              placeholder="Название: Чесночный"
              value={optionForm.name}
              onChange={(e) => setOptionForm({ ...optionForm, name: e.target.value })}
            />
            <Input
              type="number"
              placeholder="+ к цене"
              value={optionForm.priceDelta}
              onChange={(e) => setOptionForm({ ...optionForm, priceDelta: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <label className="flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={optionForm.required}
                onChange={(e) => setOptionForm({ ...optionForm, required: e.target.checked })}
                className="h-4 w-4 rounded border-[hsl(var(--border))]"
              />
              Обязательно
            </label>
            <label className="flex items-center gap-1">
              Макс.
              <Input
                type="number"
                min={1}
                className="h-7 w-16"
                value={optionForm.maxSelections}
                onChange={(e) => setOptionForm({ ...optionForm, maxSelections: parseInt(e.target.value) || 1 })}
              />
            </label>
            <label className="flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={optionForm.isDefault}
                onChange={(e) => setOptionForm({ ...optionForm, isDefault: e.target.checked })}
                className="h-4 w-4 rounded border-[hsl(var(--border))]"
              />
              По умолчанию
            </label>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              disabled={busy || !optionForm.name.trim()}
              onClick={() =>
                run(
                  () =>
                    createOption.mutateAsync({
                      restaurantId,
                      itemId: item.id,
                      data: {
                        groupName: optionForm.groupName.trim() || UNGROUPED,
                        name: optionForm.name.trim(),
                        priceDelta: optionForm.priceDelta,
                        required: optionForm.required,
                        maxSelections: optionForm.maxSelections,
                        isDefault: optionForm.isDefault,
                      },
                    }),
                  () => setOptionForm(EMPTY_OPTION)
                )
              }
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <p className="text-xs text-[hsl(var(--muted-foreground))]">
        Удаление необратимо. Чтобы временно скрыть размер или добавку, отметьте «нет в наличии».
      </p>
    </div>
  )
}
