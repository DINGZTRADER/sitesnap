export type Tag = 'Pre-Cover' | 'Firestop Inspection' | 'Sub-base' | 'JCT Variation' | 'Snagging Defect' | 'Daily Progress';
export type SyncState = 'synced' | 'pending';
export type Project = { id: string; name: string; code: string; clientName: string; address: string; status: 'active' | 'archived'; progress: number; photoCount: number; updatedAt: string; accent: string };
export type PhotoRecord = { id: string; projectId: string; image: string; timestamp: string; capturedBy: string; role: string; location: string; tags: Tag[]; note: string; syncStatus: SyncState; pairedPhotoId?: string; };
export type TeamMember = { id: string; name: string; role: string; initials: string; status: 'On site' | 'Away'; };
