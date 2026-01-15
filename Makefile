.PHONY: up down fclean build-apk

# Lance l'ensemble des services (Front, Back, DB)
up:
	docker-compose up --build

# Arrête les services
down:
	docker-compose down

# Arrête les services et supprime les volumes (Base de données), les images et les orphelins
fclean:
	docker-compose down -v --rmi all --remove-orphans
	sudo rm -rf backend/dist frontend/.next

# Construit l'APK
build-apk:
	docker build -f docker/builder-apk/Dockerfile -t trippier-builder .
	docker run --rm -v $(PWD)/mobile:/app/mobile:z trippier-builder bash -c "cd android && chmod +x gradlew && ./gradlew assembleRelease"
	@echo "APK generated in mobile/android/app/build/outputs/apk/release/"
