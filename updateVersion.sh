#!/bin/sh
version=${GITHUB_REF#refs/tags/}
echo -n "$version-$GITHUB_SHA" > './.version'