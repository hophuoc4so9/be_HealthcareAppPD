-- #### THIẾT KẾ CƠ SỞ DỮ LIỆU POSTGRESQL CHO "PD HEALTH" ####

-- #### BƯỚC 1: KÍCH HOẠT TIỆN ÍCH MỞ RỘNG ####
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- #### BƯỚC 2: ĐỊNH NGHĨA CÁC KIỂU ENUM TÙY CHỈNH ####

-- Kiểu ENUM cho vai trò người dùng
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'patient', 
        'doctor', 
        'admin'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Kiểu ENUM cho giới tính
DO $$ BEGIN
    CREATE TYPE user_sex AS ENUM (
        'male', 
        'female', 
        'other', 
        'prefer_not_to_say'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Kiểu ENUM cho trạng thái xác minh của bác sĩ
DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM (
        'pending', 
        'approved', 
        'rejected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Kiểu ENUM cho loại chỉ số sức khỏe
DO $$ BEGIN
    CREATE TYPE metric_type AS ENUM (
        'steps', 
        'sleep_duration_minutes', 
        'distance_meters', 
        'active_calories'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Kiểu ENUM cho loại lời nhắc
DO $$ BEGIN
    CREATE TYPE reminder_type AS ENUM (
        'medication', 
        'sleep', 
        'appointment', 
        'general'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Kiểu ENUM cho trạng thái lịch hẹn
DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM (
        'scheduled',
        'completed',
        'cancelled_by_patient',
        'cancelled_by_doctor'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Kiểu ENUM cho trạng thái bài viết
DO $$ BEGIN
    CREATE TYPE article_status AS ENUM (
        'draft', 
        'published', 
        'archived'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- #### BƯỚC 3: TẠO BẢNG ####

-- Bảng Xác thực Cốt lõi
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_banned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bảng Hồ sơ Bệnh nhân (1:1 với users)
CREATE TABLE IF NOT EXISTS patient_profiles (
    user_id UUID PRIMARY KEY,
    full_name TEXT NOT NULL,
    date_of_birth DATE,
    sex user_sex,
    phone_number TEXT,
    address TEXT,
    CONSTRAINT fk_user_patient
        FOREIGN KEY(user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Bảng Hồ sơ Bác sĩ (1:1 với users)
CREATE TABLE IF NOT EXISTS doctor_profiles (
    user_id UUID PRIMARY KEY,
    full_name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    medical_license_id TEXT,
    clinic_address TEXT,
    bio TEXT,
    status verification_status DEFAULT 'pending',
    admin_notes TEXT,
    CONSTRAINT fk_user_doctor
        FOREIGN KEY(user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Bảng Chỉ số Tĩnh (Cân nặng, Chiều cao, BMI)
CREATE TABLE IF NOT EXISTS patient_vitals (
    id BIGSERIAL PRIMARY KEY,
    patient_user_id UUID NOT NULL,
    height_cm NUMERIC(5, 2),
    weight_kg NUMERIC(5, 2),
    bmi NUMERIC(4, 2),
    recorded_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_patient_vitals
        FOREIGN KEY(patient_user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT check_positive_values CHECK (height_cm > 0 AND weight_kg > 0)
);

-- Bảng Chỉ số Động (API - Bước đi, Giấc ngủ)
CREATE TABLE IF NOT EXISTS patient_metrics (
    id BIGSERIAL PRIMARY KEY,
    patient_user_id UUID NOT NULL,
    metric_type metric_type NOT NULL,
    value NUMERIC NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    source TEXT,
    metadata JSONB,
    CONSTRAINT fk_patient_metrics
        FOREIGN KEY(patient_user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Bảng Lời nhắc
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    reminder_type reminder_type NOT NULL,
    cron_expression TEXT,
    one_time_at TIMESTAMPTZ,
    timezone_name TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_patient_reminders
        FOREIGN KEY(patient_user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Bảng Sự khả dụng của Bác sĩ (Khe thời gian)
CREATE TABLE IF NOT EXISTS doctor_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_user_id UUID NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_booked BOOLEAN DEFAULT false,
    CONSTRAINT fk_doctor_availability
        FOREIGN KEY(doctor_user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Bảng Lịch hẹn (Đã đặt)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_user_id UUID NOT NULL,
    doctor_user_id UUID NOT NULL,
    availability_slot_id UUID NOT NULL UNIQUE,
    status appointment_status DEFAULT 'scheduled',
    patient_notes TEXT,
    doctor_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_patient_appointments
        FOREIGN KEY(patient_user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_doctor_appointments
        FOREIGN KEY(doctor_user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_availability_slot
        FOREIGN KEY(availability_slot_id) 
        REFERENCES doctor_availability(id)
);

-- Bảng Cuộc hội thoại Chat
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_user_id UUID NOT NULL,
    doctor_user_id UUID NOT NULL,
    CONSTRAINT fk_patient_chat
        FOREIGN KEY(patient_user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_doctor_chat
        FOREIGN KEY(doctor_user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT unique_chat_pair UNIQUE(patient_user_id, doctor_user_id)
);

-- Bảng Tin nhắn Chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id UUID NOT NULL,
    sender_user_id UUID NOT NULL,
    message_content TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT now(),
    read_at TIMESTAMPTZ,
    CONSTRAINT fk_conversation
        FOREIGN KEY(conversation_id) 
        REFERENCES chat_conversations(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_sender
        FOREIGN KEY(sender_user_id) 
        REFERENCES users(id)
);

-- Bảng Quan hệ Bác sĩ-Bệnh nhân (M:N)
CREATE TABLE IF NOT EXISTS doctor_patients (
    doctor_user_id UUID NOT NULL,
    patient_user_id UUID NOT NULL,
    first_consultation_date DATE DEFAULT CURRENT_DATE,
    CONSTRAINT fk_doctor_patients_doctor
        FOREIGN KEY(doctor_user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_doctor_patients_patient
        FOREIGN KEY(patient_user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE,
    PRIMARY KEY (doctor_user_id, patient_user_id)
);

-- Bảng Bài viết (Tin tức Sức khỏe)
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_admin_id UUID NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content_body TEXT,
    external_url TEXT,
    featured_image_url TEXT,
    status article_status DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_author_admin
        FOREIGN KEY(author_admin_id) 
        REFERENCES users(id)
);

-- Thêm cột external_url nếu chưa tồn tại (migration)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'external_url'
    ) THEN
        ALTER TABLE articles ADD COLUMN external_url TEXT;
    END IF;
END $$;

-- Note: Check constraint với subquery không được hỗ trợ trong PostgreSQL
-- Thay vào đó, nên validate role='admin' trong application logic

-- #### BƯỚC 4: TẠO CHỈ MỤC (INDEXES) ####

-- Chỉ mục cho `users`
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Chỉ mục cho `patient_vitals`
CREATE INDEX IF NOT EXISTS idx_patient_vitals_user_id_time 
    ON patient_vitals (patient_user_id, recorded_at DESC);

-- Chỉ mục cho `patient_metrics`
CREATE INDEX IF NOT EXISTS idx_patient_metrics_user_type_time 
    ON patient_metrics (patient_user_id, metric_type, start_time DESC);

-- Chỉ mục cho `reminders`
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders (patient_user_id);

-- Chỉ mục cho `doctor_availability`
CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor_id_start_time 
    ON doctor_availability (doctor_user_id, start_time) 
    WHERE is_booked = false;

-- Chỉ mục cho `appointments`
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments (patient_user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments (doctor_user_id);

-- Chỉ mục cho `chat_messages`
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id_sent_at 
    ON chat_messages (conversation_id, sent_at DESC);

-- Chỉ mục cho `doctor_patients`
CREATE INDEX IF NOT EXISTS idx_doctor_patients_doctor_id ON doctor_patients (doctor_user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_patients_patient_id ON doctor_patients (patient_user_id);

-- Chỉ mục cho `articles`
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles (slug);
CREATE INDEX IF NOT EXISTS idx_articles_status_published_at 
    ON articles (status, published_at DESC) 
    WHERE status = 'published';
