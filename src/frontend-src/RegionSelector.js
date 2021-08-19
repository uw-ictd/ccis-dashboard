
//const level2Ids = level2Uganda.features.map(getLayerId);
//const level3Ids = level3Uganda.features.map(getLayerId);
//const boundaries = level2Uganda.features.concat(level3Uganda.features);

// Call this in `map.on('load', ...)`
// regionNamesContainer must be a ul element to display region names within
function RegionSelector({mapboxgl}, map, shapefiles, regionNamesContainer) {
    this._SELECT_OPACITY = 0.7;
    this._DESELECT_OPACITY = 0.1;
    this._SEPARATOR = '|';
    this._TOP = '__top__';
    this._map = map;
    this._shapefiles = shapefiles;
    this._currentParent = null;
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
    this._regionNameKeys = shapefiles.regionNameKeys;
    // The map will only show boundaries between these two levels
    this._topLevelIndex = shapefiles.levelNames.indexOf(shapefiles.topLevel);
    this._bottomLevelIndex = shapefiles.levelNames.indexOf(shapefiles.bottomLevel);
    this._hierarchy = this._makeHierarchy(shapefiles);

    this.getSelectedRegions = getSelectedRegions;
    this._showRegionSelectionInstr = showRegionSelectionInstr;
    this._regionNamesContainer = regionNamesContainer;

    // This default double-click handler needs to be registered before the
    // individual event handlers for each layer
    map.on('dblclick', () => {
        // If we are at the lowest level, any double-click should return to the top
        const currentIndex = this._currentParent === this._TOP ?
                             this._topLevelIndex :
                             this._currentParent.split(this._SEPARATOR).length;
        if (currentIndex >= this._bottomLevelIndex) {
            this._showMapAtNode(this._TOP);
        }
    });
    // Add GeoJSON to the map
    const boundaries = shapefiles.levels
        .slice(this._topLevelIndex, this._bottomLevelIndex + 1)
        .map(level => level.features)
    boundaries.flat().forEach(this._addLayerToMap);
    // All but the last level
    const upperLevelBoundaries = boundaries.slice(0, -1);
    upperLevelBoundaries.flat().forEach((geoJSONFeature => {
        const layerID = this._getRegionID(geoJSONFeature);
        map.on('dblclick', layerID, this._showMapAtNode.bind(this, layerID));
    }).bind(this));
    this._showMapAtNode(this._TOP);
    this._showRegionSelectionInstr(mapboxgl);
}

function showMapAtNode(regionLayerID) {
    // Clear prior boundaries
    this._currentLayers.forEach(layerID => {
        this._map.setLayoutProperty(layerID, 'visibility', 'none');
        this._deselect(layerID);
    });
    this._currentLayers = null;
    // Add all children of this node to layers and show them
    const children = this._hierarchy[regionLayerID];
    children.forEach(layerID => {
        this._map.setLayoutProperty(layerID, 'visibility', 'visible');
        this._select(layerID);
    });
    this._currentLayers = children;
    this._currentParent = regionLayerID;
}

function showRegionSelectionInstr(mapboxgl) {
    let customAtt;
    if (this._shapefiles.levels.length == 2) {
        customAtt = "Click to select/deselect an area; double click a region to select" +
        "only its districts; double click again to return to region selection.";
    } else if (this._shapefiles.levels.length == 1) {
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
    hierarchy[this._TOP] = this._getIDsFromLevel(this._topLevelIndex);
    // We start at 1 since the nodes at level 0 don't have parents
    for (let i = 1; i <= this._bottomLevelIndex; i++) {
        levels[i].features.forEach(geoJSONFeature => {
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
    return this._regionNameKeys
        .map(key => geoJSONFeature.properties[key])
        .filter(name => !!name) // Remove empty strings
        .join(this._SEPARATOR);
}

// Examples:
//   getParentRegionID('Uganda|Kampala|Kampala') = 'Uganda|Kampala'
//   getParentRegionID('Uganda|Kampala') = 'Uganda'
//   getParentRegionID('Uganda') throws an Error
function getParentRegionID(childRegionID) {
    if (childRegionID.indexOf(this._SEPARATOR) < 0) {
        throw new Error(`Child region ${childRegionID} must have a parent!`);
    }
    return childRegionID.substr(0, childRegionID.lastIndexOf(this._SEPARATOR));
}

function select(layerID) {
    this._selections[layerID] = true;
    this._map.setPaintProperty(layerID, 'fill-opacity', this._SELECT_OPACITY);
    this._displayRegionNames();
}

function deselect(layerID) {
    this._selections[layerID] = false;
    this._map.setPaintProperty(layerID, 'fill-opacity', this._DESELECT_OPACITY);
    this._displayRegionNames();
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

function toggleSelection(layerID) {
    this._selections[layerID] ? this._deselect(layerID) : this._select(layerID);
}

// Throughout, but especially in this function, we assume that
// `shapefiles.regionNameKeys` and `shapefiles.levels` have the same length
// and that `regionNameKeys[i]` corresponds to `levels[i]` (and to
// `levelNames[i]`).
function isLowestLevel(layerID) {
    return layerID.split(this._SEPARATOR).length >= this._bottomLevelIndex;
}

function addLayerToMap(geoJSONFeature) {
    const layerID = this._getRegionID(geoJSONFeature);
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
    this._map.on('click', layerID, toggleSelection.bind(this, layerID));
}

function getIDsFromLevel(shapefilesIndex) {
    return this._shapefiles.levels[shapefilesIndex].features
        .map(this._getRegionID);
}

function getSelectedRegions() {
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
    // We can return regions from the selection that were in levels above
    // `shapefiles.topLevel` with this
    this._getIDsFromLevel(0).forEach(helper);
    return regions.map(id => id.split(this._SEPARATOR));
}

module.exports = RegionSelector;
