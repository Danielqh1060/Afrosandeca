import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsArray()
  @IsOptional()
  sectionIds?: number[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  imageUrls?: string[];
}