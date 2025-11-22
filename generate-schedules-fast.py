#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script tạo lịch NHANH với multithreading
Chạy song song nhiều bác sĩ và nhiều ngày cùng lúc
"""

import requests
import time
from datetime import datetime, timedelta
from typing import Dict, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

BASE_URL = "https://be-healthcareapppd.onrender.com/api"
# BASE_URL = "http://localhost:5000/api"  # Uncomment nếu test local

START_DATE = datetime(2025, 11, 22)  # Hôm nay
END_DATE = datetime(2026, 1, 1)      # 1/1/2026

# Danh sách 10 bác sĩ
DOCTORS = [
    {"email": "bs.nguyenvana@pdhealth.com", "password": "Doctor123", "name": "BS. Nguyễn Văn A"},
    {"email": "bs.tranthib@pdhealth.com", "password": "Doctor123", "name": "BS. Trần Thị B"},
    {"email": "bs.lequangc@pdhealth.com", "password": "Doctor123", "name": "BS. Lê Quang C"},
    {"email": "bs.phamhoaid@pdhealth.com", "password": "Doctor123", "name": "BS. Phạm Hoài D"},
    {"email": "bs.vothie@pdhealth.com", "password": "Doctor123", "name": "BS. Võ Thị E"},
    {"email": "bs.ngominhf@pdhealth.com", "password": "Doctor123", "name": "BS. Ngô Minh F"},
    {"email": "bs.doantuang@pdhealth.com", "password": "Doctor123", "name": "BS. Đoàn Tuấn G"},
    {"email": "bs.buikimh@pdhealth.com", "password": "Doctor123", "name": "BS. Bùi Kim H"},
    {"email": "bs.hoangdungi@pdhealth.com", "password": "Doctor123", "name": "BS. Hoàng Dũng I"},
    {"email": "bs.dinhhank@pdhealth.com", "password": "Doctor123", "name": "BS. Đinh Hân K"}
]

# Thread-safe counter
lock = threading.Lock()
progress = {"completed": 0, "total": 0}


def login_doctor(email: str, password: str) -> Tuple[str, str]:
    """Đăng nhập bác sĩ"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": email, "password": password},
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                token = data.get("data", {}).get("token")
                user_id = data.get("data", {}).get("user", {}).get("id")
                return token, user_id
        
        return None, None
    except:
        return None, None


def generate_daily_slots(token: str, date: datetime, doctor_name: str) -> Tuple[bool, any]:
    """Tạo lịch cho 1 ngày"""
    try:
        date_str = date.strftime("%Y-%m-%d")
        response = requests.post(
            f"{BASE_URL}/appointments/availability/generate-daily",
            json={"date": date_str},
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            },
            timeout=15
        )
        
        if response.status_code in [200, 201]:
            data = response.json()
            if data.get("success"):
                count = data.get("data", {}).get("count", 0)
                
                # Update progress
                with lock:
                    progress["completed"] += 1
                    pct = (progress["completed"] / progress["total"]) * 100
                    print(f"  [{progress['completed']}/{progress['total']}] {pct:.1f}% - {doctor_name}: {date.strftime('%d/%m')} ✓ ({count} slots)")
                
                return True, count
        
        if response.status_code == 409:
            with lock:
                progress["completed"] += 1
            return True, 0
        
        return False, f"Error {response.status_code}"
    except Exception as e:
        return False, str(e)


def process_doctor_dates(doctor: Dict, dates: list) -> Dict:
    """Xử lý tất cả ngày của 1 bác sĩ (chạy song song)"""
    email = doctor["email"]
    name = doctor["name"]
    
    # Login
    token, user_id = login_doctor(email, doctor["password"])
    
    if not token:
        return {
            "name": name,
            "success": False,
            "total_days": len(dates),
            "success_days": 0,
            "total_slots": 0
        }
    
    print(f"\n✓ {name} đã đăng nhập (ID: {user_id[:8]}...)")
    
    success_days = 0
    total_slots = 0
    
    # Tạo lịch song song cho tất cả ngày (10 threads cùng lúc)
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {
            executor.submit(generate_daily_slots, token, date, name): date 
            for date in dates
        }
        
        for future in as_completed(futures):
            success, result = future.result()
            if success:
                success_days += 1
                if isinstance(result, int):
                    total_slots += result
    
    return {
        "name": name,
        "success": True,
        "total_days": len(dates),
        "success_days": success_days,
        "total_slots": total_slots
    }


def main():
    """Hàm chính với batch processing"""
    print("\n" + "=" * 70)
    print("  🚀 TẠO LỊCH NHANH CHO TẤT CẢ BÁC SĨ (MULTITHREADING)")
    print("=" * 70)
    
    print(f"\n📡 API: {BASE_URL}")
    print(f"📅 Từ {START_DATE.strftime('%d/%m/%Y')} đến {END_DATE.strftime('%d/%m/%Y')}")
    
    # Tạo danh sách tất cả ngày
    dates = []
    current = START_DATE
    while current <= END_DATE:
        dates.append(current)
        current += timedelta(days=1)
    
    total_days = len(dates)
    print(f"📆 Tổng số ngày: {total_days}")
    print(f"👨‍⚕️ Số bác sĩ: {len(DOCTORS)}")
    print(f"📊 Tổng số tasks: {len(DOCTORS) * total_days}")
    
    # Set progress total
    progress["total"] = len(DOCTORS) * total_days
    progress["completed"] = 0
    
    input("\n⏎ Nhấn Enter để bắt đầu...\n")
    
    start_time = time.time()
    
    # Xử lý 3 bác sĩ cùng lúc
    results = []
    batch_size = 3
    
    for i in range(0, len(DOCTORS), batch_size):
        batch = DOCTORS[i:i+batch_size]
        print(f"\n{'='*70}")
        print(f"  Batch {i//batch_size + 1}: Xử lý {len(batch)} bác sĩ song song")
        print(f"{'='*70}")
        
        with ThreadPoolExecutor(max_workers=batch_size) as executor:
            futures = {
                executor.submit(process_doctor_dates, doctor, dates): doctor 
                for doctor in batch
            }
            
            for future in as_completed(futures):
                result = future.result()
                results.append(result)
    
    # Tổng kết
    elapsed = time.time() - start_time
    
    print("\n\n" + "=" * 70)
    print("  🎉 HOÀN THÀNH!")
    print("=" * 70)
    
    success_count = sum(1 for r in results if r["success"])
    total_slots = sum(r["total_slots"] for r in results)
    
    print(f"\n✅ Thành công: {success_count}/{len(DOCTORS)} bác sĩ")
    print(f"📊 Tổng slots: {total_slots}")
    print(f"⏱️  Thời gian: {elapsed:.1f}s (~{elapsed/60:.1f} phút)")
    print(f"⚡ Tốc độ: {progress['total']/elapsed:.1f} tasks/giây")
    
    print("\n📋 CHI TIẾT:")
    for i, r in enumerate(results, 1):
        status = "✓" if r["success"] else "✗"
        print(f"  {status} {i:2d}. {r['name']:<25} {r['success_days']:2d}/{r['total_days']:2d} ngày, {r['total_slots']:3d} slots")
    
    print("\n" + "=" * 70 + "\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Đã hủy\n")
    except Exception as e:
        print(f"\n\n❌ Lỗi: {e}\n")
        import traceback
        traceback.print_exc()
