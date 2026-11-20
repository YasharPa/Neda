# Runs the authenticated /api/driving/results tests against the local server.
# Usage (from the backend folder):  powershell -ExecutionPolicy Bypass -File .\test-driving.ps1
# Reads the token from backend\.token (or pass one with -Token).
# NOTE: the two valid answers are really saved (user_quiz_results + category stats).
param([string]$Token, [int]$QuestionId = 1)

if (-not $Token) {
  $tokenFile = Join-Path $PSScriptRoot ".token"
  if (-not (Test-Path $tokenFile)) { Write-Host "No token found. Save it to backend\.token first."; exit 1 }
  $Token = (Get-Content $tokenFile -Raw).Trim()
}

$base = "http://localhost:3000/api/driving/results"
$auth = "Authorization: Bearer $Token"
$json = "Content-Type: application/json"
$tmp = Join-Path $env:TEMP "neda-driving-test.json"
$session = [guid]::NewGuid().ToString()

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

function Post($label, $expected, $text, [bool]$withToken = $true) {
  # UTF-8 without BOM, so express.json() can parse it
  [IO.File]::WriteAllText($tmp, $text, (New-Object Text.UTF8Encoding $false))
  $curlArgs = @("-X", "POST", $base, "-H", $json, "-d", "@$tmp")
  if ($withToken) { $curlArgs += @("-H", $auth) }
  return Send $label $expected $curlArgs
}

# validation and auth, nothing is saved
Post "no token" 401 "{`"sessionId`":`"$session`",`"questionId`":$QuestionId,`"selectedAnswer`":0}" $false | Out-Null
Post "sessionId is not a uuid" 400 "{`"sessionId`":`"abc`",`"questionId`":$QuestionId,`"selectedAnswer`":0}" | Out-Null
Post "selectedAnswer = 7" 400 "{`"sessionId`":`"$session`",`"questionId`":$QuestionId,`"selectedAnswer`":7}" | Out-Null
Post "questionId = -5" 400 "{`"sessionId`":`"$session`",`"questionId`":-5,`"selectedAnswer`":0}" | Out-Null
Post "question that does not exist" 404 "{`"sessionId`":`"$session`",`"questionId`":99999999,`"selectedAnswer`":0}" | Out-Null

# a real answer: learn the correct answer from the response, then answer right and wrong
$first = Post "answer 0 (learn correctAnswer)" 201 "{`"sessionId`":`"$session`",`"questionId`":$QuestionId,`"selectedAnswer`":0,`"responseTime`":1500}"
if (-not $first) { exit 1 }
$correct = ($first | ConvertFrom-Json).data.correctAnswer
if ($null -eq $correct) { Write-Host "No correctAnswer in the response, stopping."; exit 1 }
$wrong = ($correct + 1) % 4

Post "right answer ($correct) -> isCorrect true" 201 "{`"sessionId`":`"$session`",`"questionId`":$QuestionId,`"selectedAnswer`":$correct}" | Out-Null
Post "wrong answer ($wrong) -> isCorrect false" 201 "{`"sessionId`":`"$session`",`"questionId`":$QuestionId,`"selectedAnswer`":$wrong}" | Out-Null

Remove-Item $tmp -ErrorAction SilentlyContinue
