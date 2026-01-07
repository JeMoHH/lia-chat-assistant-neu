import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  } as any),
});

export async function initializeNotifications(): Promise<void> {
  try {
    if (Platform.OS === "web") {
      // Web push notifications would require service worker setup
      console.log("Push notifications not available on web");
      return;
    }

    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== "granted") {
      console.log("Notification permissions not granted");
      return;
    }

    // Get push token
    const token = await Notifications.getExpoPushTokenAsync();
    console.log("Push token:", token.data);

    // For Android, create notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("image-generation", {
        name: "Image Generation",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF006E",
      });
    }
  } catch (error) {
    console.error("Notification initialization error:", error);
  }
}

export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: "default",
        badge: 1,
      },
      trigger: {
        type: "time" as any,
        seconds: 1,
      },
    });
  } catch (error) {
    console.error("Send notification error:", error);
  }
}

export async function sendImageGenerationNotification(
  prompt: string,
  imageUrl: string
): Promise<void> {
  const title = "✨ Image Generated!";
  const body = `Your "${prompt.substring(0, 30)}..." image is ready!`;

  await sendLocalNotification(title, body, {
    type: "image-generated",
    imageUrl,
    prompt,
  });
}

export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void
): () => void {
  // Listen for notifications when app is in foreground
  const foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
    if (onNotificationReceived) {
      onNotificationReceived(notification);
    }
  });

  // Listen for notification taps
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    if (onNotificationResponse) {
      onNotificationResponse(response);
    }
  });

  // Return cleanup function
  return () => {
    foregroundSubscription.remove();
    responseSubscription.remove();
  };
}

export async function dismissAllNotifications(): Promise<void> {
  try {
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.error("Dismiss notifications error:", error);
  }
}
