# 카드뉴스 PNG 생성기 — JSON 스펙을 받아 1080x1080 카드 이미지를 렌더링한다.
# 사용법: powershell -File make-cards.ps1 -SpecPath cards.json -OutDir output\2026-07-19
# JSON 스펙 형식:
# {
#   "cards": [
#     { "type": "cover",   "heading": "표지 제목", "body": "부제목", "icon": "car" },
#     { "type": "content", "heading": "소제목",   "body": "본문. \n 줄바꿈 가능" },
#     { "type": "end",     "heading": "더 자세한 내용은", "body": "living-note.kr", "icon": "tip" }
#   ]
# }
# icon 값(표지/마무리 카드에서만 사용, 주제에 맞는 것 하나 선택, 생략 가능):
#   car(자동차) house(부동산·전월세) shield(보험) document(민원서류·행정) plane(여행)
#   money(세금·정부지원금) phone(통신) shipping(해외직구) health(건강보험) tip(생활꿀팁·기본값)
param(
    [Parameter(Mandatory = $true)][string]$SpecPath,
    [Parameter(Mandatory = $true)][string]$OutDir
)

Add-Type -AssemblyName System.Drawing

$spec = Get-Content -LiteralPath $SpecPath -Raw -Encoding UTF8 | ConvertFrom-Json
if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Force $OutDir | Out-Null }

$W = 1080; $H = 1080
$accent = [System.Drawing.Color]::FromArgb(37, 99, 235)       # #2563eb
$accentDark = [System.Drawing.Color]::FromArgb(79, 70, 229)   # #4f46e5 (그라데이션 끝)
$dark = [System.Drawing.Color]::FromArgb(15, 18, 25)
$gray = [System.Drawing.Color]::FromArgb(96, 115, 159)
$white = [System.Drawing.Color]::White

# 주제별 간단한 플랫 아이콘을 GDI+ 도형으로 그린다 (외부 이미지 자산 없이 벡터로 직접 그림)
function Draw-Icon {
    param([System.Drawing.Graphics]$g, [float]$cx, [float]$cy, [float]$size, [System.Drawing.Color]$color, [string]$icon)
    $brush = New-Object System.Drawing.SolidBrush $color
    $half = $size / 2

    switch ($icon) {
        'car' {
            $bodyW = $size; $bodyH = $size * 0.42; $bodyY = $cy - $bodyH * 0.1
            $g.FillRectangle($brush, $cx - $bodyW / 2, $bodyY, $bodyW, $bodyH)
            $cabW = $size * 0.55; $cabH = $size * 0.3
            $g.FillRectangle($brush, $cx - $cabW / 2, $bodyY - $cabH * 0.85, $cabW, $cabH)
            $wr = $size * 0.13
            $g.FillEllipse($brush, $cx - $bodyW * 0.32 - $wr, $bodyY + $bodyH - $wr * 0.7, $wr * 2, $wr * 2)
            $g.FillEllipse($brush, $cx + $bodyW * 0.32 - $wr, $bodyY + $bodyH - $wr * 0.7, $wr * 2, $wr * 2)
        }
        'house' {
            $roof = @(
                [System.Drawing.PointF]::new($cx, $cy - $half),
                [System.Drawing.PointF]::new($cx + $half * 1.05, $cy - $half * 0.05),
                [System.Drawing.PointF]::new($cx - $half * 1.05, $cy - $half * 0.05)
            )
            $g.FillPolygon($brush, $roof)
            $g.FillRectangle($brush, $cx - $half * 0.62, $cy - $half * 0.1, $size * 0.62, $half * 1.05)
        }
        'shield' {
            $pts = @(
                [System.Drawing.PointF]::new($cx, $cy - $half),
                [System.Drawing.PointF]::new($cx + $half, $cy - $half * 0.35),
                [System.Drawing.PointF]::new($cx + $half * 0.68, $cy + $half * 0.55),
                [System.Drawing.PointF]::new($cx, $cy + $half),
                [System.Drawing.PointF]::new($cx - $half * 0.68, $cy + $half * 0.55),
                [System.Drawing.PointF]::new($cx - $half, $cy - $half * 0.35)
            )
            $g.FillPolygon($brush, $pts)
        }
        'document' {
            $g.FillRectangle($brush, $cx - $half * 0.62, $cy - $half, $size * 0.62, $size)
            $lineBrush = New-Object System.Drawing.SolidBrush $white
            for ($li = 0; $li -lt 3; $li++) {
                $ly = $cy - $half * 0.4 + $li * ($size * 0.22)
                $g.FillRectangle($lineBrush, $cx - $half * 0.4, $ly, $size * 0.5, $size * 0.08)
            }
            $lineBrush.Dispose()
        }
        'plane' {
            $pts = @(
                [System.Drawing.PointF]::new($cx, $cy - $half),
                [System.Drawing.PointF]::new($cx + $half * 0.28, $cy + $half * 0.28),
                [System.Drawing.PointF]::new($cx + $half, $cy + $half),
                [System.Drawing.PointF]::new($cx, $cy + $half * 0.35),
                [System.Drawing.PointF]::new($cx - $half, $cy + $half),
                [System.Drawing.PointF]::new($cx - $half * 0.28, $cy + $half * 0.28)
            )
            $g.FillPolygon($brush, $pts)
        }
        'money' {
            $g.FillEllipse($brush, $cx - $half, $cy - $half * 0.35, $size, $size * 0.78)
            $g.FillEllipse($brush, $cx - $half * 0.72, $cy - $half, $size * 0.72, $size * 0.78)
        }
        'phone' {
            $g.FillRectangle($brush, $cx - $half * 0.5, $cy - $half, $size * 0.5, $size)
            $holeBrush = New-Object System.Drawing.SolidBrush $white
            $g.FillEllipse($holeBrush, $cx - $size * 0.06, $cy + $half * 0.72, $size * 0.12, $size * 0.12)
            $holeBrush.Dispose()
        }
        'shipping' {
            $g.FillRectangle($brush, $cx - $half * 0.75, $cy - $half * 0.5, $size * 0.75, $size * 0.75)
            $lidPts = @(
                [System.Drawing.PointF]::new($cx - $half * 0.85, $cy - $half * 0.5),
                [System.Drawing.PointF]::new($cx, $cy - $half),
                [System.Drawing.PointF]::new($cx + $half * 0.85, $cy - $half * 0.5)
            )
            $g.FillPolygon($brush, $lidPts)
        }
        'health' {
            $barW = $size * 0.3
            $g.FillRectangle($brush, $cx - $barW / 2, $cy - $half, $barW, $size)
            $g.FillRectangle($brush, $cx - $half, $cy - $barW / 2, $size, $barW)
        }
        default {
            # tip (생활꿀팁): 전구
            $g.FillEllipse($brush, $cx - $half * 0.7, $cy - $half, $size * 0.7, $size * 0.75)
            $g.FillRectangle($brush, $cx - $half * 0.25, $cy + $half * 0.35, $size * 0.25, $size * 0.22)
        }
    }
    $brush.Dispose()
}

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
        # 표지: 대각선 그라데이션 배경(사이트 악센트 그라데이션과 통일) + 장식 도형 + 흰 글씨
        $gradRect = New-Object System.Drawing.Rectangle 0, 0, $W, $H
        $gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($gradRect, $accent, $accentDark, 45)
        $g.FillRectangle($gradBrush, $gradRect)
        $gradBrush.Dispose()

        # 배경 장식: 은은한 반투명 원 2개로 깊이감
        $deco1 = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(28, 255, 255, 255))
        $g.FillEllipse($deco1, -180, -220, 620, 620)
        $deco1.Dispose()
        $deco2 = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(22, 255, 255, 255))
        $g.FillEllipse($deco2, 760, 760, 520, 520)
        $deco2.Dispose()

        # 아이콘 배지: 흰 원 + 악센트색 아이콘
        $badgeR = 90
        $badgeCx = $W / 2; $badgeCy = 200
        $badgeBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(235, 255, 255, 255))
        $g.FillEllipse($badgeBrush, $badgeCx - $badgeR, $badgeCy - $badgeR, $badgeR * 2, $badgeR * 2)
        $badgeBrush.Dispose()
        $iconName = if ($card.icon) { [string]$card.icon } else { 'tip' }
        Draw-Icon -g $g -cx $badgeCx -cy $badgeCy -size ($badgeR * 1.05) -color $accent -icon $iconName

        $headColor = $white; $bodyColor = [System.Drawing.Color]::FromArgb(220, 228, 255)
        $footColor = [System.Drawing.Color]::FromArgb(200, 210, 255)
    }
    else {
        $g.Clear($white)
        # 상단 악센트 바
        $bar = New-Object System.Drawing.SolidBrush $accent
        $g.FillRectangle($bar, 0, 0, $W, 18)
        $bar.Dispose()
        # 우하단 은은한 브랜드 색 반원 장식(과하지 않게)
        $corner = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(14, 37, 99, 235))
        $g.FillEllipse($corner, $W - 260, $H - 260, 420, 420)
        $corner.Dispose()

        if ($isEnd) {
            $badgeR = 80
            $badgeCx = $W / 2; $badgeCy = 230
            $badgeBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 239, 246, 255))
            $g.FillEllipse($badgeBrush, $badgeCx - $badgeR, $badgeCy - $badgeR, $badgeR * 2, $badgeR * 2)
            $badgeBrush.Dispose()
            $iconName = if ($card.icon) { [string]$card.icon } else { 'tip' }
            Draw-Icon -g $g -cx $badgeCx -cy $badgeCy -size ($badgeR * 1.05) -color $accent -icon $iconName
        }

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
    if ($isCover) {
        $fmt.Alignment = [System.Drawing.StringAlignment]::Center
        $headRect = New-Object System.Drawing.RectangleF 80, 400, 920, 320
        $bodyRect = New-Object System.Drawing.RectangleF 100, 720, 880, 220
    }
    elseif ($isEnd) {
        $fmt.Alignment = [System.Drawing.StringAlignment]::Center
        $headRect = New-Object System.Drawing.RectangleF 80, 380, 920, 320
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
    $g.DrawString('생활정보노트 | living-note.kr', $footFont, $footBrush, (New-Object System.Drawing.RectangleF 40, 990, 1000, 60), $footFmt)
    $footFmt.Dispose()

    $outPath = Join-Path $OutDir ('card-{0:d2}.png' -f $i)
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $fmt.Dispose(); $g.Dispose(); $bmp.Dispose()
    $headBrush.Dispose(); $bodyBrush.Dispose(); $footBrush.Dispose()
    $headFont.Dispose(); $bodyFont.Dispose(); $footFont.Dispose(); $pageFont.Dispose()
    Write-Output "생성: $outPath"
}
Write-Output "완료: $total 장"
