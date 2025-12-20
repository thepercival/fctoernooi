#!/bin/bash

# run production build
#ng build -c prod,nl

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
purgecss --css ./styles*.css --content ./index.html ./*.js --output ./css --safelist alert-info alert-warning alert-danger alert-success table-alternate-dark q-w-1 q-w-2 q-w-3 q-w-4 q-w-5 q-l-5 q-l-4 q-l-3 q-l-2 q-l-1 q-partial q-w-1-double-partial q-w-2-double-partial q-w-3-double-partial q-w-4-double-partial q-w-5-double-partial q-l-5-double-partial q-l-4-double-partial q-l-3-double-partial q-l-2-double-partial q-l-1-double-partial
# purgecss --config ../../../purgecss.config.cjs --output ./css

# replace the 'dist/yourProjectName/styles.css' file with the 'dist/yourProjectName/css/styles.css' file
mv ./css/styles*.css ./styles*.css

# delete the previously created 'css' directory
rm -r css

# back to project
cd ..
cd ..
cd ..