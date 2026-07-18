import os
import boto3
from botocore.config import Config


def _make_client():
    account_id = os.environ["R2__AccountId"]
    return boto3.client(
        "s3",
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=os.environ["R2__AccessKey"],
        aws_secret_access_key=os.environ["R2__SecretKey"],
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )


def download_pdf(s3_key: str) -> bytes:
    client = _make_client()
    bucket = os.environ["R2__BucketName"]
    response = client.get_object(Bucket=bucket, Key=s3_key)
    return response["Body"].read()
