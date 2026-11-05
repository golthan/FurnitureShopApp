. "$PSScriptRoot\dev-environment.ps1"
if (!(Get-Command node.exe -ErrorAction SilentlyContinue)) { throw 'Install Node.js first.' }
$adb = "$env:ANDROID_HOME\platform-tools\adb.exe"
$emulator = "$env:ANDROID_HOME\emulator\emulator.exe"
if (!(Test-Path $adb) -or !(Test-Path $emulator)) { throw 'Install Android SDK platform-tools and Android Emulator in Android Studio.' }
$devices = & $adb devices
if (!($devices -match '^emulator-\d+\s+')) {
    $avd = & $emulator -list-avds | Select-Object -First 1
    if (!$avd) { throw 'Create an Android virtual device in Android Studio Device Manager first.' }
    Start-Process -FilePath $emulator -ArgumentList '-avd', $avd -WindowStyle Hidden
}
Write-Host 'Waiting for the Android emulator to finish booting...'
$booted = $false
for ($attempt = 0; $attempt -lt 90; $attempt++) {
    $state = $null
    try { $state = & $adb -e shell getprop sys.boot_completed 2>$null } catch { }
    if ($state -match '^1\s*$') { $booted = $true; break }
    Start-Sleep -Seconds 2
}
if (!$booted) { throw 'Emulator did not finish booting. Check Android Studio Device Manager.' }
Set-Location "$projectRoot\App-Main\furniture-app"
if (!(Test-Path 'node_modules\expo\bin\cli')) { throw 'Run npm.cmd install in App-Main\furniture-app first.' }
# Expo Go SDK 53 must already be installed. Avoid remote checks while using ADB localhost.
$env:EXPO_OFFLINE = '1'
& node.exe node_modules\expo\bin\cli start --localhost --android
exit $LASTEXITCODE
