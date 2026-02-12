FROM reactnativecommunity/react-native-android:latest

WORKDIR /app/mobile

# Pre-download dependencies to cache them if possible (optional optimization)
# COPY mobile/package*.json .
# RUN bun install

CMD ["bash", "-c", "cd android && chmod +x gradlew && ./gradlew assembleRelease"]
