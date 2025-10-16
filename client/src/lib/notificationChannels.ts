import type {
	CommandNotificationType,
	ConfigErrorNotificationType,
	DebugNotificationType,
	ErrorNotificationType,
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
export const debugNotification = new NotificationType<DebugNotificationType>(
	NotificationChannel.DEBUG
);

export const configErrorNotification =
	new NotificationType<ConfigErrorNotificationType>(
		NotificationChannel.CONFIG_ERROR
	);
