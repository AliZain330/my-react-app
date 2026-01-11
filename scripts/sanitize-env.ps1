# Script to sanitize .env files by replacing values with empty strings
# This preserves the key structure but removes sensitive values

$envFiles = @(".env", ".env.development")

foreach ($file in $envFiles) {
    if (Test-Path $file) {
        Write-Host "Sanitizing $file..."
        
        # Read the file content
        $content = Get-Content $file -Raw
        
        # Replace values (everything after =) with empty strings
        # Pattern matches: KEY=value -> KEY=""
        $sanitized = $content -replace '=([^\r\n]+)', '=""'
        
        # Write back to file
        $sanitized | Set-Content $file -NoNewline
        
        Write-Host "$file sanitized successfully"
    } else {
        Write-Host "$file not found, skipping..."
    }
}
