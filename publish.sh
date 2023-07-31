#!/bin/bash
echo "Compiling Typescript"
cd task
pwd
tsc
cd ..
pwd
echo "Building and publishing extension"

key=$(<key)
tfx extension publish --manifest-globs vss-extension.json --rev-version --token $key