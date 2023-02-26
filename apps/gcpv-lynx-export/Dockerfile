FROM docker.io/node:lts-alpine

WORKDIR /app

RUN addgroup --system gcpv-lynx-export && \
          adduser --system -G gcpv-lynx-export gcpv-lynx-export

COPY dist/apps/gcpv-lynx-export dist
RUN chown -R gcpv-lynx-export:gcpv-lynx-export .

CMD [ "node", "dist" ]