create user dashboard with password 'EnsureFirewallConfigured';
grant connect on database coldchain to dashboard;
grant usage on schema public to dashboard;
grant select on all tables in schema public to dashboard;
alter default privileges in schema public grant select on tables to dashboard;
