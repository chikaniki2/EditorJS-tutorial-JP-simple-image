# EditorJS-tutorial　個人用メモ

editor-js の BlockTool 作成チュートリアルで作成するツールに、解説コメントをつけた個人的なメモリポジトリです。

## 公式チュートリアル(English)
https://editorjs.io/creating-a-block-tool

## ツールインポート

``` JavaScript
// originalImageブロックとして登録する
// class はファイル定義しているクラス名。上記ブロック名と一致させる必要はない。

tools: {
  originalImage: {
    class: OriginalImage,
    config: {
      placeholder: '画像のURLを入力',
    }
  }
}
```
