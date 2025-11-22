#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script tạo lịch cho 1 bác sĩ - Dùng để chạy batch song song
Usage: python generate-schedule-single.py <email> <password> <name>
"""

import requests
import sys
from datetime import datetime, timedelta
from typing import Tuple

BASE_URL = "https://be-healthcareapppd.onrender.com/api"
START_DATE = datetime(2025, 11, 22)
END_DATE = datetime(2026, 1, 1)


def login_doctor(email: str, password: str) -> Tuple[str, str]:
    """Đăng nhập bác sĩ"""
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
                return data["data"]["token"], data["data"]["user"]["id"]
        
        return None, None
    except:
        return None, None


def generate_daily_slots(token: str, date: datetime) -> Tuple[bool, any]:
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
            timeout=10
        )
        
        if response.status_code in [200, 201]:
            data = response.json()
            if data.get("success"):
                return True, data.get("data", {}).get("count", 0)
        
        return False, response.status_code
    except Exception as e:
        return False, str(e)


def main():
    if len(sys.argv) < 4:
        print("Usage: python generate-schedule-single.py <email> <password> <name>")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    name = sys.argv[3]
    
    print(f"🏥 {name}")
    print(f"📧 {email}")
    
    # Login
    token, user_id = login_doctor(email, password)
    if not token:
        print("❌ Đăng nhập thất bại")
        sys.exit(1)
    
    print(f"✅ Login OK (ID: {user_id})")
    
    # Tạo lịch
    total_days = (END_DATE - START_DATE).days + 1
    success_days = 0
    total_slots = 0
    
    current_date = START_DATE
    while current_date <= END_DATE:
        success, result = generate_daily_slots(token, current_date)
        
        if success:
            success_days += 1
            if isinstance(result, int):
                total_slots += result
        
        current_date += timedelta(days=1)
    
    print(f"✅ Hoàn thành: {success_days}/{total_days} ngày, {total_slots} slots")


if __name__ == "__main__":
    main()
