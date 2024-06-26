#!/bin/bash

# run production build
#ng build --prod --output-hashing none

echo -n "please enter locale(nl): "
read locale

# go to the dist/yourProjectName folder
cd ./dist/browser/$locale

if [ -d "css" ]; then rm -Rf css; fi

# make a new directory named 'css' (you can name it anything)
mkdir css

# run PurgeCSS & make a new '.css' file inside the 'css' directory
#purgecss --css ./styles.*.css --content ./index.html ./*.js --output ./css --safelist alert-info alert-warning alert-danger alert-success
purgecss --config ../../../purgecss.config.cjs --output ./css

# replace the 'dist/yourProjectName/styles.css' file with the 'dist/yourProjectName/css/styles.css' file
mv ./css/styles*.css ./styles*.css

# delete the previously created 'css' directory
rm -r css

# back to project
cd ..
cd ..
