; ─────────────────────────────────────────────────────────────────────────────
; miniMerch Studio — Windows NSIS Installer
; Ships portable node.exe + app source — no pkg binary, no cross-compile issues
; Per-user install, no UAC required
; ─────────────────────────────────────────────────────────────────────────────

Unicode True

!define APP_NAME       "miniMerch Studio"
!define APP_VERSION    "0.2.0"
!define APP_PUBLISHER  "miniMerch"
!define APP_URL        "https://github.com/eurobuddha/miniMerch"
!define INSTALL_DIR    "$LOCALAPPDATA\${APP_NAME}"
!define UNINSTALL_KEY  "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"

Name                   "${APP_NAME}"
OutFile                "..\release\miniMerch-Studio-${APP_VERSION}-Setup.exe"
InstallDir             "${INSTALL_DIR}"
InstallDirRegKey       HKCU "${UNINSTALL_KEY}" "InstallLocation"
RequestExecutionLevel  user
SetCompressor /SOLID   lzma
ShowInstDetails        show

Icon          "..\release\staging\icon.ico"
UninstallIcon "..\release\staging\icon.ico"

VIProductVersion       "0.2.0.0"
VIAddVersionKey "ProductName"      "${APP_NAME}"
VIAddVersionKey "ProductVersion"   "${APP_VERSION}"
VIAddVersionKey "CompanyName"      "${APP_PUBLISHER}"
VIAddVersionKey "FileDescription"  "${APP_NAME} Installer"
VIAddVersionKey "LegalCopyright"   "Copyright 2026 miniMerch"
VIAddVersionKey "FileVersion"      "${APP_VERSION}"

Page instfiles

Section "Install"

    SetOutPath "$INSTDIR"

    ; ── Copy all staged files ─────────────────────────────────────────────────
    File /r "..\release\staging\*.*"

    ; ── Write the launcher batch file ────────────────────────────────────────
    ; Uses the bundled node.exe — no system Node.js required
    FileOpen  $0 "$INSTDIR\launch.bat" w
    FileWrite $0 "@echo off$\r$\n"
    FileWrite $0 "cd /d $\"%~dp0$\"$\r$\n"
    FileWrite $0 "start $\"miniMerch Studio$\" $\"%~dp0node.exe$\" $\"%~dp0src\studio.js$\"$\r$\n"
    FileClose $0

    ; ── Write uninstaller ────────────────────────────────────────────────────
    WriteUninstaller "$INSTDIR\Uninstall.exe"

    ; ── Registry (Add/Remove Programs) ───────────────────────────────────────
    WriteRegStr   HKCU "${UNINSTALL_KEY}" "DisplayName"     "${APP_NAME}"
    WriteRegStr   HKCU "${UNINSTALL_KEY}" "DisplayVersion"  "${APP_VERSION}"
    WriteRegStr   HKCU "${UNINSTALL_KEY}" "Publisher"       "${APP_PUBLISHER}"
    WriteRegStr   HKCU "${UNINSTALL_KEY}" "URLInfoAbout"    "${APP_URL}"
    WriteRegStr   HKCU "${UNINSTALL_KEY}" "InstallLocation" "$INSTDIR"
    WriteRegStr   HKCU "${UNINSTALL_KEY}" "UninstallString" "$INSTDIR\Uninstall.exe"
    WriteRegStr   HKCU "${UNINSTALL_KEY}" "DisplayIcon"     "$INSTDIR\icon.ico"
    WriteRegDWORD HKCU "${UNINSTALL_KEY}" "NoModify"        1
    WriteRegDWORD HKCU "${UNINSTALL_KEY}" "NoRepair"        1

    ; ── Shortcuts ─────────────────────────────────────────────────────────────
    CreateShortcut "$DESKTOP\${APP_NAME}.lnk" \
        "$INSTDIR\launch.bat" "" \
        "$INSTDIR\icon.ico" 0

    CreateDirectory "$SMPROGRAMS\${APP_NAME}"
    CreateShortcut "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" \
        "$INSTDIR\launch.bat" "" \
        "$INSTDIR\icon.ico" 0
    CreateShortcut "$SMPROGRAMS\${APP_NAME}\Uninstall.lnk" \
        "$INSTDIR\Uninstall.exe"

    MessageBox MB_OK|MB_ICONINFORMATION \
        "${APP_NAME} installed!$\r$\n$\r$\nDouble-click the desktop shortcut to launch.$\r$\nYour browser will open at http://localhost:3456$\r$\n$\r$\nGenerated shop files go to:$\r$\nDocuments\miniMerch\dist"

SectionEnd

Section "Uninstall"
    ExecWait 'taskkill /F /IM node.exe /FI "WINDOWTITLE eq miniMerch Studio"' $0
    RMDir /r "$INSTDIR"
    Delete "$DESKTOP\${APP_NAME}.lnk"
    Delete "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk"
    Delete "$SMPROGRAMS\${APP_NAME}\Uninstall.lnk"
    RMDir  "$SMPROGRAMS\${APP_NAME}"
    DeleteRegKey HKCU "${UNINSTALL_KEY}"
SectionEnd
