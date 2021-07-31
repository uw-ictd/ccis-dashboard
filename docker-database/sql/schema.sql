/*
 * This folder is used for setting up the test database. The test database is
 * used when you run `npm test`, for instance. When the docker container for the
 * test database starts, it adds all the files in this folder to the container,
 * files with an `.sql` extension are run only the first time the container
 * starts.
 */
create table cold_room_maintenance_logs_odkx
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
	lastUpdateUser_cold_room_maintenance_logs varchar,
	savepointTimestamp_cold_room_maintenance_logs varchar,
	actions_taken varchar,
	cold_room_id varchar,
	date_serviced varchar,
	other_maintenance_notes varchar,
	other_repair_notes varchar,
	other_spare_parts varchar,
	preventative_notes varchar,
	repair_notes varchar,
	serviced_by varchar,
	spare_parts varchar,
	technician_name varchar,
	technician_phone varchar,
	total_hrs_of_operation_unit1 varchar,
	total_hrs_of_operation_unit2 varchar,
	type_of_maintenance varchar,
	type_of_preventative_maintenance varchar,
	type_of_repair varchar,
	id_cold_room_maintenance_logs varchar
);

create table cold_rooms_odkx
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
	lastUpdateUser_cold_rooms varchar,
	savepointTimestamp_cold_rooms varchar,
	backup_generator varchar,
	backup_generator_functional_status varchar,
	dimensions varchar,
	facility_row_id varchar,
	functional_status varchar,
	gross_volume varchar,
	maintenance_priority varchar,
	manufacturer varchar,
	model varchar,
	net_volume varchar,
	notes varchar,
	reason_not_working varchar,
	serial_number varchar,
	storage_temperature varchar,
	temperature_monitoring_device varchar,
	temperature_monitoring_device_functional_status varchar,
	temperature_monitoring_device_type varchar,
	tracking_id varchar,
	type varchar,
	utilization varchar,
	year varchar,
	id_cold_rooms varchar
);

create table geographic_regions_odkx
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
	lastUpdateUser_geographic_regions varchar,
	savepointTimestamp_geographic_regions varchar,
	groupModify varchar,
	groupPrivileged varchar,
	groupReadOnly varchar,
	levelNumber varchar,
	location_accuracy varchar,
	location_altitude varchar,
	location_latitude varchar,
	location_longitude varchar,
	regionLevel1 varchar,
	regionLevel2 varchar,
	regionLevel3 varchar,
	regionLevel4 varchar,
	regionLevel5 varchar,
	regionName varchar,
	id_geographic_regions varchar(255)
);

create index geographic_regions_odkx_index
	on geographic_regions_odkx (id_geographic_regions);

create table health_facilities2_odkx
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
	lastUpdateUser_health_facilities varchar,
	savepointTimestamp_health_facilities varchar,
	Location_accuracy varchar,
	Location_altitude varchar,
	Location_latitude varchar,
	Location_longitude varchar,
	admin_region_id varchar(255),
	authority varchar,
	catchment_population varchar,
	cceGroupModify varchar,
	cceGroupPrivileged varchar,
	cceGroupReadOnly varchar,
	contact_name varchar,
	contact_phone_number varchar,
	contact_title varchar,
	distance_to_supply varchar,
	electricity_source varchar,
	facility_level varchar,
	facility_name varchar,
	facility_status varchar,
	fuel_availability varchar,
	grid_power_availability varchar,
	immunization_services_offered varchar,
	number_of_cold_boxes varchar,
	number_of_fs_cold_boxes varchar,
	number_of_fs_vaccine_carriers varchar,
	number_of_l3_packs varchar,
	number_of_l4_packs varchar,
	number_of_l6_packs varchar,
	number_of_vaccine_carriers varchar,
	ownership varchar,
	primary_facility_id varchar,
	secondary_facility_id varchar,
	spare_fuel_cylinders varchar,
	spare_temp_monitoring_devices varchar,
	vaccine_supply_interval varchar,
	vaccine_supply_mode varchar,
	id_health_facilities varchar(255)
);

create index health_facilities2_odkx_index
	on health_facilities2_odkx (id_health_facilities);

create index health_facilities2_odkx_region_index
	on health_facilities2_odkx (admin_region_id);

create table maintenance_logs_odkx
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
	lastUpdateUser_maintenance_logs varchar,
	savepointTimestamp_maintenance_logs varchar,
	actions_taken varchar,
	date_serviced varchar,
	other_maintenance_notes varchar,
	other_repair_notes varchar,
	other_spare_parts varchar,
	preventative_notes varchar,
	refrigerator_id varchar,
	repair_notes varchar,
	serviced_by varchar,
	spare_parts_electrical varchar,
	spare_parts_hardware varchar,
	spare_parts_monitoring varchar,
	spare_parts_power varchar,
	spare_parts_refrigeration varchar,
	spare_parts_solar varchar,
	technician_name varchar,
	technician_phone varchar,
	type_of_maintenance varchar,
	type_of_preventative_maintenance varchar,
	type_of_repair varchar,
	id_maintenance_logs varchar
);

create table refrigerator_moves_odkx
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
	lastUpdateUser_refrigerator_moves varchar,
	savepointTimestamp_refrigerator_moves varchar,
	move_date varchar,
	new_facility_id varchar,
	old_facility_id varchar,
	refrigerator_id varchar,
	id_refrigerator_moves varchar
);

create table refrigerator_temperature_data_odkx
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
	lastUpdateUser_refrigerator_temperature_data varchar,
	savepointTimestamp_refrigerator_temperature_data varchar,
	days_temp_above_8_30 varchar,
	days_temp_below_2_30 varchar,
	number_of_high_alarms_30 varchar,
	number_of_low_alarms_30 varchar,
	refrigerator_id varchar,
	reporting_period varchar,
	id_refrigerator_temperature_data varchar
);

create table refrigerator_types_odkx
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
	lastUpdateUser_refrigerator_types varchar,
	savepointTimestamp_refrigerator_types varchar,
	catalog_id varchar,
	climate_zone varchar,
	equipment_type varchar,
	freezer_gross_volume varchar,
	freezer_net_volume varchar,
	manufacturer varchar,
	model_id varchar,
	power_source varchar,
	refrigerator_gross_volume varchar,
	refrigerator_net_volume varchar,
	refrigerator_picture_contentType varchar,
	refrigerator_picture_uriFragment varchar,
	id_refrigerator_types varchar(255)
);

create index refrigerator_types_odkx_index
	on refrigerator_types_odkx (id_refrigerator_types);

create table refrigerators_odkx
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
	lastUpdateUser_refrigerators varchar,
	savepointTimestamp_refrigerators varchar,
	ehc_powered_devices varchar,
	facility_row_id varchar(255),
	functional_status varchar,
	maintenance_priority varchar,
	model_row_id varchar(255),
	notes varchar,
	power_source varchar,
	reason_not_working varchar,
	serial_number varchar,
	serial_number_image_contentType varchar,
	serial_number_image_uriFragment varchar,
	temperature_monitoring_device varchar,
	temperature_monitoring_device_functional_status varchar,
	temperature_monitoring_device_type varchar,
	tracking_id varchar,
	under_warranty varchar,
	utilization varchar,
	voltage_regulator varchar,
	voltage_regulator_functional_status varchar,
	voltage_regulator_serial_number varchar,
	warranty_service_provider_contact varchar,
	warranty_service_provider_name varchar,
	year_installed varchar,
	year_procured varchar,
	id_refrigerators varchar
);

create index refrigerators_odkx_facility_index
	on refrigerators_odkx (facility_row_id);

create index refrigerators_odkx_model_index
	on refrigerators_odkx (model_row_id);

CREATE VIEW
    vw_ref_type_class
AS
SELECT id_refrigerator_types, model_id, manufacturer, CAST
(CASE
WHEN model_id = 'CFD-50' THEN 'ILR'
WHEN model_id = 'GVR 100 AC' THEN 'ILR'
WHEN model_id = 'GVR 225 AC' THEN 'ILR'
WHEN model_id = 'GVR 25 Lite' THEN 'ILR'
WHEN model_id = 'GVR 50 AC' THEN 'ILR'
WHEN model_id = 'HBC-150' THEN 'ILR'
WHEN model_id = 'HBC-200' THEN 'ILR'
WHEN model_id = 'HBC-260' THEN 'ILR'
WHEN model_id = 'HBC-340' THEN 'ILR'
WHEN model_id = 'HBC-80' THEN 'ILR'
WHEN model_id = 'HBCD-90' THEN 'ILR'
WHEN model_id = 'MK 074' THEN 'ILR'
WHEN model_id = 'MK 304' THEN 'ILR'
WHEN model_id = 'MK 404' THEN 'ILR'
WHEN model_id = 'MKF 074' THEN 'ILR'
WHEN model_id = 'TCW 3000 AC' THEN 'ILR'
WHEN model_id = 'TCW 4000 AC' THEN 'ILR'
WHEN model_id = 'VLS 064 RF' THEN 'ILR'
WHEN model_id = 'VLS 200A Greenline' THEN 'ILR'
WHEN model_id = 'ZLF 100AC' THEN 'ILR'
WHEN model_id = 'ZLF30AC' THEN 'ILR'
WHEN model_id = 'RCW 42 EG/CF' THEN 'Absorption'
WHEN model_id = 'RCW 42 EK/CF' THEN 'Absorption'
WHEN model_id = 'RCW 50 AC' THEN 'Absorption'
WHEN model_id = 'RCW 50 EK' THEN 'Absorption'
WHEN model_id = 'V 110 GE' THEN 'Absorption'
WHEN model_id = 'V 170 EK' THEN 'Absorption'
WHEN model_id = 'V 170 GE' THEN 'Absorption'
WHEN model_id = 'DW-25W147' THEN 'Freezer'
WHEN model_id = 'DW-25W300' THEN 'Freezer'
WHEN model_id = 'FCW 20 EG/CF' THEN 'Freezer'
WHEN model_id = 'FCW 20 EK/CF' THEN 'Freezer'
WHEN model_id = 'FCW 200' THEN 'Freezer'
WHEN model_id = 'FCW 300' THEN 'Freezer'
WHEN model_id = 'HBD-116' THEN 'Freezer'
WHEN model_id = 'HBD-286' THEN 'Freezer'
WHEN model_id = 'HTD-40' THEN 'Freezer'
WHEN model_id = 'MF 114' THEN 'Freezer'
WHEN model_id = 'MF 214' THEN 'Freezer'
WHEN model_id = 'MF 314' THEN 'Freezer'
WHEN model_id = 'PF 230 IP KE' THEN 'Freezer'
WHEN model_id = 'TFW 3000 AC' THEN 'Freezer'
WHEN model_id = 'TFW 40 SDD' THEN 'Freezer'
WHEN model_id = 'TFW 800' THEN 'Freezer'
WHEN model_id = 'Unknown Freezer' THEN 'Freezer'
WHEN model_id = 'VFS 048 SDD' THEN 'Freezer'
WHEN model_id = 'BFRV 15 SDD' THEN 'Solar'
WHEN model_id = 'BFRV 55' THEN 'Solar'
WHEN model_id = 'BLF 100 DC' THEN 'Solar'
WHEN model_id = 'CFD-50 SDD' THEN 'Solar'
WHEN model_id = 'CFS49 ISI' THEN 'Solar'
WHEN model_id = 'GVR 25 Lite DC' THEN 'Solar'
WHEN model_id = 'GVR 50 SDD' THEN 'Solar'
WHEN model_id = 'GVR 55 FF DC' THEN 'Solar'
WHEN model_id = 'HTC 110 SDD' THEN 'Solar'
WHEN model_id = 'HTC 40 SDD' THEN 'Solar'
WHEN model_id = 'HTC-112' THEN 'Solar'
WHEN model_id = 'HTC-60' THEN 'Solar'
WHEN model_id = 'HTC-60H' THEN 'Solar'
WHEN model_id = 'HTCD 90 SDD' THEN 'Solar'
WHEN model_id = 'HTCD-160' THEN 'Solar'
WHEN model_id = 'MKS 044' THEN 'Solar'
WHEN model_id = 'Model 120-30' THEN 'Solar'
WHEN model_id = 'NRC 30-10' THEN 'Solar'
WHEN model_id = 'PS40' THEN 'Solar'
WHEN model_id = 'PS65' THEN 'Solar'
WHEN model_id = 'PVR150' THEN 'Solar'
WHEN model_id = 'RCW 42DC/CF' THEN 'Solar'
WHEN model_id = 'RCW 50DC/CF' THEN 'Solar'
WHEN model_id = 'TBP VR 50' THEN 'Solar'
WHEN model_id = 'TCW 15 SDD' THEN 'Solar'
WHEN model_id = 'TCW 15R SDD' THEN 'Solar'
WHEN model_id = 'TCW 2000 DC' THEN 'Solar'
WHEN model_id = 'TCW 2000 SDD' THEN 'Solar'
WHEN model_id = 'TCW 2043 SDD' THEN 'Solar'
WHEN model_id = 'TCW 3000' THEN 'Solar'
WHEN model_id = 'TCW 3000 DC' THEN 'Solar'
WHEN model_id = 'TCW 3000 SDD' THEN 'Solar'
WHEN model_id = 'TCW 3043 SDD' THEN 'Solar'
WHEN model_id = 'TCW 40 SDD' THEN 'Solar'
WHEN model_id = 'TCW 4000 SDD' THEN 'Solar'
WHEN model_id = 'TCW 40R SDD' THEN 'Solar'
WHEN model_id = 'Ultra 16 SDD' THEN 'Solar'
WHEN model_id = 'VaccPack XL 2100' THEN 'Solar'
WHEN model_id = 'VaccPack XL 6000' THEN 'Solar'
WHEN model_id = 'VC 110 SDD' THEN 'Solar'
WHEN model_id = 'VC 150 SDD' THEN 'Solar'
WHEN model_id = 'VC 150-2' THEN 'Solar'
WHEN model_id = 'VC 200 SDD' THEN 'Solar'
WHEN model_id = 'VC 200-1' THEN 'Solar'
WHEN model_id = 'VC 30 SDD' THEN 'Solar'
WHEN model_id = 'VC 50 SDD' THEN 'Solar'
WHEN model_id = 'VC 60 SDD-1' THEN 'Solar'
WHEN model_id = 'VC 65-2' THEN 'Solar'
WHEN model_id = 'VC 88 SDD' THEN 'Solar'
WHEN model_id = 'VC-150 F' THEN 'Solar'
WHEN model_id = 'VC-65 F' THEN 'Solar'
WHEN model_id = 'VLS 024 SDD Greenline' THEN 'Solar'
WHEN model_id = 'VLS 026 RF Green Line' THEN 'Solar'
WHEN model_id = 'VLS 054 SDD Greenline' THEN 'Solar'
WHEN model_id = 'VLS 056 RF SDD' THEN 'Solar'
WHEN model_id = 'VLS 094 SDD Greenline' THEN 'Solar'
WHEN model_id = 'VLS 154 SDD Greenline' THEN 'Solar'
WHEN model_id = 'VR50F' THEN 'Solar'
WHEN model_id = 'ZLF 100DC' THEN 'Solar'
WHEN model_id = 'ZLF150DC' THEN 'Solar'
WHEN model_id = 'ZLF30DC SDD' THEN 'Solar'
WHEN model_id = 'DOVLINE' THEN 'Other'
WHEN model_id = 'RFVB-134a' THEN 'Other'
WHEN model_id = 'VC 139 F' THEN 'Other'
END AS varchar) AS refrigerator_class
FROM refrigerator_types_odkx;

