# new-code

贝的云端小应用合集。每个应用都是根目录下的一个独立 HTML 文件，没有构建步骤。

推送到 `main` 后，GitHub Actions（`.github/workflows/deploy-pages.yml`）会把整个仓库发布到 GitHub Pages。网站首页 `index.html` 是导航页，列出所有应用。

## 小游戏

| 应用 | 文件 | 说明 |
| --- | --- | --- |
| 星际突围 | `star-raid.html` | 3D 太空射击，可安装为手机应用（`star-raid.webmanifest`） |
| 方仓 · 机关浮岛 | `sokoban-3d.html` | 3D 推箱子解谜 |
| 合成守城 | `merge-defense.html` | 合成炮塔塔防 |
| 齿轮工厂 | `gear-factory.html` | 齿轮传动解谜 |
| 扫雷 | `minesweeper.html` | 经典扫雷，带排行榜 |
| 2048 | `2048.html` | 划动合并数字 |
| 星点突围 | `level-game.html` | 点击星点闯关 |
| 接住星光 | `game.html` | 30 秒接星星小游戏 |

## 小工具

| 应用 | 文件 | 说明 |
| --- | --- | --- |
| 每日暖心话 | `daily-cheer.html` | 每天一句暖心话，需登录 |
| 附近推荐 | `nearby.html` | 基于定位的附近吃喝玩乐推荐（高德地图） |
| 穿搭配色工具 | `outfit-colors.html` | 穿搭颜色推荐 |
| 面料颜色搭配工具 | `fabric-colors.html` | 面料颜色推荐 |

## 数据存储

排行榜和用户数据存在一个共用的 Supabase 项目里。`.github/workflows/keep-supabase-alive.yml` 每天写一次心跳，防止免费项目因闲置被暂停。

## 新增应用

1. 在根目录新建一个 `.html` 文件。
2. 在 `index.html` 导航页和本 README 里各加一行。
3. 合并到 `main`，几分钟后自动上线。
