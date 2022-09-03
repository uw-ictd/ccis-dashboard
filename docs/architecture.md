# Deployment Architecture
```
Dashboard server (Dockerized) -- nginx -- user browser
  |           |
  |           |
database    ODK-X LDAP server
  |
  |
sync program with ODK-X database
```

# Testing Architecture
```
            Test harness (Jest) -- Selenium
              |                      | (end-to-end tests only)
              |                      |
            Dashboard module(s) -- Firefox
              |             |
              |             | (end-to-end tests only)
Test database (in Docker)  ODK-X LDAP server
```

# Backend Routes
* /: Builds the HTML for the dashboard using EJS templates based on the config files
* /login
 - GET:  The login page
 - POST: Validates credentials against LDAP server and provides a cookie
* /api/query: Generate data for a visualization in the proper format. SQL is dynamically generated based on the specified visualization structure
* /api/rawTable: Export a table from the database to CSV
* /api/bigTable: Export one of a few custom joined tables to CSV (more human-readable)
* /api/keyIndicators: A small fixed set of database summary statistics

# Configuration files
The basic requirements for setting up the dashboard are in the `.env` file in the root folder. This is described in more detail in `README.md`.  The rest of the configuration files are in the `src/config/` folder, and should be updated by a deployment architect.

Data visualization/processing:
 * `visualizations.js`: This is the core config file, which defines the available visualizations. This is described in more detail in `docs/visualizations.md`
 * `computedColumns.js`: Some visualizations rely on some custom logic, which is implemented by a deployment architect as SQL queries, defined here. These computed columns are referenced in `visualizations.js`
 * `filterSpecification.js`: Defines which fields are available in the interface to filter the data on. For dropdowns where we want to group certain options together, this file references `model/refrigeratorClasses.json` and `model/facilityClasses.json`, which can also be updated by a deployment architect

Frontend (UI):
 * `colorScheme.js`: Defines colors used in visualizations
 * `mapDisplay.js`: Defines default locations (on the globe) for the various maps
 * `tabVisualizations.js`: Defines the tabs: what are the names of the tabs, in what order, with which visualizations

Shapefiles (administrative regions):
 * `shapefiles.js`: Describes how to interpret the shapefiles, referencing other JSON files with the actual boundary data (e.g.`Uganda_Districts_2020.json`, `Uganda_Regions_2020.json`)
