# Export
From the export tab, you can download any of the CCIS data as a CSV (comma-separated value) file, which you can load into Excel or another spreadsheet program. The options labeled "ODK-X format" is an exact replica of the data as it is in the dashboard's database. The options labeled "CCIS format" may be a little more useful. The "CCIS format" tables have joined some of the underlying tables together; for instance, the CCIS refrigerator table also includes some limited information about facilities and geographic regions. The CCIS format tables leave out some of the columns that are present in the raw "ODK-X format" tables

The health facilities table is named "health_facilities2_odkx". The 2 here is a historical quirk and can be ignored. (In a future version of CCIS we should just remove the 2)

# Geographic filter
On the tabs displaying a single visualization (e.g. CCE), the filter on the left includes an option to filter by geographic areas. To use it, you'll need to double-click on a region.

The geographic filter has three levels (or "modes"): country mode (the default), region mode, and district mode. Double-clicking on the map changes levels from country to region to district, and then back to country.  In country mode, the filter is not particularly useful, since we only have one country's data here. In region/district mode you can select one or more regions/districts to be included. 

After setting the filter as you want it, you'll need to click "Display" again to reload the visualization

# System Use tab
The "System use" tab is where visualizations about use of CCIS can be found.
Some charts will show the last user to update a facility or CCE; on these, the "init" user is the CCIS system. If a facility or CCE was last updated by "init", this means that it has not been updated by a human since CCIS imported that data.

# Temperature alarms
There are two tables with temperature data, one with data reported daily, and one with data in 30-day buckets. Aggregating data from both tables together is challenging. Currently the visualizations only reflect data from the table with 30-day buckets

# Specific visualizations
## Update status by facility map
On this map, facilities are color-coded by their update status, which is divided into three buckets:
* red: never updated
* yellow: updated more than 3 months ago
* green: updated within the last 3 months
