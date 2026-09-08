@echo off
chcp 65001 >nul
title TranslateGemini - 一键安装汉化补丁
cd /d "%~dp0"
node src/cli.js install
echo.
pause
