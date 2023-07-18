export function getItemValue(column, item) {
    if (column.includes('.')) {
        const keys = column.split('.');
        const { length } = keys;
        let content;
        let i = 0;
        while (i < length) {
            if (i === 0) {
                content = item[keys[0]];
            }
            else if (content && typeof content === 'object') {
                content = content[keys[i]];
            }
            else {
                content = '';
                break;
            }
            i += 1;
        }
        return content ?? '';
    }
    return item[column] ?? '';
}
export function generateColumnContent(column, item) {
    const content = getItemValue(column, item);
    return Array.isArray(content) ? content.join(',') : content;
}
//# sourceMappingURL=utils.js.map