import type {
	CommandNotificationType,
	ErrorNotificationType,
	LogNotificationType,
	PHPStanProNotificationType,
	ProcessNotificationType,
	StatusBarNotificationType,
	WatcherNotificationType,
} from '../../../shared/notificationChannels';
import { NotificationChannel } from '../../../shared/notificationChannels';
import { NotificationType } from 'vscode-languageclient';

export const watcherNotification =
	new NotificationType<WatcherNotificationType>(NotificationChannel.WATCHER);

export const commandNotification =
	new NotificationType<CommandNotificationType>(NotificationChannel.COMMAND);

export const logNotification = new NotificationType<LogNotificationType>(
	NotificationChannel.LOG
);

export const statusBarNotification =
	new NotificationType<StatusBarNotificationType>(
		NotificationChannel.STATUS_BAR
	);

export const errorNotification = new NotificationType<ErrorNotificationType>(
	NotificationChannel.ERROR
);

export const processNotification =
	new NotificationType<ProcessNotificationType>(NotificationChannel.SPAWNER);

export const phpstanProNotification =
	new NotificationType<PHPStanProNotificationType>(
		NotificationChannel.PHPSTAN_PRO
	);
