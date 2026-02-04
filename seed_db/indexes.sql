CREATE UNIQUE INDEX IF NOT EXISTS idx_user_refresh_tokens_token
ON user_refresh_tokens(token);

CREATE INDEX IF NOT EXISTS idx_user_refresh_tokens_user_id
ON user_refresh_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_users_role_id
ON users(role_id);

CREATE INDEX IF NOT EXISTS idx_users_name
ON users(name);

CREATE INDEX IF NOT EXISTS idx_notices_status
ON notices(status);

CREATE INDEX IF NOT EXISTS idx_notices_author_id
ON notices(author_id);

CREATE INDEX IF NOT EXISTS idx_permissions_role_id
ON permissions(role_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_class_section_roll
ON user_profiles(class_name, section_name, roll);

CREATE INDEX IF NOT EXISTS idx_user_leaves_user_id
ON user_leaves(user_id);

CREATE INDEX IF NOT EXISTS idx_user_leaves_status
ON user_leaves(status);

CREATE INDEX IF NOT EXISTS idx_user_leaves_leave_policy_id
ON user_leaves(leave_policy_id);
