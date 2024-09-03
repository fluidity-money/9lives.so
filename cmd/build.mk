
ORG_ROOT := superposition

INSTALL_DIR := $(or ${INSTALL_DIR},/usr/local/bin)

.PHONY: build watch clean install

MAKEFLAGS += --no-print-directory
