## Claudia
To update `claudia update`

Might need to specify aws iam user with valid credentials `export AWS_PROFILE=claudia`

Or by adding the option `--profile claudia`

User credentials stored in `~/.aws/credentials`

Lambda details stored in `claudia.js`

To generate Lambda & API Gateway based on Express `claudia generate-serverless-express-proxy --express-module server --proxy-module-name fyp-lambda`
where `--proxy-module-name` is the name you want the lambda to be called 

To push up to AWS
`claudia create --handler fyp-lambda.handler --deploy-proxy-api --region us-east-2 --policies policy.json`
If upload is failing due to timeouts, use `--use-s3-bucket <bucket>`
To use existing role `--role fyp-lambda-executor`

If `claudia create` isn't run with the right permissions, will have to delete the role it created on aws
can maybe also just specify the role to run 

It might take it a few minutes for the API Gateway to be responsive

To update IAM policies for security role of function, need to run `claudia destroy`, then create from scratch 

It seems one can use `aws iam put-role-policy` or `aws iam attach-role-policy` taken from [claudia docs](https://claudiajs.com/tutorials/external-services.html)



## Running Scripts
To run the server locally `npm start` or `npm run start`

To run the test suite against a remote instance `npm run test-remote`

To run the test suite against a local instance `npm run test-local`

