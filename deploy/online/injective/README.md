# Injective 决赛独立站点

这条部署线只服务 Injective 决赛，不复用、不覆盖现有 Pocket Earth 线上目录、进程、端口、nginx server block 或证书。

## 固定隔离参数

| 项目 | 值 |
|---|---|
| 比赛域名 | `pocketearth-injective.throughtheglass.art` |
| 远端目录 | `~/pocket-earth-injective` |
| PM2 进程 | `pocket-earth-injective` |
| Node 端口 | `3018` |
| nginx 配置 | `nginx-pocket-earth-injective.conf` |

域名必须使用短横线。`pocketearth_injective` 含下划线，不作为浏览器 HTTPS 主机名，也不能进入最终 PPT、二维码或证书命令。

## 当前状态

- 仓库只准备独立部署包；尚未上传、重启、修改 nginx 或申请证书。
- DNS A 记录改为 `pocketearth-injective` 并生效后，才执行远端部署。
- 正式上线前，先在比赛目录创建独立 `.env`，并确认 `API_PORT=3018`；严禁复用或覆盖其他应用的 `.env`。

## 最终执行顺序

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
```

上线后再统一替换 Final PPT、Judge Quickstart、Demo Script 与二维码中的 Live Demo 地址；在新站点真实通过前，不把占位地址写成“已上线”。
