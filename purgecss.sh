#!/bin/bash

# run production build
ng build -c prod,nl #--output-hashing none

LOCALE_DEFAULT="nl"
echo -n "please enter locale($LOCALE_DEFAULT): "
read LOCALE_INPUT
LOCALE=${LOCALE_INPUT:-$LOCALE_DEFAULT}

# go to the dist/yourProjectName folder
cd ./dist/browser/$LOCALE

if [ -d "css" ]; then rm -Rf css; fi

# make a new directory named 'css' (you can name it anything)
mkdir css

# run PurgeCSS & make a new '.css' file inside the 'css' directory
purgecss --css ./styles*.css --content ./index.html ./*.js --output ./css --safelist alert-info alert-warning alert-danger alert-success /^q-/
#purgecss --config ../../../purgecss.config.cjs --output ./css

# replace the 'dist/yourProjectName/styles.css' file with the 'dist/yourProjectName/css/styles.css' file
mv ./css/styles*.css ./styles*.css

# delete the previously created 'css' directory
rm -r css

# back to project
cd ..
cd ..
cd ..