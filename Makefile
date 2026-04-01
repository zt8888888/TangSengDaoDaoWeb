build:
	docker build -f Dockerfile.prebuilt -t tangsengdaodaoweb .
deploy:
	npx turbo run build --filter=@tsdaodao/web --force
	docker build --no-cache -f Dockerfile.prebuilt -t tangsengdaodaoweb . --platform linux/amd64
	docker tag tangsengdaodaoweb ccr.ccs.tencentyun.com/my.personal.space/tangsengdaodaoweb:latest
	docker push ccr.ccs.tencentyun.com/my.personal.space/tangsengdaodaoweb:latest