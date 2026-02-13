FROM reactnativecommunity/react-native-android:latest

WORKDIR /app

# Copy mobile package files
COPY mobile/package.json mobile/package-lock.json* ./mobile/

# Install dependencies with npm for guaranteed compatibility with React Native auto-linking
WORKDIR /app/mobile
RUN npm ci || npm install

# Copy source code
COPY mobile/ .

# Ensure .env is present
COPY .env /app/mobile/.env
COPY .env /app/.env

# Clean Gradle
RUN cd android && ./gradlew clean

CMD ["bash", "-c", "cd android && ./gradlew assembleRelease --no-daemon"]
