# Injective 决赛独立站点

这条部署线只服务 Injective 决赛，不复用、不覆盖现有 Pocket Earth 线上目录、进程、端口、nginx server block 或证书。

## 固定隔离参数

| 项目 | 值 |
|---|---|
| 比赛域名 | `pocketearth-injective.throughtheglass.art` |
| 远端目录 | `~/pocket-earth-injective` |
| PM2 进程 | `pocket-earth-injective` |
| 日更进程 | `pocket-earth-injective-knowledge` |
| Node 端口 | `3018` |
| nginx 配置 | `nginx-pocket-earth-injective.conf` |

域名必须使用短横线。`pocketearth_injective` 含下划线，不作为浏览器 HTTPS 主机名，也不能进入最终 PPT、二维码或证书命令。

## 当前状态

- `https://pocketearth-injective.throughtheglass.art/?demo` 已独立上线并启用 Let's Encrypt HTTPS。
- 远端目录 `/root/pocket-earth-injective`、端口 `3018`、PM2 Web 进程与 Daily Knowledge Worker 均已独立运行；旧域名和旧服务未修改。
- 比赛目录使用独立 `.env` 且包含 `API_PORT=3018`；严禁复用或覆盖其他应用的 `.env`。
- 部署脚本只上传最小运行依赖，并保留远端 `.env`、`node_modules/` 与 `var/knowledge/`；不会调用旧 Pocket Earth 的部署脚本。
- `pocket-earth-injective-knowledge` 每日独立抓取 AI、金融、科学、气候、文化五个领域，写入 `running/complete` 心跳，失败隔离并原子落盘；它不持有也不使用 Injective 签名器，链上版次只能人工审阅后显式提交。
- nginx server block 与证书已经安装；后续运行 `deploy.sh` 只更新独立应用包并重载两个 PM2 进程，不改 nginx 或证书。

## 首次部署 / 灾备复验顺序

```bash
# 1. 只读检查 DNS，必须返回目标服务器地址，且主机名不得含下划线
dig +short pocketearth-injective.throughtheglass.art A

# 2. 远端先建独立目录和独立 .env；至少包含 API_PORT=3018
# 3. 本机执行隔离部署
PEM=/path/to/key.pem REMOTE=root@server ./deploy/online/injective/deploy.sh

# 4. 把 nginx-pocket-earth-injective.conf 安装为新的 server block
# 5. nginx -t 通过后 reload
# 6. 只为新域名签证书
certbot --nginx -d pocketearth-injective.throughtheglass.art --non-interactive --agree-tos --redirect

# 7. 验收
curl -fsS https://pocketearth-injective.throughtheglass.art/healthz
curl -fsS 'https://pocketearth-injective.throughtheglass.art/api/injective?tool=get-public-earth'
curl -fsS 'https://pocketearth-injective.throughtheglass.art/api/knowledge?tool=today&topic=ai'
pm2 describe pocket-earth-injective-knowledge
```

Final7、Judge Quickstart 与 Demo Script 已统一使用独立比赛域名。每次更新后仍需运行上述验收，避免把 PM2 `online` 误当成 API、日更守护或 HTTPS 已真实可用。
