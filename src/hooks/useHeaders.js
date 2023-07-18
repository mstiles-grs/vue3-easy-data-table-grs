import { ref, computed, } from 'vue';
export default function useHeaders(showIndexSymbol, checkboxColumnWidth, expandColumnWidth, fixedCheckbox, fixedExpand, fixedIndex, headers, ifHasExpandSlot, indexColumnWidth, isMultipleSelectable, isServerSideMode, mustSort, serverOptionsComputed, showIndex, sortBy, sortType, multiSort, updateServerOptionsSort, emits) {
    const hasFixedColumnsFromUser = computed(() => headers.value.findIndex((header) => header.fixed) !== -1);
    const fixedHeadersFromUser = computed(() => {
        if (hasFixedColumnsFromUser.value)
            return headers.value.filter((header) => header.fixed);
        return [];
    });
    const unFixedHeaders = computed(() => headers.value.filter((header) => !header.fixed));
    // eslint-disable-next-line max-len
    const generateClientSortOptions = (sortByValue, sortTypeValue) => {
        // multi sort
        if (Array.isArray(sortByValue) && Array.isArray(sortTypeValue)) {
            return {
                sortBy: sortByValue,
                sortDesc: sortTypeValue.map((val) => val === 'desc'),
            };
        }
        // single sort
        if (sortByValue !== '') {
            return {
                sortBy: sortBy.value,
                sortDesc: sortType.value === 'desc',
            };
        }
        return null;
    };
    const clientSortOptions = ref(generateClientSortOptions(sortBy.value, sortType.value));
    // headers for render (integrating sortType,z checkbox...)
    const headersForRender = computed(() => {
        // fixed order
        const fixedHeaders = [...fixedHeadersFromUser.value,
            ...unFixedHeaders.value];
        // sorting
        const headersSorting = fixedHeaders.map((header) => {
            const headerSorting = Object.assign(header);
            if (headerSorting.sortable)
                headerSorting.sortType = 'none';
            // server mode
            if (serverOptionsComputed.value) {
                if (Array.isArray(serverOptionsComputed.value.sortBy) && Array.isArray(serverOptionsComputed.value.sortType)
                    && serverOptionsComputed.value.sortBy.includes(headerSorting.value)) {
                    // multi sort
                    const index = serverOptionsComputed.value.sortBy.indexOf(headerSorting.value);
                    headerSorting.sortType = serverOptionsComputed.value.sortType[index];
                }
                else if (headerSorting.value === serverOptionsComputed.value.sortBy && serverOptionsComputed.value.sortType) {
                    // single sort
                    headerSorting.sortType = serverOptionsComputed.value.sortType;
                }
            }
            // client mode
            // multi sort
            // eslint-disable-next-line max-len
            if (clientSortOptions.value && Array.isArray(clientSortOptions.value.sortBy) && Array.isArray(clientSortOptions.value.sortDesc)
                && clientSortOptions.value.sortBy.includes(headerSorting.value)) {
                const index = clientSortOptions.value.sortBy.indexOf(headerSorting.value);
                headerSorting.sortType = clientSortOptions.value.sortDesc[index] ? 'desc' : 'asc';
            }
            else if (clientSortOptions.value && headerSorting.value === clientSortOptions.value.sortBy) {
                // single sort
                headerSorting.sortType = clientSortOptions.value.sortDesc ? 'desc' : 'asc';
            }
            return headerSorting;
        });
        // expand icon
        let headersWithExpand = [];
        if (!ifHasExpandSlot.value) {
            headersWithExpand = headersSorting;
        }
        else {
            const headerExpand = (fixedExpand.value || hasFixedColumnsFromUser.value) ? {
                text: '', value: 'expand', fixed: true, width: expandColumnWidth.value,
            } : { text: '', value: 'expand' };
            headersWithExpand = [headerExpand, ...headersSorting];
        }
        // show index
        let headersWithIndex = [];
        if (!showIndex.value) {
            headersWithIndex = headersWithExpand;
        }
        else {
            const headerIndex = (fixedIndex.value || hasFixedColumnsFromUser.value) ? {
                text: showIndexSymbol.value, value: 'index', fixed: true, width: indexColumnWidth.value,
            } : { text: showIndexSymbol.value, value: 'index' };
            headersWithIndex = [headerIndex, ...headersWithExpand];
        }
        // checkbox
        let headersWithCheckbox = [];
        if (!isMultipleSelectable.value) {
            headersWithCheckbox = headersWithIndex;
        }
        else {
            const headerCheckbox = (fixedCheckbox.value || hasFixedColumnsFromUser.value) ? {
                text: 'checkbox', value: 'checkbox', fixed: true, width: checkboxColumnWidth.value ?? 36,
            } : { text: 'checkbox', value: 'checkbox' };
            headersWithCheckbox = [headerCheckbox, ...headersWithIndex];
        }
        return headersWithCheckbox;
    });
    const headerColumns = computed(() => headersForRender.value.map((header) => header.value));
    const updateSortField = (newSortBy, oldSortType) => {
        let newSortType = null;
        if (oldSortType === 'none') {
            newSortType = 'asc';
        }
        else if (oldSortType === 'asc') {
            newSortType = 'desc';
        }
        else {
            newSortType = (mustSort.value) ? 'asc' : null;
        }
        if (isServerSideMode.value) {
            // update server options
            updateServerOptionsSort(newSortBy, newSortType);
        }
        // multi sort
        if (clientSortOptions.value && Array.isArray(clientSortOptions.value.sortBy)
            && Array.isArray(clientSortOptions.value.sortDesc)) {
            const index = clientSortOptions.value.sortBy.indexOf(newSortBy);
            if (index === -1) {
                if (newSortType !== null) {
                    clientSortOptions.value.sortBy.push(newSortBy);
                    clientSortOptions.value.sortDesc.push(newSortType === 'desc');
                }
            }
            else if (newSortType === null) {
                clientSortOptions.value.sortDesc.splice(index, 1);
                clientSortOptions.value.sortBy.splice(index, 1);
            }
            else {
                clientSortOptions.value.sortDesc[index] = newSortType === 'desc';
            }
        }
        else if (newSortType === null) {
            clientSortOptions.value = null;
        }
        else {
            clientSortOptions.value = {
                sortBy: newSortBy,
                sortDesc: newSortType === 'desc',
            };
        }
        emits('updateSort', {
            sortType: newSortType,
            sortBy: newSortBy,
        });
    };
    const isMultiSorting = (headerText) => {
        if (serverOptionsComputed.value) {
            if (Array.isArray(serverOptionsComputed.value.sortBy))
                return serverOptionsComputed.value.sortBy.includes(headerText);
        }
        if (clientSortOptions.value && Array.isArray(clientSortOptions.value.sortBy)) {
            return clientSortOptions.value.sortBy.includes(headerText);
        }
        return false;
    };
    const getMultiSortNumber = (headerText) => {
        if (serverOptionsComputed.value) {
            if (Array.isArray(serverOptionsComputed.value.sortBy))
                return serverOptionsComputed.value.sortBy.indexOf(headerText) + 1;
        }
        if (clientSortOptions.value && Array.isArray(clientSortOptions.value.sortBy)) {
            return clientSortOptions.value.sortBy.indexOf(headerText) + 1;
        }
        return false;
    };
    return {
        clientSortOptions,
        headerColumns,
        headersForRender,
        updateSortField,
        isMultiSorting,
        getMultiSortNumber,
    };
}
//# sourceMappingURL=useHeaders.js.map