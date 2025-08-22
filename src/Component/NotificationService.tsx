// src/services/NotificationService.js
import notifee, {
  TimestampTrigger,
  TriggerType,
  RepeatFrequency,
} from '@notifee/react-native';

class NotificationService {
  // Request permissions (required for iOS)
  async requestPermissions() {
    await notifee.requestPermission();
  }

  // Create a channel (required for Android)
  async createChannel() {
    const channelId = await notifee.createChannel({
      id: 'water-reminders',
      name: 'Water Reminders',
      sound: 'default',
      vibration: true,
    });
    return channelId;
  }

  // Schedule a repeating hourly notification
  async scheduleHourlyNotification() {
    try {
      await this.requestPermissions();
      const channelId = await this.createChannel();

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
      // Change it to this for testing:
timestamp: Date.now() + 5 * 1000, // Fire in 15 seconds
        repeatFrequency: RepeatFrequency.HOURLY,
      };

      await notifee.createTriggerNotification(
        {
          id: 'hourly-water-reminder',
          title: 'Stay Hydrated! 💧',
          body: "It's time for a glass of water.",
          android: {
            channelId,
            pressAction: { id: 'default' }, // Opens the app
          },
          ios: { sound: 'default' },
        },
        trigger
      );
      console.log('Hourly reminder scheduled successfully.');
      return true;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return false;
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    await notifee.cancelAllNotifications();
    console.log('All scheduled notifications have been cancelled.');
  }
}

export default new NotificationService();