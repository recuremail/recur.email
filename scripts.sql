
-- check potential spam ips
select count(*) from subscribers where honeypot_last_checked_at is not null and honeypot_is_found is not false;


-- check potential spam ips by status
select status, count(*) from subscribers where honeypot_last_checked_at is null group by 1;