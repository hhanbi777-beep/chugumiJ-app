CREATE TABLE `alarms` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`label` text,
	`time` text NOT NULL,
	`weekdays` text,
	`date` text,
	`is_enabled` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_alarms_date` ON `alarms` (`user_id`,`date`);