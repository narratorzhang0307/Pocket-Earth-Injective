# AhaKey 决赛演示手册

## 固定映射

拨杆使用 Mode 4（Custom）：

| 实体键 | 键码 | Pocket Earth 入口 |
| --- | --- | --- |
| 麦克风 | F13 | 口袋播客 |
| 对勾 | F14 | 地球答案 |
| 叉号 | F15 | 日落电台 |
| 退格 | F16 | 口袋地球主页 |

灯条的九种状态均写为关闭，存储亮度为最低档。所有按键只负责切换页面，不会自动播放声音。

## 上台前 3 分钟

1. 启动 Raspberry Pi，确认 Whisplay 已进入 Pocket Earth 安全桌面。
2. 把 AhaKey 拨杆放在 Mode 4。
3. **先按一次第四键（主页）作为安全预热。** 蓝牙键盘从深度休眠醒来时，第一次按键可能只唤醒无线电；主页键即使被收到也不会改变演示内容。
4. 等待 3–5 秒，再执行：

   ```bash
   ssh sunset-pi '/usr/bin/python3 /home/pi/pocket-earth/frost_pi_live_preflight.py --strict'
   ```

5. 报告中的 `hardware.ahaKey.ready` 与顶层 `ok` 必须同时为 `true`。

## 自动恢复

- `pocket-earth-ahakey-reconnect.service` 负责配对、信任、连接、配置写入和官方状态查询保活。
- `pocket-earth-ahakey.service` 监听所有名称含 `AhaKey` 的 Linux 输入设备；蓝牙断开后会自动重新发现输入节点。
- 两个服务均为 `Restart=always`，连续异常退出后会在 3–4 秒内恢复。
- BlueZ 连接超时会被显式取消，防止下一轮残留 `InProgress` 假连接。

## 有线备援边界

蓝牙是已经验证的主链路。路由器也能接管名称含 `AhaKey`、支持 F13–F16 的 USB HID 输入节点，但当前没有证据确认这台 X1 的 USB 口会暴露键盘 HID，因此不能把数据线当作已验证备援。赛前若要启用有线方案，必须先在 Pi 上看到对应输入节点与四个键码，再写入演示清单。

## 现场静音检查

```bash
ssh sunset-pi 'ps -eo comm,args | grep -E "ffplay|mpv|aplay|espeak|vlc" | grep -v grep || true'
```

无输出表示没有播放器或 TTS 进程正在发声。
