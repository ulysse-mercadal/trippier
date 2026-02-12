FROM reactnativecommunity/react-native-android:latest

WORKDIR /app

# Install Bun
RUN npm install -g bun

# Copy mobile project files
COPY mobile/package.json mobile/bun.lock ./mobile/

# Install dependencies using Bun
RUN cd mobile && bun install --frozen-lockfile --hoist

# Copy the rest of the mobile code
COPY mobile/ ./mobile/

WORKDIR /app/mobile

CMD ["bash", "-c", "cd android && chmod +x gradlew && ./gradlew assembleRelease"]
