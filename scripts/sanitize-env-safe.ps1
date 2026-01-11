# Script to safely sanitize .env files for git commits
# Backs up real values, sanitizes, then restores after commit

$envFiles = @(".env", ".env.development")

# Step 1: Backup real values
foreach ($file in $envFiles) {
    if (Test-Path $file) {
        $backupFile = "$file.backup"
        Copy-Item $file $backupFile -Force
        Write-Host "Backed up $file to $backupFile"
    }
}

# Step 2: Sanitize the files
foreach ($file in $envFiles) {
    if (Test-Path $file) {
        Write-Host "Sanitizing $file..."
        $content = Get-Content $file -Raw
        $sanitized = $content -replace '=([^\r\n]+)', '=""'
        $sanitized | Set-Content $file -NoNewline
        Write-Host "$file sanitized"
    }
}

Write-Host "Files sanitized. They will be restored after commit."
