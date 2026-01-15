# 🌍 Trippier

Trippier is a complete travel planning ecosystem featuring a web dashboard, a mobile application, and a backend API.

## 🏗 Architecture

| Component    | Tech Stack                 | Port    |
| ------------ | -------------------------- | ------- |
| **Backend**  | NestJS, Prisma, PostgreSQL | `:3001` |
| **Frontend** | Next.js, React, Tailwind   | `:3000` |
| **Mobile**   | React Native               | -       |

---

## 🚀 Quick Start

### 1. Launch the Stack (DB + API + Web)

```bash
make up
```

- **Web**: [http://localhost:3000](http://localhost:3000)
- **API**: [http://localhost:3001](http://localhost:3001)

### 2. Launch Mobile (Android/iOS)

```bash
cd mobile
npm install
npm run android # or npm run ios
```

_Note: Run `adb reverse tcp:3001 tcp:3001` to connect your phone to the API._

---

## 🛠 Commands

*   `make up`: Start services.
*   `make down`: Stop services.
*   `make fclean`: Deep clean (removes DB volumes and images).

---

## 📦 Building the Android APK

You can build the production APK without installing the Android SDK on your host machine using our Docker builder.

```bash
make build-apk
```

**What this does:**
1.  Builds a Docker image containing the Android SDK and Gradle.
2.  Compiles the React Native code and Android assets.
3.  Generates a signed (or unsigned) release APK.

The generated file will be available at:
`mobile/android/app/build/outputs/apk/release/app-release.apk`

---

## 🤝 Contributing

Before you start developing, plea

se read our **[CONTRIBUTING.md](./CONTRIBUTING.md)** for:

- Coding standards & Automatic formatting.
- Git workflow.
- Troubleshooting.

---
