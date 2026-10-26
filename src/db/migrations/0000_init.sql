CREATE TABLE `calendars` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_default` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `event_exceptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`event_id` text NOT NULL,
	`original_start` text NOT NULL,
	`is_cancelled` integer DEFAULT false NOT NULL,
	`title` text,
	`start_at` text,
	`end_at` text,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_event_exceptions_original` ON `event_exceptions` (`event_id`,`original_start`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`calendar_id` text NOT NULL,
	`title` text NOT NULL,
	`note` text,
	`location` text,
	`is_all_day` integer DEFAULT false NOT NULL,
	`start_at` text,
	`end_at` text,
	`start_date` text,
	`end_date` text,
	`timezone` text NOT NULL,
	`rrule` text,
	`repeat_until` text,
	FOREIGN KEY (`calendar_id`) REFERENCES `calendars`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_events_range` ON `events` (`user_id`,`start_at`,`end_at`);--> statement-breakpoint
CREATE INDEX `idx_events_allday` ON `events` (`user_id`,`start_date`);--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`event_id` text,
	`task_id` text,
	`offset_minutes` integer NOT NULL,
	`notification_id` text,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sync_outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`op` text NOT NULL,
	`payload` text NOT NULL,
	`occurred_at` text NOT NULL,
	`synced_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_outbox_pending` ON `sync_outbox` (`synced_at`,`occurred_at`);--> statement-breakpoint
CREATE TABLE `task_lists` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`name` text NOT NULL,
	`color` text,
	`icon` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_inbox` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`list_id` text NOT NULL,
	`parent_task_id` text,
	`title` text NOT NULL,
	`note` text,
	`due_date` text,
	`due_time` text,
	`priority` integer DEFAULT 0 NOT NULL,
	`completed_at` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`rrule` text,
	FOREIGN KEY (`list_id`) REFERENCES `task_lists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parent_task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_tasks_due` ON `tasks` (`user_id`,`due_date`,`completed_at`);--> statement-breakpoint
CREATE INDEX `idx_tasks_list` ON `tasks` (`list_id`,`sort_order`);