#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Launches epubfm on a local HTTP server and opens it in the browser.
.PARAMETER Port
    Port number to serve on (default: 8080).
.PARAMETER NoOpen
    Do not automatically open the browser.
#>
param(
    [int]$Port = 8080,
    [switch]$NoOpen
)

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

$env:PORT = "$Port"

if (Get-Command node -ErrorAction SilentlyContinue) {
    $argsList = @('server.js')
    if (-not $NoOpen) {
        $argsList += '--open'
    }
    & node @argsList
}
elseif (Get-Command python -ErrorAction SilentlyContinue) {
    $url = "http://localhost:$Port"
    Write-Host "Starting epubfm via Python on $url ..." -ForegroundColor Cyan
    if (-not $NoOpen) {
        Start-Process $url
    }
    & python -m http.server $Port --bind 127.0.0.1
}
else {
    Write-Warning "Neither Node.js nor Python was found in PATH. Opening index.html directly (note: ?book= URL fetching requires HTTP)."
    Start-Process (Join-Path $PSScriptRoot 'index.html')
}
