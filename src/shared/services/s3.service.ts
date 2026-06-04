import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient, ContainerClient, BlockBlobClient , BlobSASPermissions, SASProtocol, generateBlobSASQueryParameters, StorageSharedKeyCredential} from '@azure/storage-blob';


import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly containerClient: ContainerClient;
  constructor(private config: ConfigService) {
    const accountName = this.config.get<string>('AZURE_STORAGE_ACCOUNT_NAME');
    const accountKey = this.config.get<string>('AZURE_STORAGE_ACCOUNT_KEY');
    const containerName = this.config.get<string>('AZURE_STORAGE_CONTAINER_NAME');
  
    if (!accountKey || !accountName || !containerName) {
      throw new Error('Azure Blob Storage configuration missing');
    }
  
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
  
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKeyCredential,
    );
  
    this.containerClient = blobServiceClient.getContainerClient(containerName);
  }

  async uploadFile<T>(
    file: any,
    file_uri: string,
    is_public = true,
    metadata?: any,
  ): Promise<{ url: string; id: string } & T> {
    try {
      const uuid = randomUUID();
      const blobName = file_uri || `${uuid}.${file.originalname.split('.').pop()}`;
      const blockBlobClient: BlockBlobClient = this.containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype,
        },
        metadata: {
          ...(metadata || {}),
        },
      });

      // Azure doesn't auto-generate public URLs unless blob is set to public access manually on container
      const url = blockBlobClient.url;

      return { id: uuid, url, ...metadata };
    } catch (err) {
      this.logger.error('File upload error:', err);
      throw new Error('Invalid file format or upload error.');
    }
  }

  async getFiles(prefix: string) {
    try {
      const iter = this.containerClient.listBlobsFlat({ prefix });
      const blobs = [];

      for await (const blob of iter) {
        blobs.push({
          name: blob.name,
          url: this.containerClient.getBlockBlobClient(blob.name).url,
        });
      }

      return blobs as any;
    } catch (err) {
      this.logger.error('Error listing blobs:', err);
      throw new Error(err.message);
    }
  }

  async getFileStream(filePath: string) {
    try {
      const blobClient = this.containerClient.getBlobClient(filePath);
      const downloadBlockBlobResponse = await blobClient.download();
      return downloadBlockBlobResponse.readableStreamBody;
    } catch (err) {
      this.logger.error('Error getting file stream:', err);
      throw new Error(err.message);
    }
  }

  async getSignedUrl(filePath: string): Promise<string> {
    try {
      const accountName = this.config.get<string>('AZURE_STORAGE_ACCOUNT_NAME');
      const accountKey = this.config.get<string>('AZURE_STORAGE_ACCOUNT_KEY');
      const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
  
      const blobClient = this.containerClient.getBlobClient(filePath);
  
      const expiresOn = new Date(new Date().valueOf() + 3600 * 1000); // 1 hour
      const sasToken = generateBlobSASQueryParameters(
        {
          containerName: this.containerClient.containerName,
          blobName: filePath,
          expiresOn,
          permissions: BlobSASPermissions.parse('r'), // 👈 fix is here
          protocol: SASProtocol.Https,
        },
        sharedKeyCredential,
      ).toString();
  
      return `${blobClient.url}?${sasToken}`;
    } catch (err) {
      this.logger.error('Error generating signed URL:', err);
      throw new Error(err.message);
    }
  }

  async deleteFile(filePath: string) {
    try {
      const blobClient = this.containerClient.getBlobClient(filePath);
      await blobClient.deleteIfExists();
      return true;
    } catch (err) {
      this.logger.error('Error deleting blob:', err);
      throw new Error(err.message);
    }
  }

  async deleteFiles(files: Array<{ Key: string }>) {
    try {
      for (const file of files) {
        await this.containerClient.getBlobClient(file.Key).deleteIfExists();
      }
      return true;
    } catch (err) {
      this.logger.error('Error deleting blobs:', err);
      throw new Error(err.message);
    }
  }

  async uploadFileFromBuffer(name: string, buffer: Buffer): Promise<{ url: string; id: string }> {
    try {
      const blobName = `contracts/${name}.pdf`;
      const blockBlobClient: BlockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: 'application/pdf' },
      });
      return { id: name, url: blockBlobClient.url };
    } catch (err) {
      this.logger.error('Buffer upload error:', err);
      throw new Error(err.message);
    }
  }
}
