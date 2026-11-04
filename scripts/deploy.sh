#!/bin/sh
# ينشر نسخة التطبيق على GitHub Pages تحت /allimni/.
set -e
rm -rf dist
APP_BASE=/allimni/ npm run build
cd dist
touch .nojekyll
git init -q -b gh-pages
git add -A
git commit -qm "Deploy $(date +%Y-%m-%d)"
git push -q -f https://github.com/zero-cold/allimni.git gh-pages
