FROM docker.io/node:lts-alpine

WORKDIR /app

RUN addgroup --system connector-mylaps && \
          adduser --system -G connector-mylaps connector-mylaps

COPY dist/apps/connector-mylaps dist
RUN chown -R connector-mylaps:connector-mylaps .

CMD [ "node", "dist" ]