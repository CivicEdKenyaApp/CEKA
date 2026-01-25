import os
import boto3
from botocore.exceptions import ClientError
import logging
from typing import Optional, List
from datetime import datetime
import mimetypes

logger = logging.getLogger(__name__)

class StorageService:
    def __init__(self):
        self.endpoint_url = os.environ.get('STORAGE_ENDPOINT') # Cloudflare R2 or Backblaze B2 S3 endpoint
        self.access_key = os.environ.get('STORAGE_ACCESS_KEY')
        self.secret_key = os.environ.get('STORAGE_SECRET_KEY')
        self.bucket_name = os.environ.get('STORAGE_BUCKET_NAME', 'ceka-vault')
        self.public_url_base = os.environ.get('STORAGE_PUBLIC_URL') # e.g. CDN or R2 public bucket URL

        if self.endpoint_url and self.access_key and self.secret_key:
            self.s3_client = boto3.client(
                's3',
                endpoint_url=self.endpoint_url,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                region_name='auto'
            )
        else:
            logger.warning("Storage credentials missing. Falling back to local/disabled.")
            self.s3_client = None

    def upload_file(self, file_path: str, destination_name: str, content_type: Optional[str] = None) -> Optional[str]:
        """Upload a file to R2/B2 and return the URL or key."""
        if not self.s3_client:
            logger.error("S3 client not initialized")
            return None

        if not content_type:
            content_type, _ = mimetypes.guess_type(file_path)

        try:
            self.s3_client.upload_file(
                file_path, 
                self.bucket_name, 
                destination_name,
                ExtraArgs={'ContentType': content_type or 'application/octet-stream'}
            )
            
            if self.public_url_base:
                return f"{self.public_url_base.rstrip('/')}/{destination_name}"
            return destination_name
        except ClientError as e:
            logger.error(f"Upload failed: {e}")
            return None

    def get_signed_url(self, key: str, expires_in: int = 3600) -> Optional[str]:
        """Generate a temporary signed URL for a private resource."""
        if not self.s3_client: return None
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': key},
                ExpiresIn=expires_in
            )
            return url
        except ClientError as e:
            logger.error(f"Presign failed: {e}")
            return None

    def delete_file(self, key: str) -> bool:
        """Remove a file from the vault."""
        if not self.s3_client: return False
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=key)
            return True
        except ClientError:
            return False

storage_service = StorageService()
