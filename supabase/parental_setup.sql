-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT CHECK (role IN ('parent', 'child')) DEFAULT 'child',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Parent-Child relationship table
CREATE TABLE IF NOT EXISTS family_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  child_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(parent_id, child_id)
);

-- Enable RLS on new tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_links ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Family links policies
DROP POLICY IF EXISTS "Parents can view their family links" ON family_links;
CREATE POLICY "Parents can view their family links" ON family_links
  FOR SELECT USING (auth.uid() = parent_id);

DROP POLICY IF EXISTS "Parents can create family links" ON family_links;
CREATE POLICY "Parents can create family links" ON family_links
  FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- Update RLS policies for activity tables to allow parents to view child data

-- Expenses
DROP POLICY IF EXISTS "Parents can view their children's expenses" ON expenses;
CREATE POLICY "Parents can view their children's expenses" ON expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_links 
      WHERE parent_id = auth.uid() AND child_id = expenses.user_id
    )
  );

-- Meals
DROP POLICY IF EXISTS "Parents can view their children's meals" ON meals;
CREATE POLICY "Parents can view their children's meals" ON meals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_links 
      WHERE parent_id = auth.uid() AND child_id = meals.user_id
    )
  );

-- Tasks
DROP POLICY IF EXISTS "Parents can view their children's tasks" ON tasks;
CREATE POLICY "Parents can view their children's tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_links 
      WHERE parent_id = auth.uid() AND child_id = tasks.user_id
    )
  );

-- Calendar Events
DROP POLICY IF EXISTS "Parents can view their children's calendar events" ON calendar_events;
CREATE POLICY "Parents can view their children's calendar events" ON calendar_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_links 
      WHERE parent_id = auth.uid() AND child_id = calendar_events.user_id
    )
  );
