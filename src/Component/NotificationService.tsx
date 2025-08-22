// src/services/NotificationService.js
import notifee, {
  TimestampTrigger,
  TriggerType,
  RepeatFrequency,
  AndroidStyle,
} from '@notifee/react-native';

class NotificationService {
  // Request permissions (required for iOS & Android 13+)
  async requestPermissions() {
    const settings = await notifee.requestPermission();

    if (settings.authorizationStatus >= 1) {
      console.log('✅ Notification permission granted.');
      return true;
    } else {
      console.warn('❌ Notification permission denied.');
      return false;
    }
  }

  // Create a channel (required for Android)
  async createChannel() {
    const channelId = await notifee.createChannel({
      id: 'water-reminders',
      name: 'Water Reminders',
      sound: 'default',
      vibration: true,
      importance: 4, // HIGH priority
    });
    return channelId;
  }

  // Schedule a repeating hourly notification
  async scheduleHourlyNotification() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return false;

      const channelId = await this.createChannel();

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
              timestamp: Date.now() + 60 * 60 * 1000, 
        repeatFrequency: RepeatFrequency.HOURLY,
      };

      await notifee.createTriggerNotification(
        {
          id: 'hourly-water-reminder',
          title: '💧 Time to Hydrate!',
          body: "Your body needs water. Drink a glass now 🚰",
          android: {
            channelId,
            color: '#3182CE',
            smallIcon: 'ic_launcher', // use your app icon
            largeIcon: 'https://cdn-icons-png.flaticon.com/512/2965/2965567.png',
            pressAction: { id: 'default' }, // Opens the app
            style: {
              type: AndroidStyle.BIGPICTURE,
              picture: 'https://images.unsplash.com/photo-1526401485004-2fda9f6d54c8?auto=format&fit=crop&w=800&q=80',
            },
            actions: [
              {
                title: '✅ Drank',
                pressAction: { id: 'drink' },
              },
              {
                title: '⏰ Remind me later',
                pressAction: { id: 'remind_later' },
              },
            ],
          },
          ios: {
            sound: 'default',
            foregroundPresentationOptions: {
              alert: true,
              badge: true,
              sound: true,
            },
          },
        },
        trigger
      );

      console.log('✅ Hourly reminder scheduled with enhanced UI.');
      return true;
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
      return false;
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    await notifee.cancelAllNotifications();
    console.log('🛑 All scheduled notifications have been cancelled.');
  }
}

export default new NotificationService();