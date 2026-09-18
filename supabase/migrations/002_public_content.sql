alter table settings add column if not exists hero_support text not null default 'Des quiz bibliques vivants, une progression à ton rythme et une communauté qui avance avec toi.';
alter table settings add column if not exists intro_title text not null default 'La Bible, en mode défi.';
alter table settings add column if not exists intro_text text not null default 'Chaque question est une occasion de comprendre, de retenir et d’aller un peu plus loin.';
alter table settings add column if not exists challenge_title text not null default 'Prêt à tester ce que tu sais déjà ?';
alter table settings add column if not exists challenge_text text not null default 'Un quiz public ouvert à tous. Pas besoin d’être expert : viens apprendre en jouant.';
alter table settings add column if not exists signoff text not null default 'Verdoxa — la connaissance qui prend vie.';
