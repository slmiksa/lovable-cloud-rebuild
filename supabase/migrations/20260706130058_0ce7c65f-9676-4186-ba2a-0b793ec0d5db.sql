
create type public.app_role as enum ('admin','moderator','user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.user_roles where user_id=_user_id and role=_role)
$$;

create policy "roles readable" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path=public as $$
begin new.updated_at = now(); return new; end $$;

create table public.slides (
  id uuid primary key default gen_random_uuid(),
  title text, subtitle text, image_url text, cta_label text, cta_url text,
  sort_order int not null default 0, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
grant select on public.slides to anon, authenticated;
grant insert,update,delete on public.slides to authenticated;
grant all on public.slides to service_role;
alter table public.slides enable row level security;
create policy "read active slides" on public.slides for select using (is_active);
create policy "admin slides" on public.slides for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger t_slides_upd before update on public.slides for each row execute function public.set_updated_at();

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text, icon text, image_url text,
  sort_order int not null default 0, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
grant select on public.services to anon, authenticated;
grant insert,update,delete on public.services to authenticated;
grant all on public.services to service_role;
alter table public.services enable row level security;
create policy "read active services" on public.services for select using (is_active);
create policy "admin services" on public.services for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger t_services_upd before update on public.services for each row execute function public.set_updated_at();

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text, image_url text, price text, badge text,
  sort_order int not null default 0, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
grant select on public.offers to anon, authenticated;
grant insert,update,delete on public.offers to authenticated;
grant all on public.offers to service_role;
alter table public.offers enable row level security;
create policy "read active offers" on public.offers for select using (is_active);
create policy "admin offers" on public.offers for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger t_offers_upd before update on public.offers for each row execute function public.set_updated_at();

create table public.systems (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text, icon text, image_url text, features text[],
  sort_order int not null default 0, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
grant select on public.systems to anon, authenticated;
grant insert,update,delete on public.systems to authenticated;
grant all on public.systems to service_role;
alter table public.systems enable row level security;
create policy "read active systems" on public.systems for select using (is_active);
create policy "admin systems" on public.systems for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger t_systems_upd before update on public.systems for each row execute function public.set_updated_at();

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null, logo_url text, website_url text,
  sort_order int not null default 0, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
grant select on public.clients to anon, authenticated;
grant insert,update,delete on public.clients to authenticated;
grant all on public.clients to service_role;
alter table public.clients enable row level security;
create policy "read active clients" on public.clients for select using (is_active);
create policy "admin clients" on public.clients for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger t_clients_upd before update on public.clients for each row execute function public.set_updated_at();

create table public.news (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique, title text not null, excerpt text, content text, image_url text,
  published_at timestamptz, is_published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
grant select on public.news to anon, authenticated;
grant insert,update,delete on public.news to authenticated;
grant all on public.news to service_role;
alter table public.news enable row level security;
create policy "read published news" on public.news for select using (is_published);
create policy "admin news" on public.news for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger t_news_upd before update on public.news for each row execute function public.set_updated_at();

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null, url text not null, icon text,
  sort_order int not null default 0, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
grant select on public.social_links to anon, authenticated;
grant insert,update,delete on public.social_links to authenticated;
grant all on public.social_links to service_role;
alter table public.social_links enable row level security;
create policy "read active social" on public.social_links for select using (is_active);
create policy "admin social" on public.social_links for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger t_social_upd before update on public.social_links for each row execute function public.set_updated_at();

insert into public.slides (title, subtitle, cta_label, cta_url, sort_order) values
('نحمي أعمالك الرقمية بحلول أمن سيبراني متكاملة','خبراء LamhaSec يقدمون خدمات الأمن السيبراني والحلول التقنية والاستشارات لحماية مؤسستك.','اكتشف حلول LamhaSec','#services',1);

insert into public.services (title, description, icon, sort_order) values
('الأمن السيبراني','حماية شاملة من التهديدات، اختبار اختراق، وإدارة المخاطر.','ShieldCheck',1),
('الحلول التقنية','بنية تحتية موثوقة، شبكات، وأنظمة سحابية.','ServerCog',2),
('الحلول البرمجية','تطوير تطبيقات ويب وموبايل وأنظمة أعمال.','Cpu',3),
('الاستشارات','مراجعة الوضع الأمني والامتثال وتقديم خارطة طريق.','BadgeCheck',4);
