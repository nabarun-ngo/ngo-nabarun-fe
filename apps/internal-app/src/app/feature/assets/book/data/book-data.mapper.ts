import type {
  Book,
  BookAcquisitionType,
  BookCategory,
  BookClassLevel,
  BookLoanRecord,
  BookStatus,
  BookSubject,
} from '../domain';

export interface BookLoanRecordDto {
  id: string;
  borrowerUserId?: string;
  guestName?: string;
  loanedAt: string;
  dueDate?: string;
  returnedAt?: string;
  returnedById?: string;
  notes?: string;
}

export interface BookDetailDto {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  subject: BookSubject;
  classLevel: BookClassLevel;
  isbn?: string;
  location?: string;
  status: BookStatus;
  acquisitionType: BookAcquisitionType;
  acquisitionNotes?: string;
  holderUserId?: string;
  holderGuestName?: string;
  createdById?: string;
  updatedById?: string;
  loanHistory?: BookLoanRecordDto[];
  createdAt: string;
  updatedAt: string;
}

export function mapLoanRecordDto(dto: BookLoanRecordDto): BookLoanRecord {
  return {
    id: dto.id,
    borrowerUserId: dto.borrowerUserId,
    guestName: dto.guestName,
    loanedAt: dto.loanedAt,
    dueDate: dto.dueDate,
    returnedAt: dto.returnedAt,
    returnedById: dto.returnedById,
    notes: dto.notes,
  };
}

export function mapBookDto(dto: BookDetailDto): Book {
  return {
    id: dto.id,
    title: dto.title,
    author: dto.author,
    category: dto.category,
    subject: dto.subject,
    classLevel: dto.classLevel,
    isbn: dto.isbn,
    location: dto.location,
    status: dto.status,
    acquisitionType: dto.acquisitionType,
    acquisitionNotes: dto.acquisitionNotes,
    holderUserId: dto.holderUserId,
    holderGuestName: dto.holderGuestName,
    createdById: dto.createdById,
    updatedById: dto.updatedById,
    loanHistory: dto.loanHistory?.map(mapLoanRecordDto),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function toCreateBookBody(data: Partial<Book>): Record<string, unknown> {
  return {
    title: data.title,
    author: data.author,
    category: data.category,
    subject: data.subject,
    classLevel: data.classLevel,
    acquisitionType: data.acquisitionType,
    isbn: data.isbn,
    location: data.location,
    acquisitionNotes: data.acquisitionNotes,
  };
}

export function toUpdateBookBody(patch: Partial<Book>): Record<string, unknown> {
  return {
    ...(patch.title != null ? { title: patch.title } : {}),
    ...(patch.author != null ? { author: patch.author } : {}),
    ...(patch.category != null ? { category: patch.category } : {}),
    ...(patch.subject != null ? { subject: patch.subject } : {}),
    ...(patch.classLevel != null ? { classLevel: patch.classLevel } : {}),
    ...(patch.acquisitionType != null ? { acquisitionType: patch.acquisitionType } : {}),
    ...(patch.isbn != null ? { isbn: patch.isbn } : {}),
    ...(patch.location != null ? { location: patch.location } : {}),
    ...(patch.acquisitionNotes != null ? { acquisitionNotes: patch.acquisitionNotes } : {}),
  };
}
