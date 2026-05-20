# 🔑 UUID Generator

> UUID 批量生成器 — UUID v4 / v7 / v1 · 批量生成 · 多种格式

## ✨ 功能

| 功能 | 说明 |
|---|---|
| 🔢 **UUID v4** | 基于 `crypto.getRandomValues` 的随机 UUID（最常用） |
| ⏱ **UUID v7** | 时间排序 UUID，天然递增，数据库 B-Tree 索引更友好 |
| 📜 **UUID v1** | 时间戳 + 时钟序列 + 节点 MAC 地址格式 |
| 📦 **批量生成** | 滑块或数字输入，1 ~ 10,000 个 |
| 🎨 **格式选项** | 大写/小写、连字符开关、花括号 `{}`、引号 `""`、逗号分隔 |
| ⚡ **高性能** | 生成 1,000 个 UUID 仅需几毫秒 |
| 📋 **复制/下载** | 一键复制全部，或下载为 `.txt` 文件 |

## 🛠 技术栈

- 纯 HTML5 + CSS3 + JavaScript
- Web Crypto API (`crypto.getRandomValues`)
- 零外部依赖

## 🚀 部署

支持 Vercel / Netlify / Cloudflare Pages 等静态托管平台。

```bash
npx vercel --prod
```

## 🔒 隐私

所有处理在浏览器端完成，无需网络请求。

## 📄 许可

MIT
