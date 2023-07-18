export default function useClickRow(clickEventType, isMultipleSelectable, showIndex, emits) {
    const clickRow = (item, clickType, $event) => {
        if (clickEventType.value !== clickType)
            return;
        const clickRowArgument = { ...item };
        if (isMultipleSelectable.value) {
            const { checkbox } = item;
            delete clickRowArgument.checkbox;
            clickRowArgument.isSelected = checkbox;
        }
        if (showIndex.value) {
            const { index } = item;
            delete clickRowArgument.index;
            clickRowArgument.indexInCurrentPage = index;
        }
        emits('clickRow', clickRowArgument, $event);
    };
    return {
        clickRow,
    };
}
//# sourceMappingURL=useClickRow.js.map