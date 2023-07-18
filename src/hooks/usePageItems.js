import { computed, } from 'vue';
export default function usePageItems(currentPaginationNumber, isMultipleSelectable, isServerSideMode, items, rowsPerPageRef, selectItemsComputed, showIndex, totalItems, totalItemsLength) {
    const currentPageFirstIndex = computed(() => (currentPaginationNumber.value - 1)
        * rowsPerPageRef.value + 1);
    const currentPageLastIndex = computed(() => {
        if (isServerSideMode.value) {
            return Math.min(totalItemsLength.value, currentPaginationNumber.value * rowsPerPageRef.value);
        }
        return Math.min(totalItems.value.length, currentPaginationNumber.value * rowsPerPageRef.value);
    });
    // items in current page
    const itemsInPage = computed(() => {
        if (isServerSideMode.value)
            return items.value;
        return totalItems.value.slice(currentPageFirstIndex.value - 1, currentPageLastIndex.value);
    });
    const itemsWithIndex = computed(() => {
        if (showIndex.value) {
            return itemsInPage.value.map((item, index) => ({ index: currentPageFirstIndex.value + index, ...item }));
        }
        return itemsInPage.value;
    });
    const multipleSelectStatus = computed(() => {
        if (selectItemsComputed.value.length === 0) {
            return 'noneSelected';
        }
        const isNoneSelected = selectItemsComputed.value.every((itemSelected) => {
            if (totalItems.value.findIndex((item) => JSON.stringify(itemSelected) === JSON.stringify(item)) !== -1) {
                return false;
            }
            return true;
        });
        if (isNoneSelected)
            return 'noneSelected';
        if (selectItemsComputed.value.length === totalItems.value.length) {
            const isAllSelected = selectItemsComputed.value.every((itemSelected) => {
                if (totalItems.value.findIndex((item) => JSON.stringify(itemSelected) === JSON.stringify(item)) === -1) {
                    return false;
                }
                return true;
            });
            return isAllSelected ? 'allSelected' : 'partSelected';
        }
        return 'partSelected';
    });
    // items for render
    const pageItems = computed(() => {
        if (!isMultipleSelectable.value)
            return itemsWithIndex.value;
        // multi select
        if (multipleSelectStatus.value === 'allSelected') {
            return itemsWithIndex.value.map((item) => ({ checkbox: true, ...item }));
        }
        if (multipleSelectStatus.value === 'noneSelected') {
            return itemsWithIndex.value.map((item) => ({ checkbox: false, ...item }));
        }
        return itemsWithIndex.value.map((item) => {
            const isSelected = selectItemsComputed.value.findIndex((selectItem) => {
                const itemDeepCloned = { ...item };
                delete itemDeepCloned.index;
                return JSON.stringify(selectItem) === JSON.stringify(itemDeepCloned);
            }) !== -1;
            return { checkbox: isSelected, ...item };
        });
    });
    return {
        currentPageFirstIndex,
        currentPageLastIndex,
        multipleSelectStatus,
        pageItems,
    };
}
//# sourceMappingURL=usePageItems.js.map