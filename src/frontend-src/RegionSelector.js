// Call this in `map.on('load', ...)`
// regionNamesContainer must be a ul element to display region names within
function RegionSelector({mapboxgl}, map, shapefiles, regionNamesContainer) {
    this._SELECT_OPACITY = 0.7;
    this._DESELECT_OPACITY = 0.1;
    this._SEPARATOR = '|';
    this._TOP = '__top__';
    this._topLevelName = shapefiles.topLevelName;
    this._map = map;
    this._shapefiles = shapefiles;
    this._currentSelection = null;
    this._currentLayers = []; // Which regions are displayed?
    this._selections = {};  // Which regions are selected?
    this._showMapAtNode = showMapAtNode;
    this._select = select;
    this._deselect = deselect;
    this._displayRegionNames = displayRegionNames;
    this._isLowestLevel = isLowestLevel;
    this._getRegionID = getRegionID.bind(this);
    this._getParentRegionID = getParentRegionID.bind(this);
    this._addLayerToMap = addLayerToMap.bind(this);
    this._makeHierarchy = makeHierarchy;
    this._getIDsFromLevel = getIDsFromLevel;
    this._getCurrentIndex = getCurrentIndex;
    this._updateSelections = updateSelections;
    // The map will only show boundaries between these two levels
    const levelNames = shapefiles.levels.map(level => level.levelName);
    this._topLevelIndex = levelNames.indexOf(shapefiles.topLevel);
    this._bottomLevelIndex = levelNames.indexOf(shapefiles.bottomLevel);
    this._hierarchy = this._makeHierarchy(shapefiles);

    this.getSelectedRegions = getSelectedRegions;
    this._showRegionSelectionInstr = showRegionSelectionInstr;
    this._regionNamesContainer = regionNamesContainer;
    this._recentClick = null;

    // This default double-click handler needs to be registered before the
    // individual event handlers for each layer
    map.on('dblclick', (e) => {
        // If we are at the lowest level, any double-click should return to the top
        const currentIndex = this._getCurrentIndex();
        if (currentIndex == this._bottomLevelIndex) {
            this._recentClick = e.lngLat;
            this._showMapAtNode(this._TOP);
        }
    });

    // Add GeoJSON to the map
    const boundaries = shapefiles.levels
        .slice(this._topLevelIndex + 1, this._bottomLevelIndex + 1)
        .map(level => level.geoJson.features)
    boundaries.flat().forEach(this._addLayerToMap);
    boundaries.flat().forEach((geoJSONFeature => {
        const layerID = this._getRegionID(geoJSONFeature);
        map.on('dblclick', layerID, (e) => {
            // // If we are at the lowest level, any double-click should return to the top
            if(this._recentClick && this._recentClick[0] == e.lngLat[0] && this._recentClick[1] == e.lngLat[1]) { // (if we already double clicked on bottom layer to go to top level)
                this._recentClick = null;
            } else {
                const currentIndex = this._getCurrentIndex();
                if (currentIndex != this._bottomLevelIndex) {
                    this._showMapAtNode(layerID);
                }
            }
        });
    }).bind(this));

    this._showMapAtNode(this._TOP);
    this._showRegionSelectionInstr(mapboxgl);
}

function showMapAtNode(selectedLayerID) {
    this._currentSelection = selectedLayerID;
    const displayedIndex = Math.min(this._getCurrentIndex() + 1, this._bottomLevelIndex); // Show children, unless we're at the bottom
    // Clear prior boundaries
    this._currentLayers.forEach(layerID => {
        this._map.setLayoutProperty(layerID, 'visibility', 'none');
        this._deselect(layerID);
    });
    this._selections = {};
    this._currentLayers = this._getIDsFromLevel(displayedIndex);
    this._currentLayers.forEach(layerID => {
        this._map.setLayoutProperty(layerID, 'visibility', 'visible');
    });
    const children = this._hierarchy[selectedLayerID];
    if (selectedLayerID == this._TOP) { // go back to country mode
        children.forEach(layerID => {
            this._map.setLayoutProperty(layerID, 'visibility', 'visible');
            this._select(layerID);
        });
    } else { // selectedRegionId is not top level;
        if (children) {
            children.forEach(childLayerID => {
                this._select(childLayerID);
            });
        } else {
            this._select(this._currentSelection);
        }
    }
}

/*
 * These instructions have become narrowly tailored to the Uganda CCIS 
 * deployment. They assume that the levels are Country, Region, District, but
 * other countries will have other adminstrative hierarchies. Ideally, this
 * code would be more general, and the instructions specific to one country
 * would move out into a config file.
 */
function showRegionSelectionInstr(mapboxgl) {
    const numberOfLevels = this._bottomLevelIndex - this._topLevelIndex + 1;
    let customAtt;
    if (numberOfLevels == 2) {
        customAtt = "Double click a region to select just that region. Then" +
            " you can click to select/deselect regions, or double-click to " +
            "return to the whole country.";
    } else if (numberOfLevels == 1) {
        customAtt = "Click to select/deselect an area";
    } else {
        customAtt = "Click to select/deselect an area; double click to select an area's" +
        " lower level; double click at lowest level to return to top level.";
    }
    this._map.addControl(new mapboxgl.AttributionControl({
        compact: true,
        customAttribution: customAtt
    }), 'top-left')
}

// The returned object maps a `layerID` to an array of child `layerID`s
function makeHierarchy({ levels }) {
    // TODO This function is basically preprocessing that could be done
    // server-side or precomputed
    const hierarchy = {};
    // TOP represents the highest level *displayed in the UI*, but we need
    // reference to higher levels as well since a region will count as selected
    // if all its children are
    hierarchy[this._TOP] = this._getIDsFromLevel(this._topLevelIndex + 1);
    // We start at 1 since the nodes at level 0 don't have parents
    for (let i = (this._topLevelIndex + 2); i <= this._bottomLevelIndex; i++) {
        levels[i].geoJson.features.forEach(geoJSONFeature => {
            const thisID = this._getRegionID(geoJSONFeature);
            const parentID = this._getParentRegionID(thisID);
            if (!hierarchy[parentID]) hierarchy[parentID] = [];
            hierarchy[parentID].push(thisID);
        });
    }
    return hierarchy;
}

// Returns a string like 'Uganda|Kampala|Kampala' (for the Kampala district
// within the Kampala region)
function getRegionID(geoJSONFeature) {
    return this._shapefiles.levels
        .map(level => geoJSONFeature.properties[level.regionNameKey])
        .filter(name => Boolean(name)) // Remove empty strings
        .join(this._SEPARATOR);
}

// Examples:
//   getParentRegionID('Uganda|Kampala|Kampala') = 'Uganda|Kampala'
//   getParentRegionID('Uganda|Kampala') = 'Uganda'
//   getParentRegionID('Uganda') throws an Error
function getParentRegionID(childRegionID) {
    if (childRegionID.indexOf(this._SEPARATOR) < 0) {
        return this._TOP;
    }
    return childRegionID.substr(0, childRegionID.lastIndexOf(this._SEPARATOR));
}

function select(layerID) {
    this._updateSelections(true, layerID);
    this._map.setPaintProperty(layerID, 'fill-opacity', this._SELECT_OPACITY);
    this._displayRegionNames();
}

function deselect(layerID) {
    this._updateSelections(false, layerID);
    this._map.setPaintProperty(layerID, 'fill-opacity', this._DESELECT_OPACITY);
    this._displayRegionNames();
}

function updateSelections(value, layerID) {
    const currentIndex = this._getCurrentIndex();
    if (currentIndex == this._bottomLevelIndex) {
        this._selections[layerID] = value;
    } else {
        const parentID = this._getParentRegionID(layerID);
        if (parentID == this._TOP) {
            this._selections[this._topLevelName] = value;
        } else {
            this._selections[parentID] = value;
        }
    }
}

function displayRegionNames() {
    const selectedRegions = Object.entries(this._selections)
        .filter(([_, value]) => value);
    this._regionNamesContainer.innerHTML = selectedRegions.map(([key, _], index) => {
            const arr = key.split(this._SEPARATOR);
            let punctuation;
            if (index == (selectedRegions.length -1)) {
                punctuation = '.';
            } else {
                punctuation = ', ';
            }
            return `<li>${arr[arr.length - 1]}${punctuation}</li>`
        })
        .join('');
    this._regionNamesContainer.innerHTML = `<span>Selected: </span>` + this._regionNamesContainer.innerHTML;

    // Checks if no regions are selected and displays "None"
    if (this._regionNamesContainer.children.length == 1) {
        const nullRegion = document.createElement('li');
        nullRegion.appendChild(document.createTextNode("None."));
        this._regionNamesContainer.appendChild(nullRegion);
    }
}

// toggle parent's children
// special case for bottom level - toggle current layerID
function toggleSelection(parentID, layerID) {
    const currentIndex = this._getCurrentIndex();
    if (currentIndex == this._bottomLevelIndex) { // bottom level mode
        this._selections[layerID] ? this._deselect(layerID) : this._select(layerID);
    } else {
        const children = this._hierarchy[parentID];
        let currParentName = parentID;
        if (parentID == this._TOP) {
            currParentName = this._topLevelName;
        }
        const currSelectionValue = this._selections[currParentName];
        children.forEach(layerID => {
            // toggle children of what is selected instead
            currSelectionValue ? this._deselect(layerID) : this._select(layerID);
        });
    }
}

function getCurrentIndex() {
    return this._currentSelection === this._TOP ? this._topLevelIndex : this._currentSelection.split(this._SEPARATOR).length;
}

function isLowestLevel(layerID) {
    return layerID.split(this._SEPARATOR).length >= this._bottomLevelIndex;
}

function addLayerToMap(geoJSONFeature) {
    const layerID = this._getRegionID(geoJSONFeature);
    if (this._map.getLayer(layerID) == undefined){
        this._map.addSource(layerID, {
            type: 'geojson',
            data: geoJSONFeature
        });
        this._map.addLayer({
            id: layerID,
            type: 'fill',
            source: layerID,
            layout: { visibility: 'none' },
            paint: {
                'fill-color': '#935181',
                'fill-outline-color': '#7A3166',
                'fill-opacity': this._DESELECT_OPACITY
            }
        });
        const parentID = this._getParentRegionID(layerID);
        this._map.on('click', layerID, toggleSelection.bind(this, parentID, layerID));
    }
}

function getIDsFromLevel(shapefilesIndex) {
    return this._shapefiles.levels[shapefilesIndex].geoJson.features
        .map(this._getRegionID);
}

function getSelectedRegions() {
    // If just top level is selected, return only top level name
    if (this._selections[this._topLevelName] == true) {
        return [ this._topLevelName.split(this._SEPARATOR) ];
    }

    const that = this;
    const regions = [];
    // This recursive helper function builds a set with every layerID in
    // _selections, plus (recursively) any layer whose children are all in the set
    function helper(layerID) {
        const childrenResults = (that._hierarchy[layerID] || []).map(helper);
        if (that._selections[layerID] ||
            (that._hierarchy[layerID] && childrenResults.every(x => x))) {
            regions.push(layerID);
            return true;
        }
    }
    const index = this._shapefiles.levels.findIndex(x => x.geoJson !== null);
    // We can return regions from the selection that were in levels above
    // `shapefiles.topLevel` with this
    this._getIDsFromLevel(index).forEach(helper);
    if (this._topLevelName != undefined) {
        return regions.map(id => (this._topLevelName + this._SEPARATOR + id).split(this._SEPARATOR));
    }
    // else for example, ccisCountryName is defined and each id already has a top level name
    return regions.map(id => id.split(this._SEPARATOR));
}

module.exports = RegionSelector;
