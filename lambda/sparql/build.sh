pip install --target ./package requests

cd package
zip -r ../function.zip .

cd ..
zip function.zip lambda_function.py