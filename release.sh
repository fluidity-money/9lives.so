#!/bin/sh -e

version="$1"

IFS=''
changelog="$(cat CHANGELOG.md)"

cat >CHANGELOG.md <<EOF
## $(date +%d-%m-%Y)

$changelog
EOF

$EDITOR CHANGELOG.md

if [ -z "$version" ]; then
	tag=$(git describe --tags --abbrev=0)
	major=$(echo "$tag" | cut -d. -f1)
	minor=$(echo "$tag" | cut -d. -f2)
	patch=$(echo "$tag" | cut -d. -f3)
	minor=$((minor + 1))
	patch=0
	version="$major.$minor.$patch"
fi

sed -i "s/^version = .*/version = \"$version\"/" Cargo.toml
sed -i 's/\("version": *"\)[^"]*/\1'"$version"'/' package.json

git add Cargo.toml package.json CHANGELOG.md

git commit -m "Begin release $version"

git tag "$version"

git push --tags

git push
