; ─────────────────────────────────────────────────────────────────────────────
; miniMerch Studio — Windows NSIS Installer Script
; Installs per-user (no UAC required), creates desktop + Start Menu shortcuts
; ─────────────────────────────────────────────────────────────────────────────

Unicode True

; ── Defines ──────────────────────────────────────────────────────────────────
!define APP_NAME        "miniMerch Studio"
!define APP_VERSION     "0.2.0"
!define APP_PUBLISHER   "miniMerch"
!define APP_URL         "https://github.com/eurobuddha/miniMerch"
!define APP_EXE         "minimerch-studio.exe"
!define APP_LAUNCHER    "minimerch-launcher.bat"
!define APP_ICON        "icon.ico"
!define INSTALL_DIR     "$LOCALAPPDATA\${APP_NAME}"
!define UNINSTALL_KEY   "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"

; ── Installer settings ────────────────────────────────────────────────────────
Name                    "${APP_NAME}"
OutFile                 "..\release\miniMerch-Studio-${APP_VERSION}-Setup.exe"
InstallDir              "${INSTALL_DIR}"
InstallDirRegKey        HKCU "${UNINSTALL_KEY}" "InstallLocation"
RequestExecutionLevel   user   ; No UAC prompt — per-user install
SetCompressor /SOLID lzma
ShowInstDetails show

; ── Icon ─────────────────────────────────────────────────────────────────────
Icon                    "${APP_ICON}"
UninstallIcon           "${APP_ICON}"

; ── Version info embedded in installer .exe ───────────────────────────────────
VIProductVersion        "0.2.0.0"
VIAddVersionKey         "ProductName"       "${APP_NAME}"
VIAddVersionKey         "ProductVersion"    "${APP_VERSION}"
VIAddVersionKey         "CompanyName"       "${APP_PUBLISHER}"
VIAddVersionKey         "FileDescription"   "${APP_NAME} Installer"
VIAddVersionKey         "LegalCopyright"    "© 2026 miniMerch. MIT License."
VIAddVersionKey         "FileVersion"       "${APP_VERSION}"

; ── Pages ────────────────────────────────────────────────────────────────────
Page instfiles

; ── Install section ───────────────────────────────────────────────────────────
Section "Install"

    SetOutPath "$INSTDIR"

    ; Copy the main binary
    File /oname=${APP_EXE} "..\release\minimerch-studio.exe"

    ; Copy the icon
    File /oname=icon.ico "..\build\icon.ico"

    ; Write a batch file launcher.
    ; A .bat with 'start /B' runs the server without leaving a console window open.
    ; This avoids all VBScript quoting complexity inside NSIS FileWrite.
    FileOpen  $0 "$INSTDIR\${APP_LAUNCHER}" w
    FileWrite $0 "@echo off$\r$\n"
    FileWrite $0 "start $\"$\" $\"%~dp0minimerch-studio.exe$\"$\r$\n"
    FileClose $0

    ; Write uninstaller
    WriteUninstaller "$INSTDIR\Uninstall.exe"

    ; Registry entries for Add/Remove Programs
    WriteRegStr   HKCU "${UNINSTALL_KEY}" "DisplayName"          "${APP_NAME}"
    WriteRegStr   HKCU "${UNINSTALL_KEY}" "DisplayVersion"        "${APP_VERSION}"
    WriteRegStr   HKCU "${UNINSTALL_KEY}" "Publisher"             "${APP_PUBLISHER}"
    WriteRegStr   HKCU "${UNINSTALL_KEY}" "URLInfoAbout"          "${APP_URL}"
    WriteRegStr   HKCU "${UNINSTALL_KEY}" "InstallLocation"       "$INSTDIR"
    WriteRegStr   HKCU "${UNINSTALL_KEY}" "UninstallString"       "$INSTDIR\Uninstall.exe"
    WriteRegStr   HKCU "${UNINSTALL_KEY}" "DisplayIcon"           "$INSTDIR\icon.ico"
    WriteRegDWORD HKCU "${UNINSTALL_KEY}" "NoModify"              1
    WriteRegDWORD HKCU "${UNINSTALL_KEY}" "NoRepair"              1

    ; Desktop shortcut — runs the batch launcher via cmd /C (no persistent window)
    CreateShortcut "$DESKTOP\${APP_NAME}.lnk" \
        "$WINDIR\System32\cmd.exe" \
        '/C "$INSTDIR\${APP_LAUNCHER}"' \
        "$INSTDIR\icon.ico" 0

    ; Start Menu shortcut
    CreateDirectory "$SMPROGRAMS\${APP_NAME}"
    CreateShortcut  "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" \
        "$WINDIR\System32\cmd.exe" \
        '/C "$INSTDIR\${APP_LAUNCHER}"' \
        "$INSTDIR\icon.ico" 0
    CreateShortcut  "$SMPROGRAMS\${APP_NAME}\Uninstall ${APP_NAME}.lnk" \
        "$INSTDIR\Uninstall.exe"

    ; Show completion message with instructions
    MessageBox MB_OK|MB_ICONINFORMATION \
        "${APP_NAME} has been installed!$\r$\n$\r$\nTo use:$\r$\n  1. Double-click the '${APP_NAME}' shortcut on your desktop$\r$\n  2. Your browser will open at http://localhost:3456$\r$\n  3. Generated shop files are saved to:$\r$\n     Documents\miniMerch\dist$\r$\n$\r$\nTo stop the server, end the minimerch-studio.exe process$\r$\n in Task Manager."

SectionEnd

; ── Uninstall section ─────────────────────────────────────────────────────────
Section "Uninstall"

    ; Kill the server if running
    ExecWait 'taskkill /F /IM minimerch-studio.exe' $0

    ; Remove files
    Delete "$INSTDIR\${APP_EXE}"
    Delete "$INSTDIR\minimerch-launcher.bat"
    Delete "$INSTDIR\icon.ico"
    Delete "$INSTDIR\Uninstall.exe"
    RMDir  "$INSTDIR"

    ; Remove shortcuts
    Delete "$DESKTOP\${APP_NAME}.lnk"
    Delete "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk"
    Delete "$SMPROGRAMS\${APP_NAME}\Uninstall ${APP_NAME}.lnk"
    RMDir  "$SMPROGRAMS\${APP_NAME}"

    ; Remove registry entries
    DeleteRegKey HKCU "${UNINSTALL_KEY}"

SectionEnd
