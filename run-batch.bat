@echo off
chcp 65001 > nul
echo ╔══════════════════════════════════════════════════════════════╗
echo ║        TẠO LỊCH SONG SONG CHO 10 BÁC SĨ (BATCH MODE)        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Bắt đầu tạo lịch cho 10 bác sĩ song song...
echo 📅 Từ 22/11/2025 đến 01/01/2026
echo ⏱️  Chạy 5 bác sĩ mỗi lần để tránh quá tải
echo.

REM Batch 1: 5 bác sĩ đầu
echo ═══════════════════════════════════════════════════════════════
echo 🔄 BATCH 1/2 - Đang xử lý 5 bác sĩ đầu...
echo ═══════════════════════════════════════════════════════════════
echo.

start /B cmd /c "python generate-schedule-single.py bs.nguyenvana@pdhealth.com Doctor123 "BS. Nguyễn Văn A" > logs\doctor1.log 2>&1"
start /B cmd /c "python generate-schedule-single.py bs.tranthib@pdhealth.com Doctor123 "BS. Trần Thị B" > logs\doctor2.log 2>&1"
start /B cmd /c "python generate-schedule-single.py bs.lequangc@pdhealth.com Doctor123 "BS. Lê Quang C" > logs\doctor3.log 2>&1"
start /B cmd /c "python generate-schedule-single.py bs.phamhoaid@pdhealth.com Doctor123 "BS. Phạm Hoài D" > logs\doctor4.log 2>&1"
start /B cmd /c "python generate-schedule-single.py bs.vothie@pdhealth.com Doctor123 "BS. Võ Thị E" > logs\doctor5.log 2>&1"

echo ⏳ Đợi batch 1 hoàn thành...
timeout /t 60 /nobreak > nul

echo.
echo ═══════════════════════════════════════════════════════════════
echo 🔄 BATCH 2/2 - Đang xử lý 5 bác sĩ còn lại...
echo ═══════════════════════════════════════════════════════════════
echo.

REM Batch 2: 5 bác sĩ sau
start /B cmd /c "python generate-schedule-single.py bs.ngominhf@pdhealth.com Doctor123 "BS. Ngô Minh F" > logs\doctor6.log 2>&1"
start /B cmd /c "python generate-schedule-single.py bs.doantuang@pdhealth.com Doctor123 "BS. Đoàn Tuấn G" > logs\doctor7.log 2>&1"
start /B cmd /c "python generate-schedule-single.py bs.buikimh@pdhealth.com Doctor123 "BS. Bùi Kim H" > logs\doctor8.log 2>&1"
start /B cmd /c "python generate-schedule-single.py bs.hoangdungi@pdhealth.com Doctor123 "BS. Hoàng Dũng I" > logs\doctor9.log 2>&1"
start /B cmd /c "python generate-schedule-single.py bs.dinhhank@pdhealth.com Doctor123 "BS. Đinh Hân K" > logs\doctor10.log 2>&1"

echo ⏳ Đợi batch 2 hoàn thành...
timeout /t 60 /nobreak > nul

echo.
echo ═══════════════════════════════════════════════════════════════
echo 🎉 HOÀN THÀNH!
echo ═══════════════════════════════════════════════════════════════
echo.
echo 📊 Kiểm tra kết quả trong thư mục logs\
echo    - logs\doctor1.log đến logs\doctor10.log
echo.
echo 📋 Xem tổng kết:
type logs\*.log | findstr /C:"✅ Hoàn thành"
echo.
pause
