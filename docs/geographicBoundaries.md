# How to update the geographic borders in the dashboard
## Overview
The geographic borders used in both the geographic selection tool and the heatmap visualizations are defined primarily by the config file `src/config/geographicBoundaries.js`, which references GeoJSON files in the same `src/config/` folder. These GeoJSON files include the outline of regions at different levels of the administrative hierarchy. The administrative hierarchy in the database table `geographic_regions_odkx` needs to match the regions described by the GeoJSON files.

## Metadata
The `src/config/geographicBoundaries.js` config file allows customization of which levels of the administrative hierarchy are made available via the dashboard. 

1. `levels`: The `levels` parameter expects an array of objects, each defining one level of the administrative hierarchy (e.g., Country, Region, District). The array *must* be sorted, where the first element is at the highest level of the administrative hierarchy (e.g., country) and the last element is the most granular (e.g., district). The geographic selection tool can be used to filter at any of these levels.

Here's an example `level` object:
```
{
    dbLevelName: 'regionlevel2',
    levelName: 'Region (Level 2)',
    geoJson: level2Uganda,
    regionNameKey: 'ccisRegionName'
}
```

* `dbLevelName` is the name of a column in the `geographic_regions` table. In this case, this level is describing a region in Uganda, and the database uses `regionlevel1` for the country, `regionlevel2` for the region, `regionlevel3` for the district, and `regionlevel4` for the sub-district.

* `levelName` is a human-readable name for this level. This is the value that will be used in the `topLevel` and `bottomLevel` parameters, and by the `visualizations.js` config file when defining heatmaps.

* `geoJson` is a reference to a GeoJSON object containing all of the latitude-longitude information describing the boundaries of the regions. The value of `geoJson` should be `null` for the first element of the array, because the highest level is actually displayed by using the GeoJSON for the second-highest level. In this example, the `level2Uganda` value is the result of importing that GeoJSON file:

`const level2Uganda = require('./Uganda_Regions_2020.json');`

* `regionNameKey` is the name of the parameter in the provided GeoJSON file that has the name of this administrative region. In this example, it means that in the `level2Uganda` object, we should be able to lookup the value of `ccisRegionName` for each feature and get a name like `ACHOLI` or `KAMPALA`. This should also be `null` for the first element of the `levels` array, because there is no GeoJSON for this first level.

2. `topLevel` and `bottomLevel`: These are used by the geographic selection tool on the dashboard to define which levels from the `levels` object are available to filter on. These should be vales of some `levelName` parameter from one of the provided `levels`, and `topLevel` should come before `bottomLevel` in the `levels` array.

3. `topLevelName`: For the level set by `topLevel`, no GeoJSON is expected, but the dashboard will still lookup the column defined by `levels[0].dbLevelName` in the database. The value of `topLevelName` is used to filter the database to only use regions with the proper value for this top level. For example, with `topLevelName` UGANDA, we are only looking up administrative regions within Uganda.

## File format
[GeoJSON](https://geojson.org/) files should be put in the `src/config/` folder and then imported into `geographicBoundaries.js` with lines like:
```
const level2Uganda = require('./Uganda_Regions_2020.json');
const level3Uganda = require('./Uganda_Districts_2020.json');
```

**Note:** The features in the GeoJSON files need to have attributes as defined by the `regionNameKey` parameters in the `geographicBoundaries.js` config file. And they need to have these parameters for their ancestors in the administrative hierarchy, too. For example, suppose `geographicBoundaries.js` is setup as follows.
```
module.exports = {
    ...
    levels: [
        {
            ...
            regionNameKey: null
        },
        {
            ...
            regionNameKey: 'ccisRegionName'
        },
        {
            ...
            regionNameKey: 'ccisDistrictName'
        }
    ]
};
```
Then in the GeoJSON for the districts, the attributes 'ccisRegionName' and 'ccisDistrictName' should *both* be present for each feature. The GeoJSON for the regions only needs the 'ccisRegionName' attribute.

Shapefiles can be exported to GeoJSON format with standard GIS tools like QGIS, ArcMap, or ArcGIS Pro
