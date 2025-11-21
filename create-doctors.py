#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script tạo 10 bác sĩ và xác thực họ
Yêu cầu: Python 3.6+ và thư viện requests
Cài đặt: pip install requests
"""

import requests
import json
import time
from typing import List, Dict

BASE_URL = "https://be-healthcareapppd.onrender.com/api"

# Danh sách 10 bác sĩ
doctors = [
    {
        "email": "bs.nguyenvana@pdhealth.com",
        "password": "Doctor123",
        "fullName": "BS. Nguyễn Văn A",
        "specialization": "Nội khoa",
        "medicalLicenseId": "BS001234",
        "clinicAddress": "Bệnh viện Đa khoa Trung ương, TP.HCM",
        "bio": "Bác sĩ chuyên khoa nội với 15 năm kinh nghiệm"
    },
    {
        "email": "bs.tranthib@pdhealth.com",
        "password": "Doctor123",
        "fullName": "BS. Trần Thị B",
        "specialization": "Nhi khoa",
        "medicalLicenseId": "BS001235",
        "clinicAddress": "Bệnh viện Nhi Đồng 1, TP.HCM",
        "bio": "Bác sĩ nhi khoa với 10 năm kinh nghiệm điều trị bệnh nhi"
    },
    {
        "email": "bs.lequangc@pdhealth.com",
        "password": "Doctor123",
        "fullName": "BS. Lê Quang C",
        "specialization": "Tim mạch",
        "medicalLicenseId": "BS001236",
        "clinicAddress": "Bệnh viện Tim Tâm Đức, TP.HCM",
        "bio": "Chuyên gia tim mạch với 20 năm kinh nghiệm"
    },
    {
        "email": "bs.phamhoaid@pdhealth.com",
        "password": "Doctor123",
        "fullName": "BS. Phạm Hoài D",
        "specialization": "Da liễu",
        "medicalLicenseId": "BS001237",
        "clinicAddress": "Bệnh viện Da liễu TP.HCM",
        "bio": "Bác sĩ da liễu chuyên điều trị mụn và các bệnh về da"
    },
    {
        "email": "bs.vothie@pdhealth.com",
        "password": "Doctor123",
        "fullName": "BS. Võ Thị E",
        "specialization": "Sản phụ khoa",
        "medicalLicenseId": "BS001238",
        "clinicAddress": "Bệnh viện Từ Dũ, TP.HCM",
        "bio": "Bác sĩ sản phụ khoa với 12 năm kinh nghiệm"
    },
    {
        "email": "bs.ngominhf@pdhealth.com",
        "password": "Doctor123",
        "fullName": "BS. Ngô Minh F",
        "specialization": "Ngoại khoa",
        "medicalLicenseId": "BS001239",
        "clinicAddress": "Bệnh viện Chợ Rẫy, TP.HCM",
        "bio": "Bác sĩ ngoại khoa tổng quát với 18 năm kinh nghiệm"
    },
    {
        "email": "bs.doantuang@pdhealth.com",
        "password": "Doctor123",
        "fullName": "BS. Đoàn Tuấn G",
        "specialization": "Tai mũi họng",
        "medicalLicenseId": "BS001240",
        "clinicAddress": "Bệnh viện Tai Mũi Họng TP.HCM",
        "bio": "Chuyên khoa Tai Mũi Họng với 8 năm kinh nghiệm"
    },
    {
        "email": "bs.buikimh@pdhealth.com",
        "password": "Doctor123",
        "fullName": "BS. Bùi Kim H",
        "specialization": "Mắt",
        "medicalLicenseId": "BS001241",
        "clinicAddress": "Bệnh viện Mắt TP.HCM",
        "bio": "Bác sĩ chuyên khoa mắt, chuyên điều trị cận thị và đục thủy tinh thể"
    },
    {
        "email": "bs.hoangdungi@pdhealth.com",
        "password": "Doctor123",
        "fullName": "BS. Hoàng Dũng I",
        "specialization": "Thần kinh",
        "medicalLicenseId": "BS001242",
        "clinicAddress": "Bệnh viện 115, TP.HCM",
        "bio": "Bác sĩ thần kinh với 14 năm kinh nghiệm điều trị đột quỵ và bệnh Parkinson"
    },
    {
        "email": "bs.dinhhank@pdhealth.com",
        "password": "Doctor123",
        "fullName": "BS. Đinh Hân K",
        "specialization": "Răng hàm mặt",
        "medicalLicenseId": "BS001243",
        "clinicAddress": "Bệnh viện Răng Hàm Mặt TP.HCM",
        "bio": "Nha sĩ với 10 năm kinh nghiệm điều trị và thẩm mỹ răng"
    }
]


def print_header(text: str):
    """In tiêu đề với màu"""
    print("\n" + "=" * 50)
    print(text)
    print("=" * 50 + "\n")


def register_doctor(doctor: Dict) -> str:
    """Đăng ký tài khoản doctor"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json={
                "email": doctor["email"],
                "password": doctor["password"],
                "role": "doctor"
            },
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201 or response.status_code == 200:
            data = response.json()
            if data.get("success"):
                user_id = data["data"]["user"]["id"]
                print(f"  ✓ Đăng ký thành công! User ID: {user_id}")
                return user_id
        else:
            print(f"  ✗ Lỗi: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"  ✗ Exception: {str(e)}")
        return None


def login_doctor(doctor: Dict) -> str:
    """Đăng nhập và lấy token"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={
                "email": doctor["email"],
                "password": doctor["password"]
            },
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                token = data["data"]["token"]
                print(f"  ✓ Đăng nhập thành công!")
                return token
        else:
            print(f"  ✗ Lỗi đăng nhập: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"  ✗ Exception: {str(e)}")
        return None


def create_doctor_profile(doctor: Dict, token: str) -> bool:
    """Tạo doctor profile"""
    try:
        response = requests.post(
            f"{BASE_URL}/doctors/profile",
            json={
                "fullName": doctor["fullName"],
                "specialization": doctor["specialization"],
                "medicalLicenseId": doctor["medicalLicenseId"],
                "clinicAddress": doctor["clinicAddress"],
                "bio": doctor["bio"]
            },
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            }
        )
        
        if response.status_code == 201 or response.status_code == 200:
            data = response.json()
            if data.get("success"):
                status = data["data"]["status"]
                print(f"  ✓ Tạo profile thành công! Status: {status}")
                return True
        else:
            print(f"  ✗ Lỗi tạo profile: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"  ✗ Exception: {str(e)}")
        return False


def verify_doctor(user_id: str, admin_token: str) -> bool:
    """Xác thực doctor bằng admin"""
    try:
        response = requests.patch(
            f"{BASE_URL}/doctors/{user_id}/verification",
            json={
                "status": "approved",
                "adminNotes": "Đã xác minh thông tin bác sĩ và giấy phép hành nghề"
            },
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {admin_token}"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print(f"  ✓ Xác thực thành công!")
                return True
        else:
            print(f"  ✗ Lỗi xác thực: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"  ✗ Exception: {str(e)}")
        return False


def login_admin() -> str:
    """Đăng nhập admin và lấy token"""
    print("Đăng nhập Admin...")
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={
                "email": "admin@healthcare.com",
                "password": "Admin123456"
            },
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                token = data["data"]["token"]
                print(f"  ✓ Admin đăng nhập thành công!")
                return token
        else:
            print(f"  ✗ Lỗi đăng nhập admin: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"  ✗ Exception: {str(e)}")
        return None


def main():
    print_header("SCRIPT TẠO 10 BÁC SĨ VÀ XÁC THỰC")
    
    doctor_user_ids = []
    
    # BƯỚC 1: Đăng ký tài khoản doctor
    print_header("BƯỚC 1: ĐĂNG KÝ TÀI KHOẢN DOCTOR")
    
    for i, doctor in enumerate(doctors, 1):
        print(f"[{i}/10] Đăng ký: {doctor['fullName']}...")
        user_id = register_doctor(doctor)
        if user_id:
            doctor_user_ids.append(user_id)
        time.sleep(0.5)
    
    print(f"\nĐã đăng ký: {len(doctor_user_ids)}/10 bác sĩ\n")
    
    # BƯỚC 2: Login và tạo profile
    print_header("BƯỚC 2: ĐĂNG NHẬP VÀ TẠO PROFILE")
    
    for i, doctor in enumerate(doctors, 1):
        print(f"[{i}/10] Đăng nhập: {doctor['email']}...")
        token = login_doctor(doctor)
        
        if token:
            print(f"  → Tạo doctor profile...")
            create_doctor_profile(doctor, token)
        
        time.sleep(0.5)
    
    # BƯỚC 3: Xác thực bằng Admin
    print_header("BƯỚC 3: XÁC THỰC BÁC SĨ (TỰ ĐỘNG BẰNG ADMIN)")
    
    admin_token = login_admin()
    
    if admin_token:
        print("\nĐang xác thực các bác sĩ...\n")
        
        for i, user_id in enumerate(doctor_user_ids, 1):
            doctor = doctors[i-1]
            print(f"[{i}/{len(doctor_user_ids)}] Xác thực: {doctor['fullName']}...")
            verify_doctor(user_id, admin_token)
            time.sleep(0.5)
        
        print_header("HOÀN THÀNH!")
    else:
        print("\n⚠ Không thể đăng nhập Admin. Bạn cần xác thực thủ công.\n")
        print("Danh sách User ID cần xác thực:")
        for i, user_id in enumerate(doctor_user_ids, 1):
            print(f"{i}. {doctors[i-1]['fullName']}: {user_id}")
    
    # In thông tin đăng nhập
    print_header("THÔNG TIN ĐĂNG NHẬP")
    
    for doctor in doctors:
        print(f"Email: {doctor['email']}")
        print(f"Password: {doctor['password']}")
        print(f"Chuyên khoa: {doctor['specialization']}")
        print("---")
    
    print("\nLưu ý:")
    print("- Tất cả bác sĩ có password: Doctor123")
    print("- Bác sĩ cần được Admin xác thực (status = approved) mới có thể hoạt động đầy đủ")
    print("- Kiểm tra danh sách bác sĩ tại: GET /api/doctors")
    print()


if __name__ == "__main__":
    main()
