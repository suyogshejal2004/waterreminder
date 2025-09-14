# 💧 AquaAlert – Stay Hydrated, Stay Healthy 🚀  

AquaAlert is a mobile app built with **React Native** that helps users track daily water intake, stay hydrated, and build healthy habits.  
This is my **first Play Store app** and a step forward in my mobile development journey.  

---

## 📱 Features  

- ✨ **Splash Screen** with animations, sound, and smooth transitions  
- 🎬 **Onboarding Screens** with Lottie animations & intro slider  
- 🔑 **Firebase Authentication** (Login/Signup)  
- 📊 **Firestore integration** for storing user details  
- 🔔 **Smart reminders** to drink water  
- 📈 Track hydration goals & progress  

---

## 🛠️ Tech Stack  

- **React Native**  
- **Lottie** (for animations)  
- **React Native Sound** (for audio)  
- **LinearGradient** (for gradients)  
- **Firebase Auth & Firestore**  
- **AppIntroSlider**  

---

## 🎥 Demo Video  

👉 Watch the full walkthrough on YouTube: [Click Here](YOUR_YOUTUBE_LINK)  

---

## 📸 Screenshots  

<p align="center">
 <img width="300" alt="Image" src="https://github.com/user-attachments/assets/bc45f8b9-52e6-457c-84d5-9b05b10b4fcd" />
 <img width="300" alt="Image" src="https://github.com/user-attachments/assets/929ed9f2-976d-486b-a5b4-dfd9f87b281e" />
 <img width="300" alt="Image" src="https://github.com/user-attachments/assets/98c1e9fe-61e8-4ad1-957f-8678008d02e8" />
 <img width="300" alt="Image" src="https://github.com/user-attachments/assets/cec7b83b-7b30-41db-b6a5-c2131b368d47" />
 <img width="300" alt="Image" src="https://github.com/user-attachments/assets/2830b938-2a26-4343-a575-cc669ba585e5" />
 <img width="300" alt="Image" src="https://github.com/user-attachments/assets/03d9ac30-b675-4196-bc2e-8fe156e06a53" />
 <img width="300" alt="Image" src="https://github.com/user-attachments/assets/d2def51c-6fae-463d-b3d2-5fc7a84a5bc5" />
 <img width="300" alt="Image" src="https://github.com/user-attachments/assets/7fd49ed5-9930-443a-a083-6c813afc143a" />
 <img width="300" alt="Image" src="https://github.com/user-attachments/assets/122af4d6-fcd0-4022-b0bd-4687afba7065" />
 <img width="300" alt="Image" src="https://github.com/user-attachments/assets/33a7f2ca-706a-4b08-a2aa-72d62cb19707" />
 <img width="300" alt="Image" src="https://github.com/user-attachments/assets/85bdd688-5fc5-4053-94e9-17f02b4af545" />
 <img width="300" alt="Image" src="https://github.com/user-attachments/assets/5b08bf16-7555-4896-a2d2-c5273e517fea" />
 <img width="300" alt="Image" src="https://github.com/user-attachments/assets/be1b9390-bfd0-4e92-917a-8a6b11750f44" />
 <img width="300" alt="Image" src="https://github.com/user-attachments/assets/ffa691f4-e5fe-4dfd-9017-a8a763fe1533" />
 <img width="300" alt="Image" src="https://github.com/user-attachments/assets/254f2d03-5d93-45e0-b546-3d7795a22604" />
 <img width="300" alt="Image" src="https://github.com/user-attachments/assets/f5dbfea5-652e-4928-a08c-1d7badd225b1" />
 <img width="300" alt="Image" src="https://github.com/user-attachments/assets/a5a4da51-36f0-4372-8ee4-551e07277017" />
 <img width="300" alt="Image" src="https://github.com/user-attachments/assets/251d926b-2748-4f04-bab5-8b1d2483ac02" />
 <img width="300" alt="Image" src="https://github.com/user-attachments/assets/b5bb02e1-92a5-4b28-93db-63444f42124a" />
 <img width="300" alt="Image" src="https://github.com/user-attachments/assets/3a54901d-b63a-4e1e-b680-70af97e36cfb" />
</p>



---

## 🎯 What I Learned  

- Creating smooth **Splash Screens** with animations + sound  
- Implementing **multi-step onboarding flows**  
- Using **Firebase** for authentication & user data  
- Combining **UI/UX with animations** for a modern experience  
- Structuring a React Native project for scalability  

---

## 🚀 Roadmap  

- [x] Splash Screen  
- [x] Onboarding Screens  
- [x] Login & Registration  
- [x] Home Dashboard  
- [x] Notifications & Reminders  
- [x] Play Store Release  

---
## 🔔 Notification System

I integrated a **real-time notification system** into AquaAlert using:

- **Firebase Functions** → for serverless backend logic  
- **Firebase Cloud Messaging (FCM)** → for push notifications  

📩 Now users will get **instant alerts** for reminders & water goals!

### 🔧 How it Works
1. **Firestore Trigger** → When a new reminder is added, Firebase Function runs.  
2. **Cloud Function** → Sends a push notification via **FCM**.  
3. **React Native App** → Receives & displays the notification (foreground/background).  

### 🚀 Tech Stack
- Firebase Functions  
- Firebase Admin SDK  
- Firebase Cloud Messaging (FCM)  
- React Native Firebase  

### 📜 Sample Function Code
```js
exports.sendReminderNotification = functions.firestore
    .document("reminders/{reminderId}")
    .onCreate(async (snapshot, context) => {
        const reminder = snapshot.data();
        const payload = {
            notification: {
                title: "💧 AquaAlert Reminder",
                body: `Time to drink water! ${reminder.message || ""}`,
                sound: "default",
            },
        };
        await admin.messaging().sendToDevice(reminder.fcmToken, payload);
    });
---
## 🙌 Contributing  

This is my learning project. Suggestions, ideas, or improvements are always welcome!  

---

## 📬 Contact  

👤 **Suyog Shejal**  
- LinkedIn: [www.linkedin.com/in/suyog-shejal-8637a3316](https://www.linkedin.com/in/suyog-shejal-8637a3316)  
- Email: suyogshejal2004@gmail.com  

---
