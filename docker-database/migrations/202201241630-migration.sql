alter table refrigerator_temperature_data_odkx
add column ft_serial_number varchar(255);

create table ft_daily_temp_records_odkx
(
    rowETag varchar,
    dataETagAtModification varchar,
    deleted varchar,
    createUser varchar,
    formId varchar,
    locale varchar,
    savepointType varchar,
    savepointCreator varchar,
    selfUri varchar,
    lastUpdateUser_ft_daily_temp_records varchar,
    savepointTimestamp_ft_daily_temp_records varchar,
    android_sys_time varchar,
    avg_temp varchar,
    battery varchar,
    checked_time varchar,
    data_source varchar,
    date varchar,
    date_read varchar,
    ft_serial_number varchar,
    h_cond varchar,
    high_alarm varchar,
    high_duration varchar,
    high_trigger_time varchar,
    l_cond varchar,
    low_alarm varchar,
    low_duration varchar,
    low_trigger_time varchar,
    max_temp varchar,
    max_temp_time varchar,
    min_temp varchar,
    min_temp_time varchar,
    refrigerator_id varchar(255),
    units varchar,
    id_ft_daily_temp_records varchar(255)
);

create index ft_daily_temp_records_odkx_refrigerator_index
    on ft_daily_temp_records_odkx (refrigerator_id);
