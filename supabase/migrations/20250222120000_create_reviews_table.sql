create table if not exists reviews (
  id serial primary key,
  user_id uuid references auth.users(id) on delete set null,
  rating integer not null,
  comment text,
  source varchar(50) default 'web',
  status varchar(20) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table reviews enable row level security;

-- Policies
create policy "Public reviews are viewable by everyone." on reviews for select using (status = 'approved');
create policy "Users can create reviews." on reviews for insert with check (auth.uid() = user_id);
create policy "Users can view their own reviews" on reviews for select using (auth.uid() = user_id);

-- Admin policy commented out until a robust admin role system is confirmed
-- create policy "Admins can view all reviews" on reviews for select ...
