const getIndexData = require("../controller/getIndexData");

const db = {
  query: () => [ {facility_level: 'facility1'}, {model_id: 'model1'} ]
};

describe('getIndexData tests', () => {
  test('Returns data for mock database', async () => {
    const data = await getIndexData(db);
    expect(Object.keys(data.visualizations).length).toBeGreaterThanOrEqual(1);
    expect(data.filters).toBeDefined();
    const filters = data.filters;
    expect(filters.facilityTypes).toBeDefined();
    expect(filters.facilityTypes.classes).toBeDefined();
    expect(filters.facilityTypes.classes['No group']).toBeDefined();
    expect(filters.refrigeratorTypes.classes['No group']).toBeDefined();
    expect(filters.maintenancePriorities.options.length).toBeGreaterThanOrEqual(1);
    expect(Object.keys(data.exportOptions).length).toBeGreaterThanOrEqual(1);
    expect(Object.keys(data.tabVisualizations).length).toBeGreaterThanOrEqual(1);
});
})
