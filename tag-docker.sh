#!/bin/sh -e

docker build -t superposition/go-build -f Dockerfile.go-build .

docker build -t superposition/go-runtime -f Dockerfile.go-runtime .
