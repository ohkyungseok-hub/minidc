update public.users
set role = 'admin'
where nickname = 'YOUR_NICKNAME_HERE';

select id, nickname, role
from public.users
where nickname = 'YOUR_NICKNAME_HERE';
