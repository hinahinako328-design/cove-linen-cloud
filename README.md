# LINEN CLOUD

Cove Studioのサンプルサイト(架空クライアント)。子供服ブランド(D2C)、
北欧ナチュラルトーン。SUNNYSIDE(`cafe-sample`)と対になるポートフォリオ用サンプル。

## 技術スタック

- 静的HTML/CSS/JS(ビルド不要)
- GSAP + ScrollTrigger(スクロール連動アニメーション)
- Lenis(慣性スムーススクロール)
- フォント: 見出しFraunces、本文Karla(Google Fonts)

## セクション構成とモーション技法

9セクションそれぞれに別技法を割り当てている(使い回し禁止方針)。詳細は`js/main.js`の
コメント、および各技法の元になったCove知識ベースの分析ファイルを参照。

1. Hero — GSAP画像レイヤー + 見出しscale-down
2. Collection — staggered fade reveal
3. Craft/Story — desaturate→color reveal + 多層scrubパララックス
4. Details — pinned circle→fullbleed reveal
5. Gallery — cursor-following label pill(デスクトップのみ)+ 横スクロール
6. Testimonial — 文字単位クロスフェード
7. Stockists — 控えめマーキー
8. Newsletter — フォームのマイクロインタラクション
9. Footer — SVGロゴのline-draw

## ローカルで確認する

```bash
python3 _nocache_server.py 8953
# http://localhost:8953/index.html を開く
```

## 画像について

現在`img/`配下の画像は**全てプレースホルダー**(`_gen_placeholders.py`で生成した
配色グラデーション)です。本番画像への差し替え手順は`img/_generation-prompts.md`を
参照してください(NanoBanana用プロンプト15点+保存先パス+差し替え後のチェックリスト)。

画像差し替え後は`_gen_placeholders.py`をリポジトリから削除してください(納品物に含めない)。

## デプロイ

GitHub → Vercelのフロー(Coveのデフォルト)。
Vercelプロジェクト名は`cove-linen-cloud`を想定。
