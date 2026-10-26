# 개발용 컨테이너: Expo 개발 서버(Metro)를 띄운다.
# 앱 빌드(.ipa/.apk)는 EAS 클라우드에서 하므로 여기에는 Xcode/Android SDK가 없다.
FROM node:22-bookworm-slim

ENV EXPO_NO_TELEMETRY=1 \
    NODE_ENV=development

WORKDIR /app
RUN chown node:node /app

# root가 아닌 node 사용자로 실행
USER node

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY --chown=node:node . .

# Metro 번들러
EXPOSE 8081

CMD ["npx", "expo", "start", "--lan"]
