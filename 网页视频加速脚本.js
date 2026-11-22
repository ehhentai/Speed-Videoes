// ==UserScript==
// @name         长按右键3倍速（松开恢复）+ 短按快进
// @namespace    http://tampermonkey.net/
// @version      2026-11-22
// @description  短按 → 快进 5 秒；长按（超过 300ms）→ 3 倍速，松开恢复原速
// @author       You
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    /* ================= 可调参数 ================= */
    const SEEK_SECONDS = 5;    // 短按一次快进多少秒
    const HOLD_MS      = 300;  // 按住超过多少毫秒算“长按”
    const FAST_RATE    = 3.0;  // 长按时的倍速
    /* ============================================ */

    let pressing       = false; // 本次按键是否已被脚本接管
    let holdTimer      = null;  // 长按判定定时器
    let fastForwarding = false; // 是否已进入长按加速状态
    let savedRates     = [];    // [{ video, rate }]：加速前的原倍速

    // 取页面上“可见”的 video；如果一个都不可见，就退回全部 video
    function getVideos() {
        const all = Array.prototype.slice.call(document.querySelectorAll('video'));
        if (all.length === 0) return [];
        const visible = all.filter(function (v) {
            const r = v.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
        });
        return visible.length ? visible : all;
    }

    // 输入框/可编辑区域里方向键另有用途，不劫持
    function isTypingTarget(el) {
        if (!el) return false;
        const tag = el.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
    }

    // 彻底吃掉这次按键事件（含同一元素上的其他监听器）
    function swallow(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
    }

    function applyFastRate() {
        fastForwarding = true;
        savedRates = [];
        getVideos().forEach(function (v) {
            savedRates.push({ video: v, rate: v.playbackRate });
            v.playbackRate = FAST_RATE;
        });
    }

    function restoreRate() {
        savedRates.forEach(function (item) {
            try {
                // 只在仍是我们设置的倍速时恢复，避免覆盖期间用户/网站自己的改速
                if (item.video.playbackRate === FAST_RATE) {
                    item.video.playbackRate = item.rate;
                }
            } catch (err) { /* 视频已被移除等情况，忽略 */ }
        });
        savedRates = [];
        fastForwarding = false;
    }

    function seekForward() {
        getVideos().forEach(function (v) {
            try {
                // 直播流等 duration 不是有限值时无法快进，直接跳过
                if (!isFinite(v.duration)) return;
                v.currentTime = Math.min(v.duration, v.currentTime + SEEK_SECONDS);
            } catch (err) { /* 某些播放器不允许赋值，忽略 */ }
        });
    }

    function clearHoldTimer() {
        if (holdTimer !== null) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
    }

    // 失焦/切标签页时兜底：keyup 可能永远收不到
    function panicReset() {
        pressing = false;
        clearHoldTimer();
        if (fastForwarding) restoreRate();
    }

    /* ---------------- 按下 ---------------- */
    window.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' || e.isComposing) return;
        // 带修饰键的组合键交给页面/浏览器
        if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
        if (isTypingTarget(e.target)) return;

        // 按住时系统会持续派发重复的 keydown，继续拦截，别让页面自己乱跳
        if (e.repeat) {
            if (pressing) swallow(e);
            return;
        }

        // 没有视频就不插手，保持页面原生行为
        if (getVideos().length === 0) return;

        swallow(e);

        pressing = true;
        fastForwarding = false;

        clearHoldTimer();
        holdTimer = setTimeout(function () {
            holdTimer = null;
            if (!pressing || fastForwarding) return;
            if (getVideos().length === 0) return;
            applyFastRate(); // 按住够久 → 3 倍速
        }, HOLD_MS);
    }, true);

    /* ---------------- 松开 ---------------- */
    window.addEventListener('keyup', function (e) {
        if (e.key !== 'ArrowRight' || !pressing) return;

        swallow(e);

        pressing = false;
        clearHoldTimer();

        if (fastForwarding) {
            restoreRate(); // 长按结束 → 恢复原倍速
        } else {
            seekForward(); // 短按 → 快进
        }
    }, true);

    window.addEventListener('blur', panicReset);
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) panicReset();
    });
})();
