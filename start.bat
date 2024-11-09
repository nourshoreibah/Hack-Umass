@echo off
set Token=MAIN_%RANDOM%_%CD%
start "%Token%_backend" cmd /c "cd backend && python .\app.py"
start "%Token%_frontend" cmd /c "cd frontend && npx expo start --tunnel"
:loop
ping -n 2 localhost >nul 2>nul
tasklist /fi "WINDOWTITLE eq %Token%_backend" | findstr "cmd" >nul 2>nul && set Backend=1 || set Backend=
tasklist /fi "WINDOWTITLE eq %Token%_frontend" | findstr "cmd" >nul 2>nul && set Frontend=1 || set Frontend=
if not defined Backend if not defined Frontend goto endloop
goto loop
:endloop
echo Both processes have terminated.