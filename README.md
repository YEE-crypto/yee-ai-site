# YEE Personal Hub

YEE 的个人互联网主页，包含：

- `/`：个人主页与项目入口
- `/ai/`：AI 产品与服务
- `/stablecoin/`：稳定币与投资研究

## 技术方案

纯 HTML、CSS 和原生 JavaScript，无框架、无数据库、无构建步骤，适合通过 GitHub + Cloudflare Pages 免费部署。

Cloudflare Pages 配置：

- Production branch：`main`
- Framework preset：None
- Build command：留空
- Build output directory：`/`

## 本地预览

在仓库目录运行：

```bash
python3 -m http.server 4173
```

然后打开 `http://localhost:4173/`。
