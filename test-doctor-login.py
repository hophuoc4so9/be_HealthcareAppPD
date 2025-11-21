#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Test login bác sĩ và get profile"""

import requests
import json

BASE_URL = "https://be-healthcareapppd.onrender.com/api"

# Test login
print("=" * 60)
print("LOGIN BÁC SĨ NGUYỄN VĂN A")
print("=" * 60)

login_response = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email": "bs.nguyenvana@pdhealth.com",
        "password": "Doctor123"
    }
)

print(f"Status: {login_response.status_code}")
login_data = login_response.json()
print(json.dumps(login_data, indent=2, ensure_ascii=False))

if login_data.get("success"):
    token = login_data["data"]["token"]
    print(f"\n✓ Token: {token[:50]}...")
    
    # Get profile
    print("\n" + "=" * 60)
    print("GET DOCTOR PROFILE")
    print("=" * 60)
    
    profile_response = requests.get(
        f"{BASE_URL}/doctors/profile",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    print(f"Status: {profile_response.status_code}")
    profile_data = profile_response.json()
    print(json.dumps(profile_data, indent=2, ensure_ascii=False))
