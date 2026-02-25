$cons = Get-NetTCPConnection -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -ge 62100 -and $_.LocalPort -le 62150 }
if (-not $cons) {
    Write-Output 'No TCP connections in range'
}
else {
    Write-Output "--- TCP connections in range ---"
    $cons | Select-Object LocalAddress, LocalPort, State, OwningProcess | Format-Table -AutoSize
    $pids = $cons | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $pids) {
        try {
            Write-Output "--- Process info for PID $pid ---"
            Get-Process -Id $pid | Select-Object Id, ProcessName, Path | Format-Table -AutoSize
        }
        catch {
            Write-Output "PID:$pid - process not found or access denied"
        }
    }
}

Write-Output "`n--- netstat matches (:621) ---"
netstat -ano | Select-String ":621" | ForEach-Object { $_.ToString() }
