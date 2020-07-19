#!/bin/sh
echo -n "$GITHUB_REF-$GITHUB_SHA" > './.version'