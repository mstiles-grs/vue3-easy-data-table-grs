import { computed, watch, } from 'vue';
import { getItemValue } from '../utils';
export default function useTotalItems(clientSortOptions, filterOptions, isServerSideMode, items, itemsSelected, searchField, searchValue, serverItemsLength, multiSort, emits) {
    const generateSearchingTarget = (item) => {
        if (typeof searchField.value === 'string' && searchField.value !== '')
            return getItemValue(searchField.value, item);
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
    const itemsSearching = computed(() => {
        // searching feature is not available in server-side mode
        if (!isServerSideMode.value && searchValue.value !== '') {
            const regex = new RegExp(searchValue.value, 'i');
            return items.value.filter((item) => regex.test(generateSearchingTarget(item)));
        }
        return items.value;
    });
    // items filtering
    const itemsFiltering = computed(() => {
        let itemsFiltered = [...itemsSearching.value];
        if (filterOptions.value) {
            filterOptions.value.forEach((option) => {
                itemsFiltered = itemsFiltered.filter((item) => {
                    const { field, comparison, criteria } = option;
                    if (typeof comparison === 'function') {
                        return comparison(getItemValue(field, item), criteria);
                    }
                    const itemValue = String(getItemValue(field, item));
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
                                return criteria.includes(itemValue);
                            }
                            else {
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
    function recursionMuiltSort(sortByArr, sortDescArr, itemsToSort, index) {
        const sortBy = sortByArr[index];
        const sortDesc = sortDescArr[index];
        const sorted = (index === 0 ? itemsToSort
            : recursionMuiltSort(sortByArr, sortDescArr, itemsToSort, index - 1)).sort((a, b) => {
            let isAllSame = true;
            for (let i = 0; i < index; i += 1) {
                if (getItemValue(sortByArr[i], a) !== getItemValue(sortByArr[i], b)) {
                    isAllSame = false;
                    break;
                }
            }
            if (isAllSame) {
                if (getItemValue(sortBy, a) < getItemValue(sortBy, b))
                    return sortDesc ? 1 : -1;
                if (getItemValue(sortBy, a) > getItemValue(sortBy, b))
                    return sortDesc ? -1 : 1;
                return 0;
            }
            return 0;
        });
        return sorted;
    }
    // flow: searching => filtering => sorting
    // (last step: sorting)
    const totalItems = computed(() => {
        if (isServerSideMode.value)
            return items.value;
        if (clientSortOptions.value === null)
            return itemsFiltering.value;
        const { sortBy, sortDesc } = clientSortOptions.value;
        const itemsFilteringSorted = [...itemsFiltering.value];
        // multi sort
        if (multiSort && Array.isArray(sortBy) && Array.isArray(sortDesc)) {
            if (sortBy.length === 0)
                return itemsFilteringSorted;
            return recursionMuiltSort(sortBy, sortDesc, itemsFilteringSorted, sortBy.length - 1);
        }
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        return itemsFilteringSorted.sort((a, b) => {
            if (getItemValue(sortBy, a) < getItemValue(sortBy, b))
                return sortDesc ? 1 : -1;
            if (getItemValue(sortBy, a) > getItemValue(sortBy, b))
                return sortDesc ? -1 : 1;
            return 0;
        });
    });
    // eslint-disable-next-line max-len
    const totalItemsLength = computed(() => (isServerSideMode.value ? serverItemsLength.value : totalItems.value.length));
    // multiple selecting
    const selectItemsComputed = computed({
        get: () => itemsSelected.value ?? [],
        set: (value) => {
            emits('update:itemsSelected', value);
        },
    });
    const toggleSelectAll = (isChecked) => {
        selectItemsComputed.value = isChecked ? totalItems.value : [];
        if (isChecked)
            emits('selectAll');
    };
    const toggleSelectItem = (item) => {
        console.log('test', item);
        const isAlreadyChecked = item.checkbox;
        // eslint-disable-next-line no-param-reassign
        delete item.checkbox;
        // eslint-disable-next-line no-param-reassign
        delete item.index;
        if (!isAlreadyChecked) {
            const selectItemsArr = selectItemsComputed.value;
            selectItemsArr.unshift(item);
            selectItemsComputed.value = selectItemsArr;
            emits('selectRow', item);
        }
        else {
            selectItemsComputed.value = selectItemsComputed.value.filter((selectedItem) => JSON.stringify(selectedItem)
                !== JSON.stringify(item));
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
//# sourceMappingURL=useTotalItems.js.map