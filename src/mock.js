export const headersMocked = [
    { text: 'Name', value: 'name' },
    { text: 'Address', value: 'address' },
    { text: 'Height', value: 'height', sortable: true },
    { text: 'Weight', value: 'weight', sortable: true },
    { text: 'Age', value: 'calories', sortable: true },
    { text: 'Calories', value: 'calories' },
    { text: 'Fat (g)', value: 'fat' },
    { text: 'Carbs (g)', value: 'carbs' },
    { text: 'Protein (g)', value: 'protein' },
    { text: 'Iron (%)', value: 'iron' },
];
export const mockClientItems = (itemsNumber = 100) => {
    const mockItems = [];
    const sports = ['basketball', 'football', 'running', 'swimming'];
    const fruits = ['banana', 'apple', 'orange', 'peach'];
    for (let i = 1; i < itemsNumber + 1; i += 1) {
        mockItems.push({
            name: `name-${i}`,
            address: `address-${i}`,
            height: i,
            weight: i,
            age: i,
            favouriteSport: sports[i % 4],
            favouriteFruits: fruits[i % 4],
        });
    }
    return mockItems;
};
export const mockClientNestedItems = (itemsNumber = 100) => {
    const mockItems = [];
    const sports = ['basketball', 'football', 'running', 'swimming'];
    const fruits = ['banana', 'apple', 'orange', 'peach'];
    for (let i = 1; i < itemsNumber + 1; i += 1) {
        mockItems.push({
            name: `name-${i}`,
            address: `address-${i}`,
            info: { out: { height: i, weight: i } },
            age: i,
            favouriteSport: sports[i % 4],
            favouriteFruits: fruits[i % 4],
        });
    }
    return mockItems;
};
export const mockDuplicateClientNestedItems = (itemsNumber = 100) => {
    const mockItems = [];
    const sports = ['basketball', 'football', 'running', 'swimming'];
    const fruits = ['banana', 'apple', 'orange', 'peach'];
    for (let i = 1; i < itemsNumber + 1; i += 1) {
        mockItems.push({
            name: `name-${i}`,
            address: `address-${i}`,
            info: { out: { height: i, weight: i } },
            age: i,
            favouriteSport: sports[i % 4],
            favouriteFruits: fruits[i % 4],
        });
    }
    mockItems.push({
        name: 'name-1',
        address: 'address-1',
        age: 1,
        favouriteSport: sports[1 % 4],
        favouriteFruits: fruits[1 % 4],
    });
    return mockItems;
};
export const mockItemIntroduction = async (name) => {
    // eslint-disable-next-line no-promise-executor-return
    await new Promise((s) => setTimeout(s, 2000));
    const briefs = {
        'Stephen Curry': 'Wardell Stephen Curry II is an American professional basketball player for the Golden State Warriors of the National Basketball Association (NBA).',
        'Lebron James': 'LeBron Raymone James Sr is an American professional basketball player for the Los Angeles Lakers of the National Basketball Association (NBA).',
        'Kevin Durant': 'Kevin Wayne Durant also known by his initials KD, is an American professional basketball player for the Brooklyn Nets of the National Basketball Association (NBA).',
        'Giannis Antetokounmpo': 'Giannis Sina Ugo Antetokounmpo (né Adetokunbo; December 6, 1994) is a Greek-Nigerian professional basketball player for the Milwaukee Bucks of the National Basketball Association (NBA).',
    };
    return briefs[name];
};
export const mockServerItems = async (serverOptions, serverItemsLength = 500) => {
    const { page, rowsPerPage, sortBy, sortType, } = serverOptions;
    const serverTotalItems = mockClientItems(serverItemsLength);
    if (sortBy && sortType) {
        serverTotalItems.sort((a, b) => {
            let compareA = a;
            let compareB = b;
            // If sortBy is an array of strings, use the first string as the property to sort by
            if (Array.isArray(sortBy)) {
                compareA = a[sortBy[0]];
                compareB = b[sortBy[0]];
            }
            else {
                compareA = a[sortBy];
                compareB = b[sortBy];
            }
            if (compareA < compareB)
                return sortType === 'desc' ? 1 : -1;
            if (compareA > compareB)
                return sortType === 'desc' ? -1 : 1;
            return 0;
        });
    }
    // eslint-disable-next-line no-promise-executor-return
    await new Promise((s) => setTimeout(s, 2000));
    return {
        serverCurrentPageItems: serverTotalItems.slice((page - 1) * rowsPerPage, page * rowsPerPage),
        serverTotalItemsLength: serverItemsLength,
    };
};
//# sourceMappingURL=mock.js.map