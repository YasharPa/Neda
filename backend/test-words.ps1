# Runs the authenticated /api/words tests against the local server.
# Usage (from the backend folder):  powershell -ExecutionPolicy Bypass -File .\test-words.ps1
# Reads the token saved by get-token.ps1 (or pass one with -Token).
# Creates one test word and deletes it again at the end.
param([string]$Token)

if (-not $Token) {
  $tokenFile = Join-Path $PSScriptRoot ".token"
  if (-not (Test-Path $tokenFile)) { Write-Host "No token found. Run .\get-token.ps1 first."; exit 1 }
  $Token = (Get-Content $tokenFile -Raw).Trim()
}

$base = "http://localhost:3000/api"
$auth = "Authorization: Bearer $Token"
$json = "Content-Type: application/json"
$tmp = Join-Path $env:TEMP "neda-word-test.json"

function Send($label, $expected, [string[]]$curlArgs) {
  $out = & curl.exe -s -w "`n%{http_code}" @curlArgs
  $lines = $out -split "`n"
  $code = $lines[-1]
  $body = ($lines[0..($lines.Length - 2)] -join "`n")
  $mark = if ($code -eq "$expected") { "PASS" } else { "FAIL" }
  Write-Host "[$mark] $label -> $code (expected $expected)"
  if ($body) { Write-Host "       $body" }
  return $body
}

function WriteJson($text) {
  # UTF-8 without BOM, so express.json() can parse it
  [IO.File]::WriteAllText($tmp, $text, (New-Object Text.UTF8Encoding $false))
}

Send "who am I" 200 @("$base/me", "-H", $auth) | Out-Null
Send "list words" 200 @("$base/words?limit=2", "-H", $auth) | Out-Null

WriteJson '{"hebrew":"שלום","persian":"سلام","example_sentence":"test sentence","category":"test","user_id":"00000000-0000-0000-0000-000000000000"}'
$created = Send "add word (with a fake user_id in the body)" 201 @("-X", "POST", "$base/words", "-H", $auth, "-H", $json, "-d", "@$tmp")
$id = ($created | ConvertFrom-Json).data.id
if (-not $id) { Write-Host "Could not create a word, stopping."; exit 1 }
Write-Host "       new id: $id"

Send "get the new word" 200 @("$base/words/$id", "-H", $auth) | Out-Null

WriteJson '{"difficulty":"easy"}'
Send "patch difficulty = easy" 200 @("-X", "PATCH", "$base/words/$id", "-H", $auth, "-H", $json, "-d", "@$tmp") | Out-Null

WriteJson '{"difficulty":"banana"}'
Send "patch difficulty = banana (question 4)" 400 @("-X", "PATCH", "$base/words/$id", "-H", $auth, "-H", $json, "-d", "@$tmp") | Out-Null

WriteJson '{"hebrew":"תודה","persian":"ممنون","example_sentence":"edited","category":"test"}'
Send "put full update" 200 @("-X", "PUT", "$base/words/$id", "-H", $auth, "-H", $json, "-d", "@$tmp") | Out-Null

Send "delete the word" 204 @("-X", "DELETE", "$base/words/$id", "-H", $auth) | Out-Null
Send "delete it again" 404 @("-X", "DELETE", "$base/words/$id", "-H", $auth) | Out-Null
Send "get the deleted word" 404 @("$base/words/$id", "-H", $auth) | Out-Null

WriteJson '{"difficulty":"easy"}'
Send "patch a word that does not exist" 404 @("-X", "PATCH", "$base/words/11111111-1111-1111-1111-111111111111", "-H", $auth, "-H", $json, "-d", "@$tmp") | Out-Null
Send "get with an id that is not a uuid" 404 @("$base/words/abc", "-H", $auth) | Out-Null

Remove-Item $tmp -ErrorAction SilentlyContinue
