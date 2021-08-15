terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

# Main region where the resources should be created in
provider "aws" {
  region = "us-west-2"
}

provider "aws" {
  alias  = "global_region"
  region = "us-east-1"
}

locals {
  # Your custom domain
  custom_domain = "web.anonymouslack.commit2.app"
}

data "aws_route53_zone" "selected" {
  name         = "commit2.app."
  private_zone = false
}

module "acm" {
  source  = "terraform-aws-modules/acm/aws"
  version = "~> v3.0"

  domain_name = local.custom_domain
  zone_id     = data.aws_route53_zone.selected.zone_id

  tags = {
    Name = "CloudFront ${local.custom_domain}"
  }

  # CloudFront works only with certs stored in us-east-1
  providers = {
    aws = aws.global_region
  }
}

resource "aws_route53_record" "service" {
  zone_id = data.aws_route53_zone.selected.zone_id
  name    = local.custom_domain
  type    = "A"
  alias {
    name                   = module.tf_next.cloudfront_domain_name
    zone_id                = module.tf_next.cloudfront_hosted_zone_id
    evaluate_target_health = true
  }
}

module "tf_next" {
  source = "dealmore/next-js/aws"

  deployment_name            = "anonymouslack"
  create_image_optimization  = false
  create_domain_name_records = false

  domain_names                      = [local.custom_domain]
  domain_zone_names                 = [data.aws_route53_zone.selected.name]
  cloudfront_viewer_certificate_arn = module.acm.acm_certificate_arn

  providers = {
    aws.global_region = aws.global_region
  }
}

########################################################
# outputs
output "cloudfront_domain_name" {
  value = module.tf_next.cloudfront_domain_name
}

output "custom_domain" {
  value = local.custom_domain
}

locals {
  name_prefix = "anonymouslack-docsify"
  name_suffix = "aabbcc"
}

module "cdn" {
  source = "github.com/ACupofCommit/terraform-s3-cdn"
  name_prefix = local.name_prefix
  name_suffix = local.name_suffix
  route53_zone_name = "commit2.app"
  domain            = "anonymouslack.commit2.app"
}

