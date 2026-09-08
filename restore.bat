@echo off
chcp 65001 >nul
title TranslateGemini - 一键还原官方原版
cd /d "%~dp0"
node src/cli.js restore
echo.
pause
