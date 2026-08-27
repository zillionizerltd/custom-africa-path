INSERT INTO public.user_roles (user_id, role)
VALUES ('29db57c9-6af6-407d-98ec-5f5a7233f34d', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;