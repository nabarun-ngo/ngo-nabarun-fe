
export interface Doc {
    contentType: string;
    fileName: string;
    fileSize: number;
    fileUrl?: string;
    id: string;
    isPublic: boolean;
    uploadedAt: string;
}