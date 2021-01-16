FROM node:12.20.1-stretch-slim@sha256:4a5d117b8460a2abc714cc64d9d5d9ec360c1115028aa62dbb1ffcc573a8e654

ARG privateKeys

ENV privateKeys=${privateKeys}

WORKDIR /app

COPY ./package*.json ./

RUN npm ci --only=production

COPY . .

ENTRYPOINT ["npm"]
CMD ["run", "start"]