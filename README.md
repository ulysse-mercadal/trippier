# 🌍 Trippier

Trippier is a complete travel planning ecosystem featuring a webapp, a mobile application, and a backend API.

## 🏗 Architecture

| Component    | Tech Stack                 | Port    |
| ------------ | -------------------------- | ------- |
| **Backend**  | NestJS, Prisma, PostgreSQL | `:3001` |
| **Frontend** | Next.js, React, Tailwind   | `:3000` |
| **Mobile**   | React Native               | -       |

---

## 🚀 Quick Start

### 1. Configuration

Copy the `.env.example` file to `.env` and fill in the values:

```bash
cp .env.example .env
```

You will need:
- **MapTiler API Key**: For map rendering ([maptiler.com](https://www.maptiler.com/))
- **GeoNames Username**: For point of interest discovery ([geonames.org](https://www.geonames.org/))

Add these to your `.env` file:
`MAPTILER_API_KEY=your_key_here`
`GEONAMES_USERNAME=your_username_here`

### 2. Launch the Stack (DB + API + Web)

```bash
make up
```

- **Web**: [http://localhost:3000](http://localhost:3000)
- **API**: [http://localhost:3001](http://localhost:3001)

### 2. Launch Mobile (Android/iOS)

```bash
cd mobile
npm install
npm start
```

_Note: Run `adb reverse tcp:3001 tcp:3001` to connect your phone to the API._

---

## 🛠 Commands

- `make up`: Start services.
- `make down`: Stop services.
- `make fclean`: Deep clean (removes DB volumes and images).

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



Before you start developing, please read our **[CONTRIBUTING.md](./CONTRIBUTING.md)** for:



- **Coding standards & Mandatory headers** (enforced across Mobile, API, and Web).

- Automatic formatting.

- Git workflow.

- Troubleshooting.

---
