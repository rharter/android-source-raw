#!/bin/sh
find . -iname \.DS_Store -exec rm {} \;
rm -rf extension.zip
cd src/
zip -qr ../extension.zip .
cd ..
zipinfo -l extension.zip