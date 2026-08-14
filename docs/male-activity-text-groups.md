# 男性角色的活動文字群組

## 結論

BC 的 `ItemPenis` 與 `ItemGlans` 是活動文字字典所使用的別名，不是傳給
`ActivityAllowedForGroup` 的實體互動群組。

列舉及執行活動時仍應使用：

- `ItemVulva`
- `ItemVulvaPiercings`

只有在建立活動標籤或聊天訊息的字典鍵時，才依照目標角色切換：

| 實體群組 | 目標沒有陰莖 | 目標 `HasPenis()` |
|---|---|---|
| `ItemVulva` | `ItemVulva` | `ItemPenis` |
| `ItemVulvaPiercings` | `ItemVulvaPiercings` | `ItemGlans` |

因此男性目標的字典鍵例如：

```js
Label-ChatOther-ItemPenis-Caress
ChatOther-ItemGlans-Flick
```

但活動查詢仍是：

```js
ActivityAllowedForGroup(character, "ItemVulva");
ActivityAllowedForGroup(character, "ItemVulvaPiercings");
```

## BC 原始實作

規則來自 `Scripts/Activity.js` 的 `ActivityBuildChatTag`：

```js
const groupMap = {
    ItemVulva: "ItemPenis",
    ItemVulvaPiercings: "ItemGlans",
};
const realGroup = character.HasPenis() && groupMap[group.Name]
    ? groupMap[group.Name]
    : group.Name;
```

`ActivityAllowedForGroup` 會先透過 `ActivityGetGroupOrMirror` 取得真正的
`AssetGroup`。直接傳入 `ItemPenis` 或 `ItemGlans` 會因為沒有對應的實體
`AssetGroup` 而得到空清單。

## 插件實作注意事項

1. 動作列表：用實體群組查詢，再以目標角色決定標籤字典群組。
2. 聊天封包：`FocusAssetGroupName` 保留實體群組，但 `Content` 使用映射後的文字群組。
3. 全員動作：每位目標都要分別呼叫 `HasPenis()`，不能只建立一份共用封包。
4. 若男性字典鍵不存在，可退回實體群組的字典鍵，但不能反過來用男性別名查詢活動。

