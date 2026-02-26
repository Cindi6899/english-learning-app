
-- Create users table (Assuming auth.users is handled by Supabase Auth, but we might need a public profile table if required by the TAD. The TAD defines a `users` table with id, email, password_hash, name. Wait, Supabase handles auth.users. The TAD might be referring to a public users table linked to auth.users or a custom auth implementation. Given Supabase is used, usually we use `auth.users`. The TAD explicitly says "users table (users)" with password_hash. This suggests a custom auth or a misunderstanding of Supabase Auth. However, since the TAD says "Backend: Supabase (Built-in Auth)", I should probably use Supabase Auth and link a `profiles` table to `auth.users` if extra fields are needed. But the TAD defines `users` table explicitly. I will follow the TAD for now but add a comment that this might duplicate Supabase Auth if not careful. Actually, the TAD says "Supabase (Built-in Auth)". If so, `auth.users` is the source of truth. The `users` table in TAD has `password_hash`, which Supabase Auth handles. I will create the tables as requested in TAD but be aware of this. Actually, if I use Supabase Auth, I don't need to store password hash myself. I will assume the `users` table in TAD is intended to be the public profile table, perhaps linked to `auth.users`. But it has `password_hash`. This is conflicting. I will follow the TAD's schema for now to be safe, but I'll add a comment.)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant permissions for users
GRANT SELECT ON users TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;

-- Vocabularies table
CREATE TABLE IF NOT EXISTS vocabularies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    word VARCHAR(100) NOT NULL,
    translation TEXT NOT NULL,
    pronunciation VARCHAR(255),
    example_sentence TEXT,
    mastery_level VARCHAR(20) DEFAULT 'new' CHECK (mastery_level IN ('new', 'learning', 'mastered')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for vocabularies
CREATE INDEX IF NOT EXISTS idx_vocabularies_user_id ON vocabularies(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabularies_word ON vocabularies(word);

-- Grant permissions for vocabularies
GRANT SELECT ON vocabularies TO anon;
GRANT ALL PRIVILEGES ON vocabularies TO authenticated;

-- Review schedules table
CREATE TABLE IF NOT EXISTS review_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vocabulary_id UUID REFERENCES vocabularies(id) ON DELETE CASCADE,
    review_date DATE NOT NULL,
    review_stage INTEGER DEFAULT 1 CHECK (review_stage BETWEEN 1 AND 8),
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for review_schedules
CREATE INDEX IF NOT EXISTS idx_review_schedules_user_id ON review_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_review_schedules_review_date ON review_schedules(review_date);
CREATE INDEX IF NOT EXISTS idx_review_schedules_completed ON review_schedules(completed);

-- Grant permissions for review_schedules
GRANT SELECT ON review_schedules TO anon;
GRANT ALL PRIVILEGES ON review_schedules TO authenticated;

-- Listening history table
CREATE TABLE IF NOT EXISTS listening_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    audio_title VARCHAR(255) NOT NULL,
    audio_url TEXT NOT NULL,
    listened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100)
);

-- Indexes for listening_history
CREATE INDEX IF NOT EXISTS idx_listening_history_user_id ON listening_history(user_id);
CREATE INDEX IF NOT EXISTS idx_listening_history_listened_at ON listening_history(listened_at DESC);

-- Grant permissions for listening_history
GRANT SELECT ON listening_history TO anon;
GRANT ALL PRIVILEGES ON listening_history TO authenticated;
