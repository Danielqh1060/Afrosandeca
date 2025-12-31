import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class StorageService implements OnModuleInit {
  private minioClient: Minio.Client;
  private bucketName = process.env.MINIO_BUCKET_NAME || 'afrosandeca-media';

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: false, // Local no usa SSL
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });
  }

  async onModuleInit() {
    await this.createBucketIfNotExists();
  }

  private async createBucketIfNotExists() {
    const exists = await this.minioClient.bucketExists(this.bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
      
      // Hacemos el bucket público (Solo lectura) para poder ver las imágenes desde el navegador
      // ESTO ES CRÍTICO PARA UN MVP SIN PROXY
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
          },
        ],
      };
      await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
      console.log(`🪣 Bucket '${this.bucketName}' creado y hecho público.`);
    }
  }

  async uploadFile(file: Express.Multer.File) {
    // Generar nombre único para evitar colisiones: timestamp-nombreOriginal
    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    
    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype } // Importante para que el navegador sepa que es imagen
    );

    // Retornamos la URL construida
    // En producción esto debería ser la URL de tu dominio/CDN
    return `http://localhost:9000/${this.bucketName}/${fileName}`;
  }
}