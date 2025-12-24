# v1.1.0 開発計画: プロンプトローダーとアーキテクチャ改善

## 1. 目的
- ユーザーがObsidian Vault内のMarkdownファイルでプロンプトをカスタマイズできるようにする。
- アプリケーションの堅牢性（フェイルセーフ）と保守性を向上させる。

## 2. アーキテクチャ変更 (リファクタリング)

### ディレクトリ構成の整理
`src/core/` にあるサービスクラスを `src/services/` に移動し、責務を明確化する。

```text
src/
├── config/          # 設定、デフォルトプロンプト、定数
├── core/            # アプリの中核ロジック (ObsidAX, PromptLoader)
├── services/        # 外部サービス連携
│   ├── ObsidianService.ts  (coreから移動)
│   ├── XService.ts         (coreから移動)
│   └── UserInteraction.ts  (新規作成: 対話機能の抽象化)
├── strategies/      # 各モードの戦略
├── types/           # 型定義 (Schema含む)
└── index.ts         # エントリーポイント
```

## 3. 新規実装機能

### A. 対話機能の抽象化 (`UserInteraction.ts`)
- **目的**: TTYチェックや `inquirer` の呼び出しを一元管理し、テスト容易性とコードの統一性を高める。
- **機能**:
    - `isInteractive()`: TTYチェック。
    - `askConfirm(message)`: 確認プロンプト。非対話時はエラーまたはデフォルト値を返す制御。
    - `askSelect(message, choices)`: 選択プロンプト。
- **適用**: `XPostStrategy` や `PromptLoader` のエラーハンドリングで使用。

### B. プロンプトファイルの仕様策定
- **形式**: Markdown + Frontmatter (YAML)。
- **場所**: `VAULT_ROOT/.obsidian-ai-cli/prompts/{lang}/{mode}.md` (例)
- **バリデーション**: `zod` を使用して構造をチェック。
    - Frontmatter: `description`, `version` 等
    - 本文: 必須、最低文字数制限など

### C. プロンプトローダー (`PromptLoader.ts`)
- **役割**: 指定されたプロンプトファイルを読み込み、バリデーションして返す。
- **責務**: 純粋な「読み込み」に徹する。対話やプロセス終了などの副作用は持たない。
- **挙動**:
    1. ファイル読み込み
    2. Frontmatter解析 (`gray-matter` 等を使用)
    3. Zodスキーマでバリデーション
    4. 成功ならコンテンツを返す。失敗ならエラーを投げる。

### D. エラーハンドリングとフォールバック (Strategy側で実装)
- `PromptLoader` がエラーを投げた場合：
    1. 警告ログを表示。
    2. `UserInteraction` を使ってユーザーに確認。「デフォルトプロンプトで続行しますか？」
    3. Yesなら内蔵デフォルト値を使用。Noなら処理中断。
    - **方針**: 勝手にフォールバックせず、ユーザーに主導権を委ねる。

## 4. 実装ステップ

- [x] **リファクタリング**: `src/services/` ディレクトリ作成と既存サービスの移動。
- [x] **基盤実装**: `UserInteraction` クラスの実装と `BaseStrategy` への組み込み。
- [x] **スキーマ定義**: プロンプトファイルの `zod` スキーマ定義。
- [x] **ローダー実装**: `PromptLoader` の実装 (`gray-matter` 導入)。
- [x] **統合**: `ObsidAX` または `Strategy` でローダーを使用するようにシグネチャを更新。
- [x] **テスト**: 各コンポーネントの単体テストと、読み込み失敗時のE2Eテスト。

---
### 2025-12-24 作業ログ
- v1.1.0計画に基づき、大規模なリファクタリングを実施。
- `src/services` ディレクトリを作成し、`ObsidianService`, `XService` を移動。
- 対話処理を抽象化するため `src/services/UserInteraction.ts` を作成し、`XPostStrategy` をリファクタリング。
- カスタムプロンプト読み込みの準備として、`zod` を用いたスキーマ (`src/types/schemas.ts`) と `PromptLoader` (`src/core/PromptLoader.ts`) の雛形を実装。
- `gray-matter` をインストール。
- `node --test` の実行時エラー (`ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`) を、コンストラクタの書き方を修正することで解決。
- テストコード内のモック実装を、クラス継承からオブジェクトリテラルに変更し、安定性を向上。
- 全ての変更後、`npm test` が成功することを確認。

### 2025-12-25 作業ログ
- プロンプトとシステムメッセージの分離リファクタリングを実施。
    - ユーザーが編集可能なプロンプトを `src/config/prompts/` に分離。
    - システムメッセージを `src/config/locales/` に集約し、誤編集を防止。
    - `src/config/text.ts` で両者を結合し、既存コードへの影響を最小限に抑えた。
- `PromptLoader.ts` と `defaultPrompt.ts` 内のハードコーディングされた英語テキストを `locales` ファイルに外部化し、完全な多言語対応を実現。
- プロパティ名の統一: `xPost` を `xpost` (小文字) に変更し、タイポのリスクを低減。
- 全ての変更後、`npm test` が成功することを確認。
