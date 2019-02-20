## Claudia
To update `claudia update`

Might need to specify aws iam user with valid credentials `export AWS_PROFILE=claudia`

User credentials stored in `~/.aws/credentials`

Lambda details stored in `claudia.js`

To generate Lambda & API Gateway based on Express `claudia generate-serverless-express-proxy --express-module <moduleName> --proxy-module-name <lambdaName>`
where `<lambdaName>` is the name you want the lambda to be called 

To push up to AWS
`claudia create --handler <lambdaName.handler> --deploy-proxy-api --region <region> --policies <policyFile>`
If upload is failing due to timeouts, use `--use-s3-bucket <bucket>`

If `claudia create` isn't run with the right permissions, will have to delete the role it created on aws
can maybe also just specify the role to run 

To update IAM policies for security role of function, need to run `claudia destroy`, then create from scratch 

It seems one can use `aws iam put-role-policy` or `aws iam attach-role-policy` taken from [claudia docs](https://claudiajs.com/tutorials/external-services.html)


