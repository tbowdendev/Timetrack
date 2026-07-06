# Timetrack AWS Hosting

This folder contains a CloudFormation template for hosting Timetrack on AWS with:

- Private S3 bucket
- CloudFront distribution
- CloudFront Origin Access Control
- ACM HTTPS certificate
- Route 53 alias records

## Prerequisites

- A domain registered in Route 53 or otherwise delegated to a Route 53 public hosted zone
- AWS CLI configured for the target account
- Deploy the stack in `us-east-1`, because CloudFront requires ACM certificates from that region

## Deploy Infrastructure

Set your values:

```powershell
$DomainName = "your-domain.com"
$HostedZoneId = "Z123456789ABCDEFG"
$StackName = "timetrack-static-site"
```

Deploy:

```powershell
aws cloudformation deploy `
  --region us-east-1 `
  --stack-name $StackName `
  --template-file infra/cloudformation/timetrack-static-site.yaml `
  --parameter-overrides DomainName=$DomainName HostedZoneId=$HostedZoneId IncludeWwwAlias=true `
  --capabilities CAPABILITY_IAM
```

## Upload Timetrack

Get the bucket name:

```powershell
$BucketName = aws cloudformation describe-stacks `
  --region us-east-1 `
  --stack-name $StackName `
  --query "Stacks[0].Outputs[?OutputKey=='SiteBucket'].OutputValue" `
  --output text
```

Upload the site:

```powershell
aws s3 cp .\index.html s3://$BucketName/index.html `
  --content-type text/html `
  --cache-control no-cache
```

## Invalidate CloudFront

Get the distribution ID:

```powershell
$DistributionId = aws cloudformation describe-stacks `
  --region us-east-1 `
  --stack-name $StackName `
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" `
  --output text
```

Invalidate cache:

```powershell
aws cloudfront create-invalidation `
  --distribution-id $DistributionId `
  --paths "/*"
```

## Notes

CloudFormation does not upload local website files by itself. Use the upload command after the stack is created and after each `index.html` change.

