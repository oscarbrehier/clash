CREATE TABLE `message_images` (
	`id` text PRIMARY KEY NOT NULL,
	`message_id` text NOT NULL,
	`position` integer NOT NULL,
	`media_type` text NOT NULL,
	`data` blob NOT NULL,
	FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `message_images_message_idx` ON `message_images` (`message_id`,`position`);