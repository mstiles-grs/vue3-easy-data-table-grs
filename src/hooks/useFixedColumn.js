import { computed } from 'vue';
export default function useFixedColumn(headersForRender) {
    const fixedHeaders = computed(() => headersForRender.value.filter((header) => header.fixed));
    const lastFixedColumn = computed(() => {
        if (!fixedHeaders.value.length)
            return '';
        return fixedHeaders.value[fixedHeaders.value.length - 1].value;
    });
    const fixedColumnsInfos = computed(() => {
        if (!fixedHeaders.value.length)
            return [];
        const fixedHeadersWidthArr = fixedHeaders.value.map((header) => header.width ?? 100);
        return fixedHeaders.value.map((header, index) => ({
            value: header.value,
            fixed: header.fixed ?? true,
            width: header.width ?? 100,
            distance: index === 0 ? 0 : fixedHeadersWidthArr.reduce((previous, current, i) => {
                let distance = previous;
                if (i < index)
                    distance += current;
                return distance;
            }),
        }));
    });
    return {
        fixedHeaders,
        lastFixedColumn,
        fixedColumnsInfos,
    };
}
//# sourceMappingURL=useFixedColumn.js.map