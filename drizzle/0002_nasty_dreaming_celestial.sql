CREATE TABLE `usage_events` (
	`id` text PRIMARY KEY NOT NULL,
	`guild_id` text NOT NULL,
	`thread_id` text NOT NULL,
	`user_id` text NOT NULL,
	`model_id` text NOT NULL,
	`purpose` text NOT NULL,
	`input_tokens` integer DEFAULT 0 NOT NULL,
	`cached_input_tokens` integer DEFAULT 0 NOT NULL,
	`output_tokens` integer DEFAULT 0 NOT NULL,
	`reasoning_tokens` integer DEFAULT 0 NOT NULL,
	`cost_usd` real,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `usage_guild_user_created_idx` ON `usage_events` (`guild_id`,`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `usage_guild_created_idx` ON `usage_events` (`guild_id`,`created_at`);