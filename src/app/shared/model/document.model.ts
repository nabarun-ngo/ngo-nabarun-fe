import { DocumentDto } from "src/app/core/api-client/models/document-dto";

export interface Doc {
    contentType: string;
    fileName: string;
    fileSize: number;
    fileUrl?: string;
    id: string;
    isPublic: boolean;
    uploadedAt: string;
}

export function mapDocDtoToDoc(docDto: DocumentDto): Doc {
    return {
        contentType: docDto.contentType,
        fileName: docDto.fileName,
        fileSize: docDto.fileSize,
        fileUrl: docDto.fileUrl,
        id: docDto.id,
        isPublic: docDto.isPublic,
        uploadedAt: docDto.uploadedAt,
    };
}