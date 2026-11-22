# 长按右键3倍速 + 短按快进

> 一个轻量的油猴脚本：在任意网页的视频上，**短按 → 快进 5 秒；长按 → 3 倍速播放，松开即恢复原速**。

[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-✓-2e7d32?style=flat-square)](#)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](#license)

##  特性

- **短按快进**：轻点一次 `→`，视频前进 5 秒（可配置）
- **长按加速**：按住超过 300ms 进入 3 倍速，松开立刻恢复原来的倍速
- **零侵入**：不修改页面 DOM、不注入样式，纯事件拦截
- **多视频支持**：页面上所有可见 `<video>` 同时生效（适合画中画 / 多路流）
- **不误伤**：输入框、编辑器里按方向键照常打字；`Ctrl/Alt/Shift` 组合键交给浏览器原生行为
- **直播友好**：遇到无 duration 的直播流会自动跳过，不会报错
- **防卡死兜底**：切标签、失焦时自动释放状态，避免"一直加速回不来"

##  安装

1. 浏览器安装 [Tampermonkey](https://www.tampermonkey.net/) 或 Violentmonkey 扩展
2. 点击下面的链接一键安装（或复制链接到扩展的「添加新脚本 → 从 URL 安装」）
