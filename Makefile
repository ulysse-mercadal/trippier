up:
	docker-compose up --build

down:
	docker-compose down

fclean:
	docker-compose down -v --rmi all --remove-orphans
	sudo rm -rf backend/dist frontend/.next

build-apk:
	docker build -f docker/builder-apk/Dockerfile -t trippier-builder .
	docker run --rm -v $(PWD)/mobile/android/app/build/outputs:/app/mobile/android/app/build/outputs:z trippier-builder
	@echo "APK generated in mobile/android/app/build/outputs/apk/debug/"

lint:
	cd backend && bunx eslint "{src,apps,libs,test}/**/*.ts"
	cd frontend && bun run lint
	cd mobile && bun run lint

fix-lint:
	cd backend && bun run lint
	cd frontend && bun run lint -- --fix
	cd mobile && bun run lint -- --fix

test: lint
	cd backend && bun run test:e2e:all

.PHONY: up down fclean build-apk lint fix-lint test