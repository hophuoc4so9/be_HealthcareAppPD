import requests

# API Configuration
BASE_URL = "http://localhost:5000/api"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "Admin123"

def get_all_doctors():
    """Lấy danh sách tất cả bác sĩ"""
    try:
        # Đăng nhập admin
        login_response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        
        if login_response.status_code != 200:
            print(f"❌ Không thể đăng nhập admin: {login_response.text}")
            return []
        
        token = login_response.json().get('data', {}).get('token')
        
        # Lấy danh sách users với role doctor
        users_response = requests.get(
            f"{BASE_URL}/users?role=doctor&limit=1000",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if users_response.status_code == 200:
            users_data = users_response.json().get('data', {})
            doctors = users_data.get('users', [])
            print(f"✅ Tìm thấy {len(doctors)} bác sĩ trong hệ thống\n")
            
            print("Danh sách bác sĩ:")
            print("="*60)
            for i, doctor in enumerate(doctors, 1):
                email = doctor.get('email', 'N/A')
                user_id = doctor.get('id', 'N/A')
                is_active = doctor.get('is_active', False)
                status = "🟢 Active" if is_active else "🔴 Inactive"
                print(f"{i}. {email} ({user_id}) - {status}")
            
            return doctors
        else:
            print(f"❌ Không thể lấy danh sách bác sĩ: {users_response.text}")
            return []
            
    except Exception as e:
        print(f"❌ Lỗi: {str(e)}")
        return []

if __name__ == "__main__":
    print("🔍 Đang lấy danh sách bác sĩ từ database...\n")
    doctors = get_all_doctors()
    
    if doctors:
        print(f"\n📋 Sao chép danh sách email này vào file generate-doctor-schedules.py:")
        print("="*60)
        print("DOCTORS = [")
        for doctor in doctors:
            if doctor.get('is_active'):
                email = doctor.get('email')
                print(f'    {{"email": "{email}", "password": "Doctor123"}},')
        print("]")
