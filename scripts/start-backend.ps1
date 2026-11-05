. "$PSScriptRoot\dev-environment.ps1"
if (!(Get-Command java.exe -ErrorAction SilentlyContinue)) { throw 'Install JDK 17 first.' }
Set-Location "$projectRoot\furniture-api-main"
# Working directory matters: SQLite and uploaded images use relative paths.
& "$projectRoot\apache-maven-3.9.10-bin\apache-maven-3.9.10\bin\mvn.cmd" --batch-mode --no-transfer-progress spring-boot:run
exit $LASTEXITCODE
