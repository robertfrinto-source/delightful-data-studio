
create type public.app_role as enum ('admin','customer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, phone text, email text,
  created_at timestamptz not null default now()
);
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique(user_id, role)
);
grant select, insert, update on public.profiles to authenticated;
grant select on public.user_roles to authenticated;
grant all on public.profiles, public.user_roles to service_role;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid());
create policy "own roles read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  full_name text not null, phone text not null, alt_phone text, email text,
  national_id text, governorate text, address text, segment text,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now()
);
create table public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null, provider text not null, service_type text not null default 'internet',
  gb numeric default 0, minutes numeric default 0,
  cost_price numeric not null default 0, selling_price numeric not null default 0,
  duration_days int not null default 30, description text,
  status text not null default 'active', is_public boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.lines (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  parent_line_id uuid references public.lines(id) on delete set null,
  number text not null, provider text, line_type text not null default 'main',
  package_id uuid references public.packages(id) on delete set null,
  gb_total numeric default 0, gb_used numeric default 0,
  minutes_total numeric default 0, minutes_used numeric default 0,
  status text not null default 'active', notes text,
  created_at timestamptz not null default now()
);
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  line_id uuid references public.lines(id) on delete set null,
  package_id uuid references public.packages(id) on delete set null,
  package_name text, cost_price numeric default 0, selling_price numeric default 0,
  start_date date not null default current_date,
  renewal_date date, status text not null default 'active',
  created_at timestamptz not null default now()
);
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  billing_period text, amount numeric not null default 0, amount_paid numeric not null default 0,
  status text not null default 'unpaid', due_date date,
  created_at timestamptz not null default now()
);
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete set null,
  amount numeric not null, method text not null default 'cash', reference text,
  receipt_path text, status text not null default 'pending',
  admin_notes text, verified_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  line_id uuid references public.lines(id) on delete set null,
  kind text not null,
  requested_package_id uuid references public.packages(id) on delete set null,
  details text, status text not null default 'pending', admin_response text,
  processed_at timestamptz, created_at timestamptz not null default now()
);
create table public.registration_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null, phone text not null, alt_phone text, email text,
  national_id text, governorate text, address text, segment text,
  package_id uuid references public.packages(id) on delete set null,
  status text not null default 'pending', admin_note text,
  processed_at timestamptz, created_at timestamptz not null default now()
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  title text not null, message text, is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.inventory_numbers (
  id uuid primary key default gen_random_uuid(),
  company text not null, number text not null unique, kind text not null default 'primary',
  gb_quota numeric default 0, minutes_quota numeric default 0,
  status text not null default 'available', notes text,
  created_at timestamptz not null default now()
);
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid, action text not null, entity text, entity_id uuid, details text,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.customers, public.packages, public.lines, public.subscriptions,
  public.invoices, public.payments, public.requests, public.registration_requests, public.notifications,
  public.inventory_numbers, public.activity_logs to authenticated;
grant all on public.customers, public.packages, public.lines, public.subscriptions,
  public.invoices, public.payments, public.requests, public.registration_requests, public.notifications,
  public.inventory_numbers, public.activity_logs to service_role;
grant select on public.packages to anon;
grant insert on public.registration_requests to anon;

alter table public.customers enable row level security;
alter table public.packages enable row level security;
alter table public.lines enable row level security;
alter table public.subscriptions enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.requests enable row level security;
alter table public.registration_requests enable row level security;
alter table public.notifications enable row level security;
alter table public.inventory_numbers enable row level security;
alter table public.activity_logs enable row level security;

create or replace function public.my_customer_id() returns uuid language sql stable security definer set search_path=public
as $$ select id from public.customers where user_id = auth.uid() limit 1 $$;

do $$ declare t text; begin
  foreach t in array array['customers','packages','lines','subscriptions','invoices','payments','requests','registration_requests','notifications','inventory_numbers','activity_logs'] loop
    execute format('create policy "admin all" on public.%I for all to authenticated using (public.has_role(auth.uid(),''admin'')) with check (public.has_role(auth.uid(),''admin''))', t);
  end loop;
end $$;

create policy "public packages" on public.packages for select to anon, authenticated using (status='active' and is_public);
create policy "anyone registers" on public.registration_requests for insert to anon, authenticated with check (status='pending');

create policy "me" on public.customers for select to authenticated using (user_id = auth.uid());
create policy "my lines" on public.lines for select to authenticated using (customer_id = public.my_customer_id());
create policy "my subs" on public.subscriptions for select to authenticated using (customer_id = public.my_customer_id());
create policy "my invoices" on public.invoices for select to authenticated using (customer_id = public.my_customer_id());
create policy "my payments" on public.payments for select to authenticated using (customer_id = public.my_customer_id());
create policy "submit payment" on public.payments for insert to authenticated with check (customer_id = public.my_customer_id() and status='pending');
create policy "my requests" on public.requests for select to authenticated using (customer_id = public.my_customer_id());
create policy "submit request" on public.requests for insert to authenticated with check (customer_id = public.my_customer_id() and status='pending');
create policy "my notifs" on public.notifications for select to authenticated using (customer_id = public.my_customer_id());
create policy "read notifs" on public.notifications for update to authenticated using (customer_id = public.my_customer_id());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id, full_name, email) values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  if not exists(select 1 from public.user_roles where role='admin') then
    insert into public.user_roles(user_id, role) values (new.id,'admin');
  else
    insert into public.user_roles(user_id, role) values (new.id,'customer');
  end if;
  update public.customers set user_id = new.id where user_id is null and lower(email) = lower(new.email);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.apply_payment() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.status='verified' and coalesce(old.status,'')<>'verified' and new.invoice_id is not null then
    update public.invoices set amount_paid = amount_paid + new.amount,
      status = case when amount_paid + new.amount >= amount then 'paid' else 'partial' end
      where id = new.invoice_id;
    new.verified_at := now();
  end if;
  return new;
end $$;
create trigger payments_apply before update on public.payments for each row execute function public.apply_payment();

create policy "upload receipts" on storage.objects for insert to authenticated with check (bucket_id='receipts' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "read receipts" on storage.objects for select to authenticated using (bucket_id='receipts' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(),'admin')));
