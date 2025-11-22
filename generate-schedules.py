#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script tự động tạo lịch cho 10 bác sĩ
Từ ngày 22/11/2025 đến 1/1/2026 (40 ngày)
Mỗi ngày tạo 10 slots: 8h, 9h, 10h, 11h, 13h, 14h, 15h, 16h, 19h, 20h
"""

import requests
import time
from datetime import datetime, timedelta
from typing import Dict, Tuple

BASE_URL = "https://be-healthcareapppd.onrender.com/api"
# BASE_URL = "http://localhost:5000/api"  # Uncomment nếu test local

START_DATE = datetime(2025, 11, 22)  # Hôm nay
END_DATE = datetime(2026, 1, 1)      # 1/1/2026

# Danh sách 10 bác sĩ (giống trong create-doctors.py)
DOCTORS = [
    {
        "email": "bs.nguyenvana@pdhealth.com",
        "password": "Doctor123",
        "name": "BS. Nguyễn Văn A"
    },
    {
        "email": "bs.tranthib@pdhealth.com",
        "password": "Doctor123",
        "name": "BS. Trần Thị B"
    },
    {
        "email": "bs.lequangc@pdhealth.com",
        "password": "Doctor123",
        "name": "BS. Lê Quang C"
    },
    {
        "email": "bs.phamhoaid@pdhealth.com",
        "password": "Doctor123",
        "name": "BS. Phạm Hoài D"
    },
    {
        "email": "bs.vothie@pdhealth.com",
        "password": "Doctor123",
        "name": "BS. Võ Thị E"
    },
    {
        "email": "bs.ngominhf@pdhealth.com",
        "password": "Doctor123",
        "name": "BS. Ngô Minh F"
    },
    {
        "email": "bs.doantuang@pdhealth.com",
        "password": "Doctor123",
        "name": "BS. Đoàn Tuấn G"
    },
    {
        "email": "bs.buikimh@pdhealth.com",
        "password": "Doctor123",
        "name": "BS. Bùi Kim H"
    },
    {
        "email": "bs.hoangdungi@pdhealth.com",
        "password": "Doctor123",
        "name": "BS. Hoàng Dũng I"
    },
    {
        "email": "bs.dinhhank@pdhealth.com",
        "password": "Doctor123",
        "name": "BS. Đinh Hân K"
    }
]


def print_section(title: str):
    """In tiêu đề section"""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)


def login_doctor(email: str, password: str) -> Tuple[str, str]:
    """
    Đăng nhập bác sĩ và lấy token
    Returns: (token, user_id)
    """
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": email, "password": password},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                token = data.get("data", {}).get("token")
                user_id = data.get("data", {}).get("user", {}).get("id")
                return token, user_id
        
        print(f"    ✗ Đăng nhập thất bại: {response.status_code} - {response.text[:100]}")
        return None, None
        
    except Exception as e:
        print(f"    ✗ Lỗi đăng nhập: {str(e)}")
        return None, None


def generate_daily_slots(token: str, date: datetime) -> Tuple[bool, any]:
    """
    Tạo lịch tự động cho 1 ngày
    Returns: (success, result)
    """
    try:
        date_str = date.strftime("%Y-%m-%d")
        response = requests.post(
            f"{BASE_URL}/appointments/availability/generate-daily",
            json={"date": date_str},
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            },
            timeout=10
        )
        
        # Chấp nhận cả 200 và 201
        if response.status_code in [200, 201]:
            data = response.json()
            if data.get("success"):
                count = data.get("data", {}).get("count", 0)
                return True, count
            else:
                # Có response nhưng success = false
                error_msg = data.get("message", "Unknown error")
                return False, error_msg
        
        # Nếu lỗi 409 có thể là đã tồn tại
        if response.status_code == 409:
            return True, "Đã tồn tại"
        
        # In ra response để debug
        try:
            error_data = response.json()
            error_msg = error_data.get("message", f"Error {response.status_code}")
        except:
            error_msg = f"Error {response.status_code}"
        
        return False, error_msg
        
    except Exception as e:
        return False, str(e)


def generate_schedule_for_doctor(doctor: Dict) -> Dict:
    """
    Tạo lịch cho 1 bác sĩ
    Returns: dict với thống kê
    """
    email = doctor["email"]
    name = doctor["name"]
    
    print_section(f"🏥 {name} ({email})")
    
    # Login
    print(f"  → Đang đăng nhập...")
    token, user_id = login_doctor(email, doctor["password"])
    
    if not token:
        print(f"  ✗ Không thể đăng nhập. Bỏ qua bác sĩ này.\n")
        return {
            "name": name,
            "success": False,
            "total_days": 0,
            "success_days": 0,
            "total_slots": 0
        }
    
    print(f"  ✓ Đăng nhập thành công (ID: {user_id})")
    
    # Tính số ngày
    total_days = (END_DATE - START_DATE).days + 1
    print(f"  → Tạo lịch cho {total_days} ngày (từ {START_DATE.strftime('%d/%m/%Y')} đến {END_DATE.strftime('%d/%m/%Y')})\n")
    
    # Tạo lịch cho từng ngày
    current_date = START_DATE
    success_days = 0
    total_slots = 0
    failed_dates = []
    
    while current_date <= END_DATE:
        date_str = current_date.strftime("%d/%m/%Y")
        
        success, result = generate_daily_slots(token, current_date)
        
        if success:
            success_days += 1
            if isinstance(result, int):
                total_slots += result
                print(f"    ✓ {date_str}: Tạo {result} slots")
            else:
                print(f"    ✓ {date_str}: {result}")
        else:
            failed_dates.append(date_str)
            print(f"    ✗ {date_str}: Lỗi - {result}")
        
        current_date += timedelta(days=1)
        time.sleep(0.3)  # Delay để tránh spam API
    
    # Tổng kết
    print(f"\n  📊 KẾT QUẢ:")
    print(f"    - Tổng số ngày: {total_days}")
    print(f"    - Thành công: {success_days}/{total_days} ngày ({success_days/total_days*100:.1f}%)")
    print(f"    - Tổng slots đã tạo: {total_slots}")
    
    if failed_dates:
        print(f"    - Ngày thất bại: {', '.join(failed_dates[:5])}" + ("..." if len(failed_dates) > 5 else ""))
    
    return {
        "name": name,
        "success": success_days > 0,
        "total_days": total_days,
        "success_days": success_days,
        "total_slots": total_slots,
        "failed_dates": failed_dates
    }


def main():
    """Hàm chính"""
    print("\n")
    print("╔" + "=" * 68 + "╗")
    print("║" + " " * 10 + "TẠO LỊCH TỰ ĐỘNG CHO TẤT CẢ BÁC SĨ" + " " * 22 + "║")
    print("╚" + "=" * 68 + "╝")
    
    print(f"\n📡 API Server: {BASE_URL}")
    print(f"📅 Khoảng thời gian: {START_DATE.strftime('%d/%m/%Y')} - {END_DATE.strftime('%d/%m/%Y')}")
    
    total_days = (END_DATE - START_DATE).days + 1
    print(f"📆 Tổng số ngày: {total_days} ngày")
    print(f"👨‍⚕️ Số lượng bác sĩ: {len(DOCTORS)} bác sĩ")
    print(f"⏱️  Ước tính thời gian: ~{len(DOCTORS) * total_days * 0.5 / 60:.1f} phút")
    
    print("\n⚠️  LƯU Ý:")
    print("  - Mỗi ngày sẽ tạo 10 slots: 8h, 9h, 10h, 11h, 13h, 14h, 15h, 16h, 19h, 20h")
    print("  - Backend server phải đang chạy")
    print("  - Tất cả bác sĩ phải đã được xác thực (approved)")
    
    input("\n⏎ Nhấn Enter để bắt đầu...")
    
    # Xử lý từng bác sĩ
    results = []
    start_time = time.time()
    
    for i, doctor in enumerate(DOCTORS, 1):
        print(f"\n\n🔄 Đang xử lý {i}/{len(DOCTORS)}...")
        result = generate_schedule_for_doctor(doctor)
        results.append(result)
        time.sleep(1)  # Delay giữa các bác sĩ
    
    # Tổng kết cuối cùng
    elapsed_time = time.time() - start_time
    
    print_section("🎉 TỔNG KẾT CUỐI CÙNG")
    
    success_count = sum(1 for r in results if r["success"])
    total_slots_created = sum(r["total_slots"] for r in results)
    
    print(f"\n  ✅ Thành công: {success_count}/{len(DOCTORS)} bác sĩ ({success_count/len(DOCTORS)*100:.1f}%)")
    print(f"  ❌ Thất bại: {len(DOCTORS) - success_count}/{len(DOCTORS)} bác sĩ")
    print(f"  📊 Tổng số slots đã tạo: {total_slots_created}")
    print(f"  ⏱️  Thời gian thực hiện: {elapsed_time/60:.1f} phút")
    
    print("\n  CHI TIẾT TỪNG BÁC SĨ:")
    for i, result in enumerate(results, 1):
        status = "✓" if result["success"] else "✗"
        print(f"    {status} [{i:2d}] {result['name']}: {result['success_days']}/{result['total_days']} ngày, {result['total_slots']} slots")
    
    print("\n" + "=" * 70 + "\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Đã hủy bởi người dùng\n")
    except Exception as e:
        print(f"\n\n❌ Lỗi không mong muốn: {e}\n")
