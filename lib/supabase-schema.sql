-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'player' CHECK (role IN ('organizer', 'player', 'spectator')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clubs table
CREATE TABLE clubs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tournaments table
CREATE TABLE tournaments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'SWISS',
  status TEXT DEFAULT 'SCHEDULED',
  rounds INTEGER DEFAULT 5,
  current_round INTEGER DEFAULT 0,
  time_control TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  director TEXT,
  organizer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
  points_win FLOAT DEFAULT 1.0,
  points_draw FLOAT DEFAULT 0.5,
  points_loss FLOAT DEFAULT 0.0,
  tiebreak1 TEXT DEFAULT 'BUCHHOLZ',
  tiebreak2 TEXT DEFAULT 'SONNEBORN_BERGER',
  allow_half_points BOOLEAN DEFAULT TRUE,
  auto_pairing BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  rating INTEGER,
  rating_type TEXT DEFAULT 'FIDE',
  title TEXT,
  federation TEXT,
  lichess_username TEXT,
  blitz_rating INTEGER,
  rapid_rating INTEGER,
  classical_rating INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  initial_rating INTEGER,
  current_rating INTEGER,
  score FLOAT DEFAULT 0.0,
  tiebreak1 FLOAT DEFAULT 0.0,
  tiebreak2 FLOAT DEFAULT 0.0,
  performance_rating INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rounds table
CREATE TABLE rounds (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, number)
);

-- Matches table
CREATE TABLE matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
  board_number INTEGER,
  white_player_id UUID REFERENCES players(id),
  black_player_id UUID REFERENCES players(id),
  result TEXT,
  white_rating INTEGER,
  black_rating INTEGER,
  moves TEXT,
  opening TEXT,
  eco_code TEXT,
  num_moves INTEGER,
  lichess_game_id TEXT,
  game_time INTEGER,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, round_id, board_number)
);

-- Byes table
CREATE TABLE byes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  round_number INTEGER,
  is_requested BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, player_id, round_number)
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE byes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Clubs: Anyone can read, organizers can create/update
CREATE POLICY "Anyone can view clubs" ON clubs FOR SELECT USING (true);
CREATE POLICY "Organizers can create clubs" ON clubs FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'organizer'));
CREATE POLICY "Club creators can update clubs" ON clubs FOR UPDATE USING (auth.uid() = created_by);

-- Tournaments: Anyone can read, organizers can create/update their tournaments
CREATE POLICY "Anyone can view tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Organizers can create tournaments" ON tournaments FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'organizer'));
CREATE POLICY "Tournament organizers can update tournaments" ON tournaments FOR UPDATE USING (auth.uid() = organizer_id);

-- Players: Tournament participants and organizers can view, organizers can manage
CREATE POLICY "Tournament players and organizers can view players" ON players FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM players WHERE tournament_id = players.tournament_id) OR
  auth.uid() IN (SELECT organizer_id FROM tournaments WHERE id = players.tournament_id)
);
CREATE POLICY "Tournament organizers can manage players" ON players FOR ALL USING (
  auth.uid() IN (SELECT organizer_id FROM tournaments WHERE id = players.tournament_id)
);

-- Similar policies for rounds, matches, byes (organizers can manage, participants can view)

-- Rounds
CREATE POLICY "Tournament participants and organizers can view rounds" ON rounds FOR SELECT USING (
  auth.uid() IN (SELECT organizer_id FROM tournaments WHERE id = rounds.tournament_id) OR
  auth.uid() IN (SELECT user_id FROM players WHERE tournament_id = rounds.tournament_id)
);
CREATE POLICY "Tournament organizers can manage rounds" ON rounds FOR ALL USING (
  auth.uid() IN (SELECT organizer_id FROM tournaments WHERE id = rounds.tournament_id)
);

-- Matches
CREATE POLICY "Tournament participants and organizers can view matches" ON matches FOR SELECT USING (
  auth.uid() IN (SELECT organizer_id FROM tournaments WHERE id = matches.tournament_id) OR
  auth.uid() IN (SELECT user_id FROM players WHERE tournament_id = matches.tournament_id)
);
CREATE POLICY "Tournament organizers can manage matches" ON matches FOR ALL USING (
  auth.uid() IN (SELECT organizer_id FROM tournaments WHERE id = matches.tournament_id)
);

-- Byes
CREATE POLICY "Tournament participants and organizers can view byes" ON byes FOR SELECT USING (
  auth.uid() IN (SELECT organizer_id FROM tournaments WHERE id = byes.tournament_id) OR
  auth.uid() IN (SELECT user_id FROM players WHERE tournament_id = byes.tournament_id)
);
CREATE POLICY "Tournament organizers can manage byes" ON byes FOR ALL USING (
  auth.uid() IN (SELECT organizer_id FROM tournaments WHERE id = byes.tournament_id)
);

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Club tournaments table
CREATE TABLE club_tournaments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  club1_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  club2_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'SCHEDULED',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  scoring_rules JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Club standings
CREATE TABLE club_standings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  club_tournament_id UUID REFERENCES club_tournaments(id) ON DELETE CASCADE,
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  board_points FLOAT DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  type TEXT,
  criteria JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player achievements
CREATE TABLE player_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player stats
CREATE TABLE player_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  games_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  win_rate_white FLOAT,
  win_rate_black FLOAT,
  average_cpl FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Club stats
CREATE TABLE club_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  total_wins INTEGER DEFAULT 0,
  championships INTEGER DEFAULT 0,
  average_rating FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for new tables
ALTER TABLE club_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic, can be expanded)
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Anyone can view player achievements" ON player_achievements FOR SELECT USING (true);
CREATE POLICY "Players can view their own stats" ON player_stats FOR SELECT USING (auth.uid() IN (SELECT user_id FROM players WHERE id = player_stats.player_id));
CREATE POLICY "Anyone can view club stats" ON club_stats FOR SELECT USING (true);

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();