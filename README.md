# Codex-

Brain Training（舒尔特表）单页应用。

## 本地打开
1. 进入项目目录。
2. 运行：
   ```bash
   python -m http.server 4173
   ```
   或：
   ```bash
   py -m http.server 4173
   ```
3. 浏览器访问：`http://localhost:4173/index.html`。

## 傻瓜式分享（所有人可直接用）
最简单方法是部署到 **GitHub Pages**：

1. 把当前代码 push 到 GitHub 仓库。
2. 打开仓库 `Settings` → `Pages`。
3. 在 `Build and deployment` 里选择：
   - Source: `Deploy from a branch`
   - Branch: `main`（或你的默认分支）
   - Folder: `/ (root)`
4. 点击 `Save`。
5. 等待 1~3 分钟后，会得到一个公开链接，例如：
   `https://你的用户名.github.io/仓库名/index.html`
6. 把这个链接发给任何人，对方点开即可使用（无需安装）。

## 一键部署替代方案
你也可以直接拖拽 `index.html` 到 Vercel / Netlify，几分钟拿到可分享链接。
