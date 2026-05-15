-- ReachSafe Supabase Schema

-- 1. Users Table
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Trusted Contacts Table
CREATE TABLE public.trusted_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    traveller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    relationship TEXT,
    permission_level TEXT CHECK (permission_level IN ('sos_only', 'commute_only', 'full_guardian')),
    receives_sos BOOLEAN DEFAULT TRUE,
    receives_commute_updates BOOLEAN DEFAULT FALSE,
    priority TEXT CHECK (priority IN ('primary', 'secondary')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Commute Sessions Table
CREATE TABLE public.commute_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    traveller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    route_name TEXT,
    from_label TEXT,
    to_label TEXT,
    transport_mode TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expected_arrival TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    status TEXT CHECK (status IN ('active', 'completed', 'cancelled'))
);

-- 4. Emergency Events Table
CREATE TABLE public.emergency_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    traveller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    latest_latitude DOUBLE PRECISION,
    latest_longitude DOUBLE PRECISION,
    selected_contacts JSONB,
    call_112_opened BOOLEAN DEFAULT FALSE,
    status TEXT CHECK (status IN ('active', 'resolved'))
);

-- 5. Location Pings Table
CREATE TABLE public.location_pings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    traveller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    commute_session_id UUID REFERENCES public.commute_sessions(id) ON DELETE CASCADE,
    emergency_event_id UUID REFERENCES public.emergency_events(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION,
    battery_level INTEGER,
    network_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commute_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_pings ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Owner access)
CREATE POLICY "Users can manage their own profile" ON public.users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage their own trusted contacts" ON public.trusted_contacts FOR ALL USING (auth.uid() = traveller_id);
CREATE POLICY "Users can manage their own commute sessions" ON public.commute_sessions FOR ALL USING (auth.uid() = traveller_id);
CREATE POLICY "Users can manage their own emergency events" ON public.emergency_events FOR ALL USING (auth.uid() = traveller_id);
CREATE POLICY "Users can manage their own location pings" ON public.location_pings FOR ALL USING (auth.uid() = traveller_id);
