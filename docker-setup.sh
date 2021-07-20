sudo docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=UseOnlyForLocalTesting!" \
  --name tsqltest -h tsqltest -p 1433:1433 \
  -d mcr.microsoft.com/mssql/server:2019-latest
sudo docker exec -it sql1 /opt/mssql-tools/bin/sqlcmd \
   -S localhost -U SA -P "<YourStrong@Passw0rd>" \
   -Q 'ALTER LOGIN SA WITH PASSWORD="<YourNewStrong@Passw0rd>"'
sqlcmd -U sa -P $$SA_PASSWORD -l 30 -e -i $$foo
