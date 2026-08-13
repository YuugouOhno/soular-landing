# 事前確認フォーム — サービス間 API 契約

soular-inc.com に申込フォーム（precontract）を集約するにあたり、
**soular 側は状態を持たず、同意データは各サービスの DB に保存する**という方針で設計する。

- soular = フォーム UI・法務文書・ゲート（**ハードコードされたデータのみ**）
- 各サービス = 同意データの保存・OTP のライフサイクル・メール送信（**個人情報の所有者**）

---

## 1. 責務の分割

| | soular-landing | 各サービス（HRMS / aichat / ripichan） |
|---|---|---|
| 法務文書の文面・版 | **持つ**（ハードコード） | 持たない |
| プラン定義・料金 | **持つ**（ハードコード） | 持たない |
| 合言葉ゲート | **持つ**（HMAC cookie） | — |
| 入力検証 | 持つ（一次） | **持つ（最終・信用しない前提）** |
| 同意データの保存 | **持たない** | **持つ**（自分の DB） |
| OTP 発行・検証 | **持たない** | **持つ**（atomic 判定） |
| メール送信（OTP・控え・社内通知） | **持たない** | **持つ** |
| 規約 PDF | 持つ（配信元） | 添付時に soular から取得 |

soular が保持するのは **cookie 3つだけ**（合言葉・プラン・submissionId）。
氏名・メール・電話は**通過するのみで保存しない**。

---

## 2. フロー

```
顧客 → soular-inc.com/precontract/[service]
   ① 合言葉ゲート（HMAC cookie・DB不要）
   ② プラン/金額入力 → 署名付き cookie
   ③ 重説・規約を表示（ハードコード）
   ④ 申込者情報を入力して送信
        │ soular の Server Action が中継（HMAC署名）
        ↓
   POST https://<service>/api/consents
        サービス: 検証 → 自DBに pending 保存 → OTP メール送信
        ← { submissionId }
        │ soular は submissionId を httpOnly cookie に置くだけ
        ↓
   ⑤ /precontract/[service]/verify で 6桁入力
        ↓
   POST https://<service>/api/consents/verify
        サービス: atomic 検証 → 控えメール（PDF添付）→ 社内通知
        ← { status: "ok" }
```

**OTP 入力画面は soular 側に置く**（サービスへリダイレクトしない）。
途中でドメインが変わると体験が割れ、「soular に統一」の意図にも反するため。

---

## 3. 認証（サービス間）

全リクエストに HMAC-SHA256 署名を付ける。**サービスごとに別シークレット**。

```
X-Soular-Timestamp: 1786621517          # UNIX 秒
X-Soular-Signature: sha256=<hex>        # HMAC(secret, "<timestamp>.<raw body>")
```

- 署名対象は `"<timestamp>.<生のリクエストボディ>"`。**パース後の値ではなく生のバイト列**で検証する
- **タイムスタンプが ±5 分を超えるリクエストは拒否**（リプレイ防止）
- 比較は `timingSafeEqual`
- シークレットは soular 側 `PRECONTRACT_SERVICE_SECRET_<SERVICE>`、サービス側 `PRECONTRACT_SOULAR_SECRET`

---

## 4. `POST /api/consents`

同意を作成し OTP を送る。

### リクエスト

```jsonc
{
  "service": "dental",              // サービス側は自分宛か検証する
  "contractPlan": "3y",
  "applicant": {
    "clinicName": "…", "applicantName": "…", "applicantKana": "…",
    "roleTitle": "", "email": "…", "phone": "…",
    "salesRep": "…", "servicePlan": "…", "scheduledContractDate": "2026-09-01",
    "note": "", "preferredContact": ""
  },
  "consent": {
    "agreedTerms": true, "agreedPrivacy": true, "agreedImportant": true,
    "selfInputConfirmed": true,
    "checklist": { "term_penalty": true, "disclaimer": true,
                   "late_fee": true, "data_backup": true, "fee_agreement": true }
  },
  "documents": {
    "termsVersion": "2026-06-20",
    "privacyVersion": "2026-06-20",
    "importantVersion": "2026-06-22",
    "importantText": "version:2026-06-22\n「デンタルマネージャー」重要事項説明書\n…",
    "importantHash": "sha256 hex"
  },
  "client": { "ip": "…", "userAgent": "…" }
}
```

**`importantText` を丸ごと送るのが要点。** サービス側は文面を持たず、
**顧客が実際に提示された本文そのもの**を保存する。監査上もこれが正しい。

### サービス側が必ずやること

1. **署名とタイムスタンプの検証**（失敗は 401）
2. `service` が自分宛か検証（違えば 400）
3. **`importantText` から SHA-256 を再計算し `importantHash` と一致するか検証**（不一致は 400）
   — soular が送ってきたハッシュを鵜呑みにしない
4. 入力の再検証（soular の一次検証を信用しない）
5. **レート制限（fail-closed）** — DB を持つのはサービス側なので、ここが本来の防衛線。
   IP 単位・メール単位で制限し、レート制限機構がエラーなら**送信しない**
6. pending で保存 → OTP 発行 → メール送信

### レスポンス

```jsonc
{ "submissionId": "uuid" }                       // 201
{ "error": "rate_limited", "retryAfterSeconds": 42 }  // 429
{ "error": "invalid_signature" }                 // 401
{ "error": "hash_mismatch" | "validation_failed", "fields": {…} }  // 400
```

> 作成に成功して OTP 送信だけ失敗した場合も **201 と submissionId を返す**。
> フォームに戻すと同じ内容が再送信され孤立レコードが増えるため、確認画面へ進めて再送させる。

---

## 5. `POST /api/consents/verify`

```jsonc
// リクエスト
{ "submissionId": "uuid", "code": "123456", "client": { "ip": "…" } }

// レスポンス
{ "status": "ok" }
{ "status": "already_used" }
{ "status": "invalid" | "expired" | "locked" | "no_otp" | "not_found" }
```

サービス側は `verify_consent_otp` 相当で **atomic に判定**する
（期限・試行上限・再利用・コード一致を行ロック下で確定）。
成功時に控えメール（版に紐づく PDF 添付）と社内通知を送る。

## 6. `POST /api/consents/resend`

```jsonc
{ "submissionId": "uuid", "client": { "ip": "…" } }
→ { "status": "sent" } | { "status": "rate_limited", "retryAfterSeconds": 42 }
```

クールダウン（60秒）・submission/メール/IP 単位の上限はサービス側で持つ。

---

## 6.5 `POST /api/consents/status`

確認画面の描画に必要な**最小情報だけ**を返す。soular は同意データを持たないため、
「誰宛にコードを送ったか」「確認済みか」をここから取る。

```jsonc
// リクエスト
{ "submissionId": "uuid" }

// レスポンス
{
  "service": "dental",
  "status": "pending" | "verified",
  "emailMasked": "ta***@example.com"   // ← マスク済み。素のアドレスは返さない
}
```

**素のメールアドレスを返さないこと。** soular に個人情報を渡さない設計の要。
不明な submissionId は 404 を返し、soular 側はフォーム先頭へ戻す。

## 7. 規約 PDF

控えメールへの添付はサービス側が行うが、**PDF の配信元は soular**。

```
https://soular-inc.com/legal/terms_<service>_<version>.pdf
https://soular-inc.com/legal/important_<service>[_<plan>]_<version>.pdf
```

サービス側は上記を fetch → base64 → 添付。取得できなければスキップして送信は継続する。

---

## 8. 実装状況

| サービス | 状況 |
|---|---|
| **HRMS** | `consent_submissions` テーブル・`verify_consent_otp` / `check_rate_limit` RPC・メール送信が**既に全部ある**。既存ロジックを API でラップするだけ |
| **aichat** | 同上（HRMS より古い版だが同等の基盤あり） |
| **ripichan** | **DynamoDB に新規実装が必要**。Amplify なので RPC 相当は条件付き書き込みで組み直す |

## 9. 移行期間の扱い

各サービスの既存 `/precontract` ルートは**当面残す**。
soular 側が安定してから、既存ルートを soular へ 301 リダイレクトする。
