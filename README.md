# YEE Personal Hub

YEE 的个人互联网主页，包含：

- `/`：个人主页与项目入口
- `/ai/`：AI 产品与服务
- `/stablecoin/`：稳定币与投资研究

首页、AI 服务页的购买入口统一指向 `https://faka.dawnform.top/`，在新标签页打开。本站不承载支付或账号登录。套餐为原有参考展示，最新价格、库存与交付规则以卡网商品页为准。

## 视觉与交互

深色页面与青蓝粒子光环，原生 Canvas 绘制，不加载第三方动画库。粒子支持鼠标视差、暂停、系统减少动态偏好与后台停帧。小屏幕降低粒子数量，像素密度上限为 2。正文和购买链接不依赖 JavaScript。

首页：`index.html`；全站样式：`assets/css/styles.css`；粒子：`assets/js/particles.js`；微信复制与入场效果：`assets/js/main.js`。

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
