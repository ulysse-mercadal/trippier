up:
	docker-compose up --build

down:
	docker-compose down

fclean:
	docker-compose down -v --rmi all --remove-orphans
	sudo rm -rf backend/dist frontend/.next

build-apk:
	docker build -f docker/builder-apk/Dockerfile -t trippier-builder .
	docker run --rm -v $(PWD)/mobile:/app/mobile:z trippier-builder bash -c "cd android && chmod +x gradlew && ./gradlew assembleRelease"
	@echo "APK generated in mobile/android/app/build/outputs/apk/release/"

lint:
	cd backend && npx eslint "{src,apps,libs,test}/**/*.ts"
	cd frontend && npm run lint
	cd mobile && npm run lint

fix-lint:
	cd backend && npm run lint
	cd frontend && npm run lint -- --fix
	cd mobile && npm run lint -- --fix

.PHONY: up down fclean build-apk lint fix-lint