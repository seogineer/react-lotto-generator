"""번호 연구소 앱 로고(600x600 PNG) 생성 스크립트. 사용: python3 make_logo.py"""
from PIL import Image, ImageDraw, ImageFilter
import math

S = 4                      # 슈퍼샘플링 배율
W = 600 * S
BG = (15, 118, 110)        # teal-700, 앱의 brand 색
WHITE = (255, 255, 255)
LIQUID = (153, 246, 228)   # teal-200 계열

def P(x, y):
    return (x * S, y * S)

def rounded(mask, radius):
    """볼록한 모서리를 둥글게 만든다(블러 후 임계값)."""
    blurred = mask.filter(ImageFilter.GaussianBlur(radius * S))
    return blurred.point(lambda v: 255 if v > 128 else 0)

img = Image.new("RGB", (W, W), BG)

# 플라스크 몸통(삼각 플라스크)
flask = Image.new("L", (W, W), 0)
d = ImageDraw.Draw(flask)
d.polygon([P(256, 120), P(344, 120), P(344, 268), P(470, 452), P(446, 506), P(154, 506), P(130, 452), P(256, 268)], fill=255)
flask = rounded(flask, 9)
# 입구 테두리
rim = Image.new("L", (W, W), 0)
ImageDraw.Draw(rim).rounded_rectangle([P(230, 84), P(370, 124)], radius=18 * S, fill=255)
flask = Image.composite(Image.new("L", (W, W), 255), flask, rim)

img.paste(Image.new("RGB", (W, W), WHITE), mask=flask)

# 액체: 플라스크 안쪽, 윗면은 물결
liquid = Image.new("L", (W, W), 0)
ld = ImageDraw.Draw(liquid)
pts = [P(0, 600)]
for i in range(0, 601, 6):
    pts.append(P(i, 352 + 9 * math.sin(i / 600 * 2 * math.pi * 2.2)))
pts.append(P(600, 600))
ld.polygon(pts, fill=255)
# 테두리 두께만큼 안쪽 영역: 블러 후 높은 임계값으로 침식 효과를 낸다(MinFilter는 큰 이미지에서 매우 느림)
inner = flask.filter(ImageFilter.GaussianBlur(22 * S / 1.645)).point(lambda v: 255 if v > 242 else 0)
liquid = Image.composite(liquid, Image.new("L", (W, W), 0), inner)
img.paste(Image.new("RGB", (W, W), LIQUID), mask=liquid)

# 번호 공 3개 (앱의 공 색: 노랑, 파랑, 로즈)
draw = ImageDraw.Draw(img, "RGBA")
balls = [((232, 440, 40), (250, 204, 21)), ((304, 412, 40), (59, 130, 246)), ((374, 442, 40), (244, 63, 94))]
for (cx, cy, r), color in balls:
    draw.ellipse([P(cx - r, cy - r), P(cx + r, cy + r)], fill=color + (255,))
    draw.ellipse([P(cx - r * 0.55, cy - r * 0.62), P(cx - r * 0.05, cy - r * 0.2)], fill=(255, 255, 255, 120))

# 위로 올라오는 기포(분석 중인 느낌)
for cx, cy, r in [(300, 306, 11), (320, 262, 8), (290, 226, 6), (310, 188, 4.5)]:
    draw.ellipse([P(cx - r, cy - r), P(cx + r, cy + r)], fill=(45, 212, 191, 255))

out = img.resize((600, 600), Image.LANCZOS)
out.save("logo-numberlab-600.png", "PNG", optimize=True)
print("saved", out.size, out.mode)
