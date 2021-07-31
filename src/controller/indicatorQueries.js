function getIndicatorsQuery() {
    // information about datetime conversion
        // https://stackoverflow.com/questions/10207900/convert-nvarchar-iso-8601-date-to-datetime-in-sql-server
        // https://docs.microsoft.com/en-us/sql/t-sql/functions/cast-and-convert-transact-sql?view=sql-server-ver15
    // 126 is the date time code for times stored in ISO8601 format
        // list of other SQL-supported date time codes: https://www.w3schools.com/sql/func_sqlserver_convert.asp
    const DATE_TIME_CODE = 126;
    return `SELECT (SELECT COUNT(h.id_health_facilities) FROM health_facilities2_odkx as h) as num_hf,
                    MAX(CAST(r.savepointTimestamp_refrigerators as date)) as last_updated_ref,
                    (SELECT MAX(CAST(h.savepointTimestamp_health_facilities as date)) FROM health_facilities2_odkx as h) as last_updated_fac,
                    COUNT(r.id_refrigerators) as num_ref,
                    SUM(CASE WHEN r.maintenance_priority = 'high' THEN 1
                             WHEN r.maintenance_priority = 'low' THEN 1
                             ELSE 0
                         END) as need_maintanance
            FROM refrigerators_odkx as r`;
}

module.exports = { getIndicatorsQuery };
