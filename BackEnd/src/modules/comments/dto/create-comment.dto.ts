import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty() @IsString() content: string;
  @IsNotEmpty() @IsUUID() postId: string;
  
  @IsOptional() 
  @IsUUID() 
  parentId?: string; // Opcional: Solo si es una respuesta
}