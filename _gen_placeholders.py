#!/usr/bin/env python3
"""LINEN CLOUD プレースホルダー画像生成スクリプト。
NanoBanana生成画像が届くまでのレイアウト確認用。納品物には含めない。
配色: base #FAF7F2 / sub #A9B79C / accent #D6A99D / dark #5C5347
"""
from PIL import Image, ImageDraw, ImageFilter
import random
import math

random.seed(7)

BASE = (250, 247, 242)
SUB = (169, 183, 156)
ACCENT = (214, 169, 157)
DARK = (92, 83, 71)

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def gradient(w, h, c1, c2, angle=90):
    img = Image.new("RGB", (w, h), c1)
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / h
        draw.line([(0, y), (w, y)], fill=lerp(c1, c2, t))
    if angle != 90:
        img = img.rotate(angle, expand=False, resample=Image.BICUBIC)
        img = img.resize((w, h))
    return img

def add_grain(img, amount=8):
    px = img.load()
    w, h = img.size
    for _ in range(int(w * h * 0.02)):
        x, y = random.randint(0, w - 1), random.randint(0, h - 1)
        r, g, b = px[x, y]
        n = random.randint(-amount, amount)
        px[x, y] = (max(0, min(255, r + n)), max(0, min(255, g + n)), max(0, min(255, b + n)))
    return img

def save(img, name, blur=0):
    if blur:
        img = img.filter(ImageFilter.GaussianBlur(blur))
    img.save(f"img/{name}")
    print("wrote", name)

# Hero: リネン布の質感プレースホルダー(横長)
img = gradient(1600, 1000, lerp(BASE, SUB, 0.15), lerp(SUB, DARK, 0.25), angle=100)
img = add_grain(img, 6)
save(img, "hero-fabric.jpg")

# Hero装飾: 小さな糸巻き/ボタン風の丸(透過PNG)
deco = Image.new("RGBA", (400, 400), (0, 0, 0, 0))
d = ImageDraw.Draw(deco)
d.ellipse([40, 40, 360, 360], fill=ACCENT + (255,))
d.ellipse([150, 150, 250, 250], fill=BASE + (255,))
deco.save("img/hero-button.png")
print("wrote hero-button.png")

# Collectionグリッド用 4枚
for i in range(1, 5):
    t = i / 5
    c1 = lerp(BASE, ACCENT, 0.1 + t * 0.2)
    c2 = lerp(SUB, DARK, 0.1 + t * 0.3)
    img = gradient(900, 1100, c1, c2, angle=95 + i * 10)
    img = add_grain(img, 5)
    save(img, f"collection-{i}.jpg")

# Craft/Story背景(desaturate対象、質感強め)
img = gradient(1800, 1200, lerp(SUB, DARK, 0.3), lerp(BASE, SUB, 0.2), angle=80)
img = add_grain(img, 10)
save(img, "craft-fabric.jpg")

# Details クローズアップ(ステッチ想定、正方形)
img = gradient(1200, 1200, lerp(ACCENT, BASE, 0.2), lerp(DARK, SUB, 0.3), angle=45)
img = add_grain(img, 8)
save(img, "details-stitch.jpg")

# Gallery 4枚(後ろ姿/手元イメージのプレースホルダー、縦長)
for i in range(1, 5):
    c1 = lerp(BASE, SUB, 0.15 + i * 0.05)
    c2 = lerp(ACCENT, DARK, 0.1 + i * 0.05)
    img = gradient(900, 1200, c1, c2, angle=60 + i * 15)
    img = add_grain(img, 6)
    save(img, f"gallery-{i}.jpg")

print("done")
