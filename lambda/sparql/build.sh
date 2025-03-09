pip install --target ./package requests python-dotenv

cd package
zip -r ../my_deployment_package.zip .

cd ..
zip my_deployment_package.zip dummy_lambda.py .env