@echo off
chcp 65001 >nul
title PLENARIO PT
echo.
echo   ==========================================
echo      PLENARIO PT - Simulador Politico
echo   ==========================================
echo.
echo   A iniciar o servidor local (necessario apenas para a IA local Ollama).
echo   O jogo abre no navegador. Feche esta janela para terminar.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0servidor.ps1"
pause
