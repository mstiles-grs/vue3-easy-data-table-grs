import { ref, computed, } from 'vue';
export default function usePagination(currentPage, isServerSideMode, loading, totalItemsLength, rowsPerPage, serverOptions, updateServerOptionsPage) {
    const currentPaginationNumber = ref(serverOptions.value ? serverOptions.value.page : currentPage.value);
    const maxPaginationNumber = computed(() => Math.ceil(totalItemsLength.value / rowsPerPage.value));
    // eslint-disable-next-line max-len
    const isLastPage = computed(() => maxPaginationNumber.value === 0 || (currentPaginationNumber.value === maxPaginationNumber.value));
    const isFirstPage = computed(() => currentPaginationNumber.value === 1);
    const nextPage = () => {
        if (totalItemsLength.value === 0)
            return;
        if (isLastPage.value)
            return;
        if (loading.value)
            return;
        if (isServerSideMode.value) {
            const nextPaginationNumber = currentPaginationNumber.value + 1;
            updateServerOptionsPage(nextPaginationNumber);
        }
        else {
            currentPaginationNumber.value += 1;
        }
    };
    const prevPage = () => {
        if (totalItemsLength.value === 0)
            return;
        if (isFirstPage.value)
            return;
        if (loading.value)
            return;
        if (isServerSideMode.value) {
            const prevPaginationNumber = currentPaginationNumber.value - 1;
            updateServerOptionsPage(prevPaginationNumber);
        }
        else {
            currentPaginationNumber.value -= 1;
        }
    };
    const updatePage = (page) => {
        if (loading.value)
            return;
        if (isServerSideMode.value) {
            updateServerOptionsPage(page);
        }
        else {
            currentPaginationNumber.value = page;
        }
    };
    const updateCurrentPaginationNumber = (page) => {
        currentPaginationNumber.value = page;
    };
    return {
        currentPaginationNumber,
        maxPaginationNumber,
        isLastPage,
        isFirstPage,
        nextPage,
        prevPage,
        updatePage,
        updateCurrentPaginationNumber,
    };
}
//# sourceMappingURL=usePagination.js.map