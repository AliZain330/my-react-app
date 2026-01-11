# Script to restore .env files from backup after commit

$envFiles = @(".env", ".env.development")

foreach ($file in $envFiles) {
    $backupFile = "$file.backup"
    if (Test-Path $backupFile) {
        Copy-Item $backupFile $file -Force
        Remove-Item $backupFile
        Write-Host "Restored real values to $file"
    }
}
