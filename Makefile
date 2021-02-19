
build:
	docker build -t puppeteer .

all: build

test:
	docker-compose -f fpp/docker-compose.integration-tests.yml run tests