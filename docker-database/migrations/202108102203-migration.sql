alter table refrigerator_temperature_data_odkx
alter column refrigerator_id type varchar(255);

alter table refrigerator_temperature_data_odkx
alter column id_refrigerator_temperature_data type varchar(255);

create index refrigerator_temperature_data_odkx_index
       on refrigerator_temperature_data_odkx (id_refrigerator_temperature_data);

create index refrigerator_temperature_data_odkx_refrigerator_index
       on refrigerator_temperature_data_odkx (refrigerator_id);
