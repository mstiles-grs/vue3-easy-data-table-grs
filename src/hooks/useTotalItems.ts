import {
  Ref, computed, ComputedRef, watch,
} from 'vue';
import type { Item, FilterOption } from '../types/main';
import type { ClientSortOptions, EmitsEventName } from '../types/internal';
import { getItemValue } from '../utils';

export default function useTotalItems(
  clientSortOptions: Ref<ClientSortOptions | null>,
  filterOptions: Ref<FilterOption[]>,
  isServerSideMode: ComputedRef<boolean>,
  items: Ref<Item[]>,
  itemsSelected: Ref<Item[]>,
  searchField: Ref<string>,
  searchValue: Ref<string>,
  serverItemsLength: Ref<number>,
  multiSort: Ref<boolean>,
  emits: (event: EmitsEventName, ...args: any[]) => void,
) {
  const generateSearchingTarget = (item: Item): string => {
    if (typeof searchField.value === 'string' && searchField.value !== '') return getItemValue(searchField.value, item);
    if (Array.isArray(searchField.value)) {
      let searchString = '';
      searchField.value.forEach((field) => {
        searchString += getItemValue(field, item);
      });
      return searchString;
    }
    return Object.values(item).join(' ');
  };

  // items searching
  const itemsSearching = computed((): Item[] => {
    // searching feature is not available in server-side mode
    if (!isServerSideMode.value && searchValue.value !== '') {
      const regex = new RegExp(searchValue.value, 'i');
      return items.value.filter((item) => regex.test(generateSearchingTarget(item)));
    }
    return items.value;
  });
  // items filtering
  const itemsFiltering = computed((): Item[] => {
    let itemsFiltered = [...itemsSearching.value];
    if (filterOptions.value) {
      filterOptions.value.forEach((option: FilterOption) => {
      itemsFiltered = itemsFiltered.filter((item) => {
        const { field, comparison, criteria } = option;
        if (typeof comparison === 'function') {
          return comparison(getItemValue(field, item), criteria as string);
        }
        const itemValue = String(getItemValue(field as string, item));
        const criteriaValue = String(criteria);
        switch (comparison) {
          case '=':
            return itemValue === criteriaValue;
          case '!=':
            return itemValue !== criteriaValue;
          case '>':
            return Number(itemValue) > Number(criteriaValue);
          case '<':
            return Number(itemValue) < Number(criteriaValue);
          case '<=':
            return Number(itemValue) <= Number(criteriaValue);
          case '>=':
            return Number(itemValue) >= Number(criteriaValue);
          case 'between':
            return Number(itemValue) >= Math.min(...criteria) && Number(itemValue) <= Math.max(...criteria);
          case 'in':
            if (Array.isArray(criteria)) {
              return (criteria as string[]).includes(itemValue);
            } else {
              throw new Error('Criteria must be an array when comparison is "in".');
            }
          default:
            return itemValue === criteriaValue;
        }
      });
    });
    return itemsFiltered;
  }
  return itemsSearching.value;
  });

  watch(itemsFiltering, (newVal) => {
    if (filterOptions.value) {
      emits('updateFilter', newVal);
    }
  }, { immediate: true, deep: true });

  const multiSortFunction = (sortByArr: string[], sortDescArr: boolean[], itemsToSort: Item[]): Item[] => {
    return itemsToSort.sort((a, b) => {
      for (let i = 0; i < sortByArr.length; i += 1) {
        const comparison = getItemValue(sortByArr[i], a) - getItemValue(sortByArr[i], b);
        if (comparison !== 0) {
          return sortDescArr[i] ? -comparison : comparison;
        }
      }
      return 0;
    });
  }

  // flow: searching => filtering => sorting
  // (last step: sorting)
  const totalItems = computed((): Item[] => {
    if (isServerSideMode.value) return items.value;
    if (clientSortOptions.value === null) return itemsFiltering.value;
    const { sortBy, sortDesc } = clientSortOptions.value;
    const itemsFilteringSorted = [...itemsFiltering.value];
    if (multiSort.value && Array.isArray(sortBy) && Array.isArray(sortDesc)) {
      if (sortBy.length === 0) return itemsFilteringSorted;
      return multiSortFunction(sortBy, sortDesc, itemsFilteringSorted);
    }
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    return itemsFilteringSorted.sort((a, b) => {
      if (getItemValue(sortBy as string, a) < getItemValue(sortBy as string, b)) return sortDesc ? 1 : -1;
      if (getItemValue(sortBy as string, a) > getItemValue(sortBy as string, b)) return sortDesc ? -1 : 1;
      return 0;
    });
  });

  // eslint-disable-next-line max-len
  const totalItemsLength = computed((): number => (isServerSideMode.value ? serverItemsLength.value : totalItems.value.length));

  // multiple selecting
  const selectItemsComputed = computed({
    get: () => itemsSelected.value ?? [],
    set: (value) => {
      emits('update:itemsSelected', value);
    },
  });

  const toggleSelectAll = (isChecked: boolean): void => {
    selectItemsComputed.value = isChecked ? totalItems.value : [];
    if (isChecked) emits('selectAll');
  };

  const toggleSelectItem = (item: Item): void => {
    const isAlreadyChecked = item.checkbox;
    delete item.checkbox;
    delete item.index;
    if (!isAlreadyChecked) {
      const selectItemsArr: Item[] = selectItemsComputed.value;
      selectItemsArr.unshift(item);
      selectItemsComputed.value = selectItemsArr;
      emits('selectRow', item);
    } else {
      selectItemsComputed.value = selectItemsComputed.value.filter((selectedItem) => selectedItem.id !== item.id);
      emits('deselectRow', item);
    }
  };

  return {
    totalItems,
    selectItemsComputed,
    totalItemsLength,
    toggleSelectAll,
    toggleSelectItem,
  };
}
