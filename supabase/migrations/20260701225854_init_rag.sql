-- Enable pgvector extension
create extension if not exists vector;

-- Create documents table
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on documents
alter table public.documents enable row level security;

-- Policies for documents (allow anyone to read, authenticated users or anon depending on your policy; for this portfolio, allow read/write access)
create policy "Allow public read" on public.documents for select using (true);
create policy "Allow public insert" on public.documents for insert with check (true);
create policy "Allow public delete" on public.documents for delete using (true);

-- Create document_chunks table
create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents(id) on delete cascade not null,
  content text not null,
  page_number integer not null,
  is_table boolean default false not null,
  embedding vector(4096) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on document_chunks
alter table public.document_chunks enable row level security;

-- Policies for document_chunks
create policy "Allow public read chunks" on public.document_chunks for select using (true);
create policy "Allow public insert chunks" on public.document_chunks for insert with check (true);
create policy "Allow public delete chunks" on public.document_chunks for delete using (true);

-- No HNSW index since pgvector has a 2000 dimension limit for HNSW, and flat exact search is perfect for portfolio scale datasets

-- Create similarity search function
create or replace function public.match_chunks (
  query_embedding vector(4096),
  match_threshold float,
  match_count int,
  filter_document_id uuid default null
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  page_number int,
  is_table boolean,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    dc.id,
    dc.document_id,
    dc.content,
    dc.page_number,
    dc.is_table,
    1 - (dc.embedding <=> query_embedding) as similarity
  from public.document_chunks dc
  where 
    (filter_document_id is null or dc.document_id = filter_document_id)
    and 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding asc
  limit match_count;
end;
$$;
