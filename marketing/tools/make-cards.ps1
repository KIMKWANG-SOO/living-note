# 카드뉴스 PNG 생성기 — JSON 스펙을 받아 1080x1080 카드 이미지를 렌더링한다.
# 사용법: powershell -File make-cards.ps1 -SpecPath cards.json -OutDir output\2026-07-19
# JSON 스펙 형식:
# {
#   "cards": [
#     { "type": "cover",   "heading": "표지 제목", "body": "부제목" },
#     { "type": "content", "heading": "소제목",   "body": "본문. \n 줄바꿈 가능" },
#     { "type": "end",     "heading": "더 자세한 내용은", "body": "living-note.vercel.app" }
#   ]
# }
param(
    [Parameter(Mandatory = $true)][string]$SpecPath,
    [Parameter(Mandatory = $true)][string]$OutDir
)

Add-Type -AssemblyName System.Drawing

$spec = Get-Content -LiteralPath $SpecPath -Raw -Encoding UTF8 | ConvertFrom-Json
if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Force $OutDir | Out-Null }

$W = 1080; $H = 1080
$accent = [System.Drawing.Color]::FromArgb(35, 55, 255)      # 사이트 악센트 블루
$dark = [System.Drawing.Color]::FromArgb(15, 18, 25)
$gray = [System.Drawing.Color]::FromArgb(96, 115, 159)
$white = [System.Drawing.Color]::White

$total = $spec.cards.Count
$i = 0
foreach ($card in $spec.cards) {
    $i++
    $bmp = New-Object System.Drawing.Bitmap $W, $H
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $isCover = $card.type -eq 'cover'
    $isEnd = $card.type -eq 'end'

    if ($isCover) {
        # 표지: 악센트 배경 + 흰 글씨
        $g.Clear($accent)
        $headColor = $white; $bodyColor = [System.Drawing.Color]::FromArgb(220, 228, 255)
        $footColor = [System.Drawing.Color]::FromArgb(200, 210, 255)
    }
    else {
        $g.Clear($white)
        # 상단 악센트 바
        $bar = New-Object System.Drawing.SolidBrush $accent
        $g.FillRectangle($bar, 0, 0, $W, 18)
        $bar.Dispose()
        $headColor = $dark; $bodyColor = [System.Drawing.Color]::FromArgb(34, 41, 57)
        $footColor = $gray
    }

    $headBrush = New-Object System.Drawing.SolidBrush $headColor
    $bodyBrush = New-Object System.Drawing.SolidBrush $bodyColor
    $footBrush = New-Object System.Drawing.SolidBrush $footColor

    $headFont = New-Object System.Drawing.Font('Malgun Gothic', 52, [System.Drawing.FontStyle]::Bold)
    $bodyFont = New-Object System.Drawing.Font('Malgun Gothic', 34, [System.Drawing.FontStyle]::Regular)
    $footFont = New-Object System.Drawing.Font('Malgun Gothic', 22, [System.Drawing.FontStyle]::Regular)
    $pageFont = New-Object System.Drawing.Font('Malgun Gothic', 22, [System.Drawing.FontStyle]::Bold)

    $fmt = New-Object System.Drawing.StringFormat
    if ($isCover -or $isEnd) {
        $fmt.Alignment = [System.Drawing.StringAlignment]::Center
        $headRect = New-Object System.Drawing.RectangleF 80, 340, 920, 360
        $bodyRect = New-Object System.Drawing.RectangleF 100, 700, 880, 240
    }
    else {
        $fmt.Alignment = [System.Drawing.StringAlignment]::Near
        $headRect = New-Object System.Drawing.RectangleF 80, 130, 920, 280
        $bodyRect = New-Object System.Drawing.RectangleF 80, 430, 920, 500
    }

    $g.DrawString([string]$card.heading, $headFont, $headBrush, $headRect, $fmt)
    if ($card.body) {
        $g.DrawString(([string]$card.body -replace '\\n', "`n"), $bodyFont, $bodyBrush, $bodyRect, $fmt)
    }

    # 페이지 번호 (표지 제외)
    if (-not $isCover) {
        $pageFmt = New-Object System.Drawing.StringFormat
        $pageFmt.Alignment = [System.Drawing.StringAlignment]::Far
        $g.DrawString("$i / $total", $pageFont, $footBrush, (New-Object System.Drawing.RectangleF 800, 50, 200, 50), $pageFmt)
        $pageFmt.Dispose()
    }

    # 푸터 브랜드
    $footFmt = New-Object System.Drawing.StringFormat
    $footFmt.Alignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString('생활정보노트 | living-note.vercel.app', $footFont, $footBrush, (New-Object System.Drawing.RectangleF 40, 990, 1000, 60), $footFmt)
    $footFmt.Dispose()

    $outPath = Join-Path $OutDir ('card-{0:d2}.png' -f $i)
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $fmt.Dispose(); $g.Dispose(); $bmp.Dispose()
    $headBrush.Dispose(); $bodyBrush.Dispose(); $footBrush.Dispose()
    $headFont.Dispose(); $bodyFont.Dispose(); $footFont.Dispose(); $pageFont.Dispose()
    Write-Output "생성: $outPath"
}
Write-Output "완료: $total 장"
