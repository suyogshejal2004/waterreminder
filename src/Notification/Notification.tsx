// NotificationService.js
import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

// A list of friendly, varied messages for the notifications
const notificationMessages = [
    "💧 Time for a water break! Your body will thank you.",
    "Hey! A quick glass of water will boost your energy. ✨",
    "Just a friendly reminder to stay hydrated. Cheers! 💧",
    "Feeling sluggish? Water can help! Have a sip.",
    "Keep up the great work! It's time for some H2O.",
    "Don't forget to drink water and shine on! 🌟",
    "A sip of water is a sip of wellness. Stay hydrated!",
];

class NotificationService {
    constructor() {
        this.configure();
    }

    // --- 1. INITIAL CONFIGURATION ---
    configure = () => {
        PushNotification.configure({
            onRegister: function (token) {
                console.log("NOTIFICATION TOKEN:", token);
            },
            onNotification: function (notification) {
                console.log("NOTIFICATION:", notification);
                // This is where you can handle what happens when a user taps a notification
            },
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },
            popInitialNotification: true,
            requestPermissions: Platform.OS === 'ios',
        });

        // --- 2. CREATE ANDROID CHANNEL ---
        // This is required for Android 8.0+
        PushNotification.createChannel(
            {
                channelId: "water-reminder-channel", // Must be the same as in build.gradle
                channelName: "Water Reminders",
                channelDescription: "A channel for hydration reminders",
                playSound: true,
                soundName: "default",
                importance: 4, // High importance
                vibrate: true,
            },
            (created) => console.log(`createChannel returned '${created}'`)
        );
    };

    // --- 3. THE MAIN SCHEDULING LOGIC ---
    scheduleDailyNotifications = (wakeUpTime, sleepTime) => {
        console.log(`Scheduling notifications between ${wakeUpTime.toLocaleTimeString()} and ${sleepTime.toLocaleTimeString()}`);

        // **First, cancel all previously scheduled notifications**
        // This is crucial to prevent duplicate notifications if the user changes their schedule
        PushNotification.cancelAllLocalNotifications();
        console.log("Cancelled all previous notifications.");

        const now = new Date();
        const wakeUp = new Date(wakeUpTime);
        const sleep = new Date(sleepTime);

        // Calculate the total waking hours
        const wakingMilliseconds = sleep.getTime() - wakeUp.getTime();
        if (wakingMilliseconds <= 0) {
            console.error("Sleep time must be after wake-up time.");
            return;
        }

        // --- Logic to schedule notifications every 1.5 hours ---
        const interval = 90 * 60 * 1000; // 90 minutes in milliseconds
        let notificationCount = 0;

        for (let t = wakeUp.getTime(); t < sleep.getTime(); t += interval) {
            const notificationTime = new Date(t);

            // Only schedule notifications that are in the future
            if (notificationTime > now) {
                // Get a random message from our list
                const message = notificationMessages[Math.floor(Math.random() * notificationMessages.length)];

                PushNotification.localNotificationSchedule({
                    channelId: "water-reminder-channel",
                    id: notificationCount, // A unique ID for each notification
                    title: "Hydration Reminder!",
                    message: message,
                    date: notificationTime,
                    allowWhileIdle: true, // Allow notification to fire in doze mode on Android
                    repeatType: 'day', // Repeat this notification at the same time every day
                });
                notificationCount++;
            }
        }
        console.log(`✅ Scheduled ${notificationCount} notifications for today.`);
    };
}

// Export a single instance of the class
export default new NotificationService();
