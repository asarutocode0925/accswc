# AccountSwitcher (Revenge Classic / Bunny互換)
1. `manifest.json` と `index.js` をGitHub Pages等で公開（同じフォルダ）
2. Settings > Plugins > ＋ に公開フォルダのURLを貼ってInstall
3. 各アカウントでログイン中に「現在のアカウントを保存」→ 一覧のタップで切替、長押しで削除

## 未検証
- 実機での切替動作（`loginToken` が無い場合 `LOGIN_SUCCESS` dispatch にフォールバック。再起動後に状態が戻る可能性あり）
- モックによる単体テスト(test.js)は通過済み。Discord本体のモジュール名は未確認

## 注意
- トークンは平文でプラグインstorageに保存される。共有・コピーしないこと
