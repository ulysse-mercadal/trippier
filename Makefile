################################################################################
# Trippier — build & dev tooling
#
# Run `make` (or `make help`) for the full list of targets.
# Swap the container engine anywhere with `ENGINE=podman`.
# Set NO_COLOR=1 to disable coloured help output.
################################################################################

ENGINE   ?= docker
COMPOSE  := $(ENGINE) compose

REGISTRY ?= ghcr.io
OWNER    ?= ulysse-mercadal
TAG      ?= latest

BACKEND_IMAGE  = $(REGISTRY)/$(OWNER)/trippier-backend:$(TAG)
FRONTEND_IMAGE = $(REGISTRY)/$(OWNER)/trippier-frontend:$(TAG)

# Scope `make logs` to one service: make logs SERVICE=backend
SERVICE ?=

ifndef NO_COLOR
BLUE := \033[1;34m
CYAN := \033[1;36m
BOLD := \033[1m
DIM  := \033[2m
RST  := \033[0m
endif

.PHONY: help setup doctor \
	dev dev-stop logs up stop \
	build push \
	prod-pull prod-up prod-stop \
	build-apk \
	lint fix-lint test \
	clean fclean

.DEFAULT_GOAL := help

#################################### Setup #####################################

setup:
	@if [ -f .env ]; then echo ".env already exists, nothing to do."; else \
		cp .env.example .env; \
		jwt=$$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n'); \
		pw=$$(openssl rand -hex 16 2>/dev/null || head -c 16 /dev/urandom | od -An -tx1 | tr -d ' \n'); \
		sed "s/your_jwt_secret/$$jwt/; s/your_password/$$pw/" .env > .env.tmp && mv .env.tmp .env; \
		echo "Created .env with a generated JWT_SECRET + POSTGRES_PASSWORD. Fill in the MapTiler / GeoNames keys."; \
	fi

doctor:
	@printf "$(BLUE)Trippier doctor$(RST)\n"
	@command -v $(ENGINE) >/dev/null 2>&1 \
		&& printf "  [ok] $(ENGINE): %s\n" "$$($(ENGINE) --version | head -1)" \
		|| printf "  [!!] $(ENGINE) not found\n"
	@$(COMPOSE) version >/dev/null 2>&1 \
		&& printf "  [ok] '$(ENGINE) compose' available\n" \
		|| printf "  [!!] '$(ENGINE) compose' not available\n"
	@[ -f .env ] && printf "  [ok] .env present\n" || printf "  [!!] .env missing — run 'make setup'\n"
	@$(COMPOSE) config -q >/dev/null 2>&1 \
		&& printf "  [ok] compose files are valid\n" \
		|| printf "  [!!] compose files have errors\n"

################################# Development ##################################

dev:
	$(COMPOSE) up --build

dev-stop:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f $(SERVICE)

up:
	$(COMPOSE) -f docker-compose.yaml up -d --build

stop:
	$(COMPOSE) -f docker-compose.yaml down

############################ Build & publish images ############################

build:
	$(ENGINE) build -t $(BACKEND_IMAGE)  ./backend
	$(ENGINE) build -t $(FRONTEND_IMAGE) ./frontend

push: build
	$(ENGINE) push $(BACKEND_IMAGE)
	$(ENGINE) push $(FRONTEND_IMAGE)

################## Production (pulls SHA-pinned images from GHCR) ###############

prod-pull:
	$(COMPOSE) -f docker-compose.prod.yaml pull

prod-up:
	$(COMPOSE) -f docker-compose.prod.yaml up -d

prod-stop:
	$(COMPOSE) -f docker-compose.prod.yaml down

############################ Mobile (Android APK) ##############################

build-apk:
	$(ENGINE) build -f docker/builder-apk/Dockerfile -t trippier-builder .
	$(ENGINE) run --rm -v $(PWD)/mobile/android/app/build/outputs:/app/mobile/android/app/build/outputs:z trippier-builder
	@echo "APK generated in mobile/android/app/build/outputs/apk/debug/"

################################## Lint & test #################################

lint:
	cd backend  && { [ -d node_modules ] || bun install --frozen-lockfile; } && bunx eslint "{src,apps,libs,test}/**/*.ts"
	cd frontend && { [ -d node_modules ] || bun install --frozen-lockfile; } && bun run lint
	cd mobile   && { [ -d node_modules ] || bun install --frozen-lockfile; } && bun run lint

fix-lint:
	cd backend  && { [ -d node_modules ] || bun install --frozen-lockfile; } && bun run lint
	cd frontend && { [ -d node_modules ] || bun install --frozen-lockfile; } && bun run lint -- --fix
	cd mobile   && { [ -d node_modules ] || bun install --frozen-lockfile; } && bun run lint -- --fix

test: lint
	cd backend && bun run test:e2e:all

#################################### Cleanup ###################################

clean:
	$(COMPOSE) down -v --remove-orphans

fclean: clean
	-$(ENGINE) system prune -f
	rm -rf backend/dist frontend/.next

##################################### Help #####################################

help:
	@printf "$(BLUE)Trippier$(RST) — travel app monorepo\n\n"
	@printf "$(BOLD)Usage:$(RST) make $(CYAN)<target>$(RST)  [ENGINE=podman] [OWNER=… TAG=…]\n"
	@printf "\n$(BOLD)Development$(RST)\n"
	@printf "  $(CYAN)setup$(RST)        Create .env from .env.example (generates secrets)\n"
	@printf "  $(CYAN)doctor$(RST)       Check the machine is ready to run the stack\n"
	@printf "  $(CYAN)dev$(RST)          Start the full stack with hot reload (Ctrl-C to stop)\n"
	@printf "  $(CYAN)dev-stop$(RST)     Stop the dev stack\n"
	@printf "  $(CYAN)logs$(RST)         Follow logs — make logs SERVICE=backend\n"
	@printf "  $(CYAN)up$(RST) / $(CYAN)stop$(RST)     Plain stack on published ports, no hot reload\n"
	@printf "\n$(BOLD)Images & production$(RST)\n"
	@printf "  $(CYAN)build$(RST) / $(CYAN)push$(RST)       Build / publish backend + frontend images\n"
	@printf "  $(CYAN)prod-pull$(RST)          Pull the SHA-pinned production images\n"
	@printf "  $(CYAN)prod-up$(RST) / $(CYAN)prod-stop$(RST)  Start / stop the production stack\n"
	@printf "\n$(BOLD)Mobile & quality$(RST)\n"
	@printf "  $(CYAN)build-apk$(RST)    Build the Android debug APK\n"
	@printf "  $(CYAN)lint$(RST) / $(CYAN)fix-lint$(RST)   Lint all services (backend + frontend + mobile)\n"
	@printf "  $(CYAN)test$(RST)         Lint, then run the backend Postman e2e suite\n"
	@printf "  $(CYAN)clean$(RST) / $(CYAN)fclean$(RST)     Tear down with volumes / deep clean\n"
	@printf "\n$(DIM)Swap the engine with ENGINE=podman. Override images with OWNER= TAG=.$(RST)\n"
