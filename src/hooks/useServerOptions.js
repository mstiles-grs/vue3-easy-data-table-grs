import { computed } from 'vue';
export default function useServerOptions(serverOptions, multiSort, emits) {
    const serverOptionsComputed = computed({
        get: () => {
            if (serverOptions.value) {
                const { page, rowsPerPage, sortBy, sortType, } = serverOptions.value;
                return {
                    page,
                    rowsPerPage,
                    sortBy: sortBy ?? null,
                    sortType: sortType ?? null,
                };
            }
            return null;
        },
        set: (value) => {
            emits('update:serverOptions', value);
        },
    });
    const updateServerOptionsPage = (page) => {
        if (serverOptionsComputed.value) {
            serverOptionsComputed.value = {
                ...serverOptionsComputed.value,
                page,
            };
        }
    };
    const updateServerOptionsRowsPerPage = (rowsPerPage) => {
        if (serverOptionsComputed.value) {
            serverOptionsComputed.value = {
                ...serverOptionsComputed.value,
                page: 1,
                rowsPerPage,
            };
        }
    };
    const updateServerOptionsSort = (newSortBy, newSortType) => {
        if (serverOptionsComputed.value) {
            if (multiSort.value && Array.isArray(serverOptionsComputed.value.sortBy)
                && Array.isArray(serverOptionsComputed.value.sortType)) {
                const index = serverOptionsComputed.value.sortBy.findIndex((val) => val === newSortBy);
                if (index === -1 && newSortType !== null) {
                    serverOptionsComputed.value.sortBy.push(newSortBy);
                    serverOptionsComputed.value.sortType.push(newSortType);
                }
                if (newSortType === null) {
                    serverOptionsComputed.value.sortBy.splice(index, 1);
                    serverOptionsComputed.value.sortType.splice(index, 1);
                }
                else {
                    serverOptionsComputed.value.sortType[index] = newSortType;
                }
            }
            else {
                serverOptionsComputed.value = {
                    ...serverOptionsComputed.value,
                    sortBy: newSortType !== null ? newSortBy : null,
                    sortType: newSortType,
                };
            }
        }
    };
    return {
        serverOptionsComputed,
        updateServerOptionsPage,
        updateServerOptionsSort,
        updateServerOptionsRowsPerPage,
    };
}
//# sourceMappingURL=useServerOptions.js.map