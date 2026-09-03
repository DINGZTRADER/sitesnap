import { PhotoRecord, Project, TeamMember } from '@/types/domain';

export const projects: Project[] = [
  { id: 'hackney', name: 'Mews Redevelopment · Unit 4B', code: 'HACK-04', clientName: 'Derwent London', address: '14 Warburton St, Hackney, London E8 3RT', status: 'active', progress: 68, photoCount: 42, updatedAt: 'Today, 11:15', accent: '#f4d35e' },
  { id: 'northampton', name: 'Oaklands Logistics Park · Core 2', code: 'OAK-C2', clientName: 'Prologis UK', address: 'Gallows Corner, Northampton NN4 9BA', status: 'active', progress: 41, photoCount: 28, updatedAt: 'Yesterday, 16:20', accent: '#b8f36b' },
  { id: 'richmond', name: 'Victorian Terrace Loft & Extension', code: 'RICH-22', clientName: 'Private client', address: '88 Onslow Rd, Richmond TW10 6QH', status: 'active', progress: 82, photoCount: 31, updatedAt: '28 Aug, 09:41', accent: '#a8d8ea' },
];

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=82`;
const base = (id: string, projectId: string, photo: string, stage: 'before' | 'after', timestamp: string, capturedBy: string, role: string, location: string, tags: PhotoRecord['tags'], note: string, pairedPhotoId: string): PhotoRecord => ({ id, projectId, image: image(photo), timestamp, capturedBy, role, location, tags, note, syncStatus: 'synced', pairedPhotoId, stage });

export const photos: PhotoRecord[] = [
  base('p1', 'hackney', 'photo-1541888946425-d0fbb186c5f8', 'after', 'Today, 11:15', 'Dave Evans', 'Foreman', 'Ground floor · Gridline 3', ['JCT Variation'], 'Steel beam clash with specified MVHR ducting. Rerouted through web opening; Variation Notice #14 issued.', 'p4'),
  base('p2', 'hackney', 'photo-1504307651254-35680f356dfd', 'after', '30 Aug, 16:20', 'Liam Cooper', 'Site Manager', 'First floor · Unit 4B', ['Pre-Cover'], 'Drywall encasement complete. Double layer 15mm SoundBlock board ready for skim sign-off.', 'p3'),
  base('p3', 'hackney', 'photo-1581094794329-c8112a89af12', 'before', '28 Aug, 09:41', 'Liam Cooper', 'Site Manager', 'First floor · Unit 4B', ['Pre-Cover', 'Firestop Inspection'], 'Intumescent mastic seal completed around 110mm soil stack penetration. Verified to Detail FP-04.', 'p2'),
  base('p4', 'hackney', 'photo-1590381105924-c72589b9ef3f', 'before', '27 Aug, 14:05', 'Priya Shah', 'Clerk of Works', 'Rear elevation', ['Daily Progress'], 'Brickwork reached course 18. Scaffold lift two ready for inspection.', 'p1'),
  base('p5', 'northampton', 'photo-1590381105924-c72589b9ef3f', 'before', 'Yesterday, 08:12', 'Mark Ward', 'Clerk of Works', 'Warehouse slab · Grid E4–E8', ['Sub-base'], '150mm Type 1 compacted sub-base ready for DPM.', 'p6'),
  base('p6', 'northampton', 'photo-1541888946425-d0fbb186c5f8', 'after', 'Yesterday, 16:20', 'Mark Ward', 'Clerk of Works', 'Warehouse slab · Grid E4–E8', ['Daily Progress'], 'DPM and reinforcement installed across the first pour area.', 'p5'),
  base('p7', 'richmond', 'photo-1504307651254-35680f356dfd', 'before', '28 Aug, 09:41', 'Liam Cooper', 'Site Manager', 'Rear extension', ['Daily Progress'], 'Existing rear elevation recorded before strip-out works.', 'p8'),
  base('p8', 'richmond', 'photo-1581094794329-c8112a89af12', 'after', 'Yesterday, 13:05', 'Liam Cooper', 'Site Manager', 'Rear extension', ['Daily Progress', 'Pre-Cover'], 'Steel installed and temporary weathering complete ahead of inspection.', 'p7'),
];

export const team: TeamMember[] = [
  { id: '1', name: 'Liam Cooper', role: 'Site Manager', initials: 'LC', status: 'On site' },
  { id: '2', name: 'Dave Evans', role: 'Foreman', initials: 'DE', status: 'On site' },
  { id: '3', name: 'Priya Shah', role: 'Clerk of Works', initials: 'PS', status: 'Away' },
  { id: '4', name: 'Mark Ward', role: 'Subcontractor', initials: 'MW', status: 'On site' },
];
