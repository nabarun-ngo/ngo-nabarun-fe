import { DocumentResponseDto } from "src/app/core/api/api-client/models/document-response-dto";

export interface Doc {
    contentType: string;
    fileName: string;
    fileSize: number;
    fileUrl?: string;
    id: string;
    isPublic: boolean;
    uploadedAt: string;
    generatedDoc: boolean;
}

export function mapDocDtoToDoc(docDto: DocumentResponseDto): Doc {
    return {
        contentType: docDto.contentType,
        fileName: docDto.fileName,
        fileSize: docDto.fileSize,
        fileUrl: undefined,
        id: docDto.id,
        isPublic: docDto.visibility === 'PUBLIC',
        uploadedAt: docDto.uploadedAt,
        generatedDoc: false
    };
}
