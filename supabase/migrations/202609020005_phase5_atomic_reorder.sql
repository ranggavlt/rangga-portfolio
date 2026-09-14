create or replace function public.reorder_portfolio_items(
  p_section text,
  p_ordered_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  expected_count integer;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required';
  end if;

  if p_ordered_ids is null or cardinality(p_ordered_ids) = 0 then
    raise exception 'An ordered item list is required';
  end if;

  if cardinality(p_ordered_ids) <> (select count(distinct ordered.item_id) from unnest(p_ordered_ids) as ordered(item_id)) then
    raise exception 'Ordered item IDs must be unique';
  end if;

  case p_section
    when 'experience' then
      select count(*) into expected_count from public.experiences;
      if expected_count <> cardinality(p_ordered_ids)
        or exists (select 1 from unnest(p_ordered_ids) as ordered(item_id) where not exists (select 1 from public.experiences where id = ordered.item_id)) then
        raise exception 'Experience list changed; refresh and try again';
      end if;
      update public.experiences as item
      set display_order = ordering.position::integer
      from unnest(p_ordered_ids) with ordinality as ordering(id, position)
      where item.id = ordering.id;
    when 'education' then
      select count(*) into expected_count from public.education;
      if expected_count <> cardinality(p_ordered_ids)
        or exists (select 1 from unnest(p_ordered_ids) as ordered(item_id) where not exists (select 1 from public.education where id = ordered.item_id)) then
        raise exception 'Education list changed; refresh and try again';
      end if;
      update public.education as item
      set display_order = ordering.position::integer
      from unnest(p_ordered_ids) with ordinality as ordering(id, position)
      where item.id = ordering.id;
    when 'organizations' then
      select count(*) into expected_count from public.organizations;
      if expected_count <> cardinality(p_ordered_ids)
        or exists (select 1 from unnest(p_ordered_ids) as ordered(item_id) where not exists (select 1 from public.organizations where id = ordered.item_id)) then
        raise exception 'Organization list changed; refresh and try again';
      end if;
      update public.organizations as item
      set display_order = ordering.position::integer
      from unnest(p_ordered_ids) with ordinality as ordering(id, position)
      where item.id = ordering.id;
    when 'skills' then
      select count(*) into expected_count from public.skills;
      if expected_count <> cardinality(p_ordered_ids)
        or exists (select 1 from unnest(p_ordered_ids) as ordered(item_id) where not exists (select 1 from public.skills where id = ordered.item_id)) then
        raise exception 'Skill list changed; refresh and try again';
      end if;
      update public.skills as item
      set display_order = ordering.position::integer
      from unnest(p_ordered_ids) with ordinality as ordering(id, position)
      where item.id = ordering.id;
    when 'social_links' then
      select count(*) into expected_count from public.social_links;
      if expected_count <> cardinality(p_ordered_ids)
        or exists (select 1 from unnest(p_ordered_ids) as ordered(item_id) where not exists (select 1 from public.social_links where id = ordered.item_id)) then
        raise exception 'Social-link list changed; refresh and try again';
      end if;
      update public.social_links as item
      set display_order = ordering.position::integer
      from unnest(p_ordered_ids) with ordinality as ordering(id, position)
      where item.id = ordering.id;
    else
      raise exception 'Unsupported reorder section';
  end case;
end;
$$;

revoke all on function public.reorder_portfolio_items(text, uuid[]) from public, anon;
grant execute on function public.reorder_portfolio_items(text, uuid[]) to authenticated;
