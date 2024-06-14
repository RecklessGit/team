FROM golang:1.22-alpine as builder

WORKDIR /app
ARG name
COPY . .
RUN go mod download
RUN GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" ./cmd/${name}

FROM alpine:latest  
ARG name
RUN apk --no-cache add ca-certificates
WORKDIR /
COPY --from=builder ./app/${name} /app

ENTRYPOINT ["./app"]

EXPOSE 8080