#!/usr/bin/env node

/**
 * Goldbar LMS Database Setup Script
 * Run this once to initialize all database tables
 * 
 * Usage: node scripts/setup-database.js
 */

const { createClient } = require('@supabase/supabase-js');

const PROJECT_URL = 'https://oxvhxnhbhidizcrtzfad.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dmh4bmhiaGlkaXpjcnR6ZmFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDAzOTgzMSwiImV4cCI6MjA5OTYxNTgzMX0.syixEe2E6eeC7clnNBisbZQMphXNrMAnUmhDyjwYIfY';

const supabase = createClient(PROJECT_URL, SERVICE_KEY);

async function setupDatabase() {
  console.log('🚀 Setting up Goldbar LMS database...\n');

  try {
    // 1. Create onboarding_parts table
    console.log('📚 Creating onboarding_parts table...');
    await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS onboarding_parts (
          id SERIAL PRIMARY KEY,
          part_number INT NOT NULL UNIQUE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          content TEXT NOT NULL,
          order_index INT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `
    });
    console.log('✅ onboarding_parts table created\n');

    // 2. Create questions table
    console.log('📝 Creating questions table...');
    await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS questions (
          id SERIAL PRIMARY KEY,
          part_id INT REFERENCES onboarding_parts(id) ON DELETE CASCADE,
          question_text TEXT NOT NULL,
          question_type VARCHAR(50), -- 'multiple_choice' or 'short_answer'
          options JSONB, -- For multiple choice: {a: "...", b: "...", c: "..."}
          correct_answer VARCHAR(255), -- For multiple choice: 'a', 'b', etc. For short: expected summary
          points INT DEFAULT 10,
          order_index INT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `
    });
    console.log('✅ questions table created\n');

    // 3. Create user_progress table
    console.log('👤 Creating user_progress table...');
    await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_progress (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          part_id INT REFERENCES onboarding_parts(id) ON DELETE CASCADE,
          completed BOOLEAN DEFAULT FALSE,
          assessment_score INT,
          assessment_passed BOOLEAN DEFAULT FALSE,
          completed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, part_id)
        )
      `
    });
    console.log('✅ user_progress table created\n');

    // 4. Create assessments table
    console.log('📊 Creating assessments table...');
    await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS assessments (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          part_id INT REFERENCES onboarding_parts(id) ON DELETE CASCADE,
          answers JSONB NOT NULL, -- {question_id: answer}
          score INT,
          passed BOOLEAN,
          submitted_at TIMESTAMP DEFAULT NOW(),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `
    });
    console.log('✅ assessments table created\n');

    // 5. Create comments table
    console.log('💬 Creating comments table...');
    await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS comments (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          part_id INT REFERENCES onboarding_parts(id) ON DELETE CASCADE,
          comment_text TEXT NOT NULL,
          is_admin_response BOOLEAN DEFAULT FALSE,
          response_to_id INT REFERENCES comments(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `
    });
    console.log('✅ comments table created\n');

    // 6. Create recommendations table
    console.log('💡 Creating recommendations table...');
    await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS recommendations (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          part_id INT REFERENCES onboarding_parts(id),
          recommendation_text TEXT NOT NULL,
          category VARCHAR(100), -- 'process', 'content', 'clarity', 'other'
          is_addressed BOOLEAN DEFAULT FALSE,
          admin_response TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `
    });
    console.log('✅ recommendations table created\n');

    // 7. Create user_profiles table
    console.log('🎯 Creating user_profiles table...');
    await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          full_name VARCHAR(255),
          email VARCHAR(255) UNIQUE,
          role VARCHAR(50), -- 'am' or 'admin'
          is_admin BOOLEAN DEFAULT FALSE,
          started_at TIMESTAMP DEFAULT NOW(),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `
    });
    console.log('✅ user_profiles table created\n');

    console.log('✨ Database setup complete!\n');
    console.log('📝 Next steps:');
    console.log('1. Create your admin account (Rose)');
    console.log('2. New AMs will self-register and start Part 1');
    console.log('3. Check admin dashboard to view progress\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
