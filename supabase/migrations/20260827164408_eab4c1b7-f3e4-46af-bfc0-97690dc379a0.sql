-- ===== enums =====
CREATE TYPE public.app_role AS ENUM ('admin','staff','guide','customer');
CREATE TYPE public.request_status AS ENUM ('new','reviewing','quoted','converted','declined');
CREATE TYPE public.quote_status AS ENUM ('draft','sent','accepted','rejected','expired');
CREATE TYPE public.booking_status AS ENUM ('pending','confirmed','in_progress','completed','cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending','paid','refunded','failed');
CREATE TYPE public.assignment_status AS ENUM ('scheduled','in_progress','completed','cancelled');

-- ===== shared trigger =====
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ===== profiles =====
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  country TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ===== roles =====
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','staff'));
$$;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_staff(auth.uid()))
  WITH CHECK (id = auth.uid() OR public.is_staff(auth.uid()));

CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "user_roles_admin_manage" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- new user -> profile + customer role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== content: destinations =====
CREATE TABLE public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT '',
  image_key TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  best_time TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  activities TEXT[] NOT NULL DEFAULT '{}',
  attractions TEXT[] NOT NULL DEFAULT '{}',
  accommodation TEXT[] NOT NULL DEFAULT '{}',
  travel_info TEXT[] NOT NULL DEFAULT '{}',
  faq JSONB NOT NULL DEFAULT '[]',
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  destination_slugs TEXT[] NOT NULL DEFAULT '{}',
  days INT NOT NULL DEFAULT 1,
  nights INT NOT NULL DEFAULT 0,
  price_from NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  image_key TEXT NOT NULL DEFAULT '',
  short TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  highlights TEXT[] NOT NULL DEFAULT '{}',
  included TEXT[] NOT NULL DEFAULT '{}',
  excluded TEXT[] NOT NULL DEFAULT '{}',
  requirements TEXT[] NOT NULL DEFAULT '{}',
  cancellation TEXT NOT NULL DEFAULT '',
  max_travelers INT NOT NULL DEFAULT 8,
  available_months TEXT NOT NULL DEFAULT '',
  accommodation TEXT NOT NULL DEFAULT '',
  transport TEXT NOT NULL DEFAULT '',
  itinerary JSONB NOT NULL DEFAULT '[]',
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  blurb TEXT NOT NULL DEFAULT '',
  destination_slugs TEXT[] NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  post_date DATE NOT NULL DEFAULT CURRENT_DATE,
  read_minutes INT NOT NULL DEFAULT 5,
  image_key TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT[] NOT NULL DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT '',
  trip TEXT NOT NULL DEFAULT '',
  rating INT NOT NULL DEFAULT 5,
  quote TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- public content grants + RLS
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['destinations','packages','activities','blog_posts','testimonials'] LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "%s_public_read" ON public.%I FOR SELECT USING (published = true)', t, t);
    EXECUTE format('CREATE POLICY "%s_staff_read" ON public.%I FOR SELECT TO authenticated USING (public.is_staff(auth.uid()))', t, t);
    EXECUTE format('CREATE POLICY "%s_staff_write" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()))', t, t);
    EXECUTE format('CREATE POLICY "%s_staff_update" ON public.%I FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()))', t, t);
    EXECUTE format('CREATE POLICY "%s_staff_delete" ON public.%I FOR DELETE TO authenticated USING (public.is_staff(auth.uid()))', t, t);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t || '_set_updated_at', t);
  END LOOP;
END $$;

-- ===== operations =====
CREATE TABLE public.guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  languages TEXT[] NOT NULL DEFAULT '{}',
  specialties TEXT[] NOT NULL DEFAULT '{}',
  daily_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT '4x4 Land Cruiser',
  plate TEXT,
  capacity INT NOT NULL DEFAULT 6,
  daily_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  destination_slug TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL DEFAULT 'Mid-range',
  city TEXT,
  contact_email TEXT,
  phone TEXT,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===== requests =====
CREATE TABLE public.safari_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  destination_slugs TEXT[] NOT NULL DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  adults INT NOT NULL DEFAULT 2,
  children INT NOT NULL DEFAULT 0,
  budget_range TEXT,
  accommodation_level TEXT,
  transport TEXT[] NOT NULL DEFAULT '{}',
  interests TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  status public.request_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  request_id UUID REFERENCES public.safari_requests(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Safari quote',
  summary TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  currency TEXT NOT NULL DEFAULT 'USD',
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  valid_until DATE,
  status public.quote_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  request_id UUID REFERENCES public.safari_requests(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  lead_name TEXT NOT NULL DEFAULT '',
  lead_email TEXT NOT NULL DEFAULT '',
  start_date DATE,
  end_date DATE,
  travelers INT NOT NULL DEFAULT 2,
  currency TEXT NOT NULL DEFAULT 'USD',
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  status public.booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  method TEXT NOT NULL DEFAULT 'bank_transfer',
  reference TEXT,
  status public.payment_status NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES public.guides(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  status public.assignment_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['guides','vehicles','accommodations','safari_requests','quotes','bookings','payments','assignments'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "%s_staff_all" ON public.%I FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()))', t, t);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t || '_set_updated_at', t);
  END LOOP;
END $$;

-- anonymous safari requests from the public planner form
GRANT INSERT ON public.safari_requests TO anon;
CREATE POLICY "requests_public_insert" ON public.safari_requests FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "requests_owner_read" ON public.safari_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "requests_owner_update" ON public.safari_requests FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND status = 'new') WITH CHECK (user_id = auth.uid());

CREATE POLICY "quotes_owner_read" ON public.quotes FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND status <> 'draft');
CREATE POLICY "quotes_owner_respond" ON public.quotes FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND status IN ('sent','accepted','rejected'))
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "bookings_owner_read" ON public.bookings FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "payments_owner_read" ON public.payments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = payments.booking_id AND b.user_id = auth.uid()));

-- guide portal access
CREATE POLICY "guides_self_read" ON public.guides FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "guides_self_update" ON public.guides FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "assignments_guide_read" ON public.assignments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.guides g WHERE g.id = assignments.guide_id AND g.user_id = auth.uid()));
CREATE POLICY "assignments_guide_update" ON public.assignments FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.guides g WHERE g.id = assignments.guide_id AND g.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.guides g WHERE g.id = assignments.guide_id AND g.user_id = auth.uid()));
CREATE POLICY "bookings_guide_read" ON public.bookings FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.assignments a JOIN public.guides g ON g.id = a.guide_id
    WHERE a.booking_id = bookings.id AND g.user_id = auth.uid()));
CREATE POLICY "vehicles_guide_read" ON public.vehicles FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.guides g WHERE g.user_id = auth.uid()));

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- reference generator
CREATE OR REPLACE FUNCTION public.generate_reference(_prefix TEXT)
RETURNS TEXT LANGUAGE sql VOLATILE SET search_path = public AS $$
  SELECT _prefix || '-' || to_char(now(),'YYMM') || '-' || upper(substr(md5(gen_random_uuid()::text),1,5));
$$;