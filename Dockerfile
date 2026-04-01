FROM docker.m.daocloud.io/library/node:20.9.0 AS builder
WORKDIR /app
# RUN curl -o- -L https://yarnpkg.com/install.sh | bash
RUN yarn config set registry https://registry.npmmirror.com -g
# RUN npm config set registry https://registry.npm.taobao.org
COPY . .
RUN rm -rf apps/web/build && yarn install && npx turbo run build --filter=@tsdaodao/web --force

FROM docker.m.daocloud.io/library/nginx:latest
COPY --from=builder /app/docker-entrypoint.sh /docker-entrypoint2.sh 
RUN sed -i 's/\r$//' /docker-entrypoint2.sh
COPY --from=builder /app/nginx.conf.template /
COPY --from=builder /app/apps/web/build /usr/share/nginx/html
ENTRYPOINT ["sh", "/docker-entrypoint2.sh"]
CMD ["nginx","-g","daemon off;"]