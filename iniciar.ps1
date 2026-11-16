# Sobe o front em desenvolvimento com a chave do bot (X-API-Key) lida de um arquivo FORA do repositório.
#
# Uma vez só, crie o arquivo com a chave (uma linha, sem aspas):
#   New-Item -ItemType Directory -Force "$env:USERPROFILE\.meusecretario" | Out-Null
#   ssh root@212.47.65.37 cat /root/ms-bot.key | Set-Content -NoNewline "$env:USERPROFILE\.meusecretario\bot-api-key.txt"
#
# Depois, sempre:  .\iniciar.ps1
$keyFile = Join-Path $env:USERPROFILE '.meusecretario\bot-api-key.txt'

if (-not (Test-Path $keyFile)) {
    Write-Host "Arquivo da chave nao encontrado: $keyFile" -ForegroundColor Yellow
    Write-Host 'Crie-o com o comando do cabecalho deste script (ssh ... cat /root/ms-bot.key).' -ForegroundColor Yellow
    exit 1
}

$env:BOT_API_KEY = (Get-Content $keyFile -Raw).Trim()
npm start
