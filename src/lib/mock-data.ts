import { PhotoRecord, Project, TeamMember } from '@/types/domain';
export const projects: Project[] = [
 { id:'hackney', name:'Mews Redevelopment · Unit 4B', code:'HACK-04', clientName:'Derwent London', address:'14 Warburton St, Hackney, London E8 3RT', status:'active', progress:68, photoCount:42, updatedAt:'Today, 11:15', accent:'#f4d35e' },
 { id:'northampton', name:'Oaklands Logistics Park · Core 2', code:'OAK-C2', clientName:'Prologis UK', address:'Gallows Corner, Northampton NN4 9BA', status:'active', progress:41, photoCount:28, updatedAt:'Yesterday, 16:20', accent:'#b8f36b' },
 { id:'richmond', name:'Victorian Terrace Loft & Extension', code:'RICH-22', clientName:'Private client', address:'88 Onslow Rd, Richmond TW10 6QH', status:'active', progress:82, photoCount:31, updatedAt:'28 Aug, 09:41', accent:'#a8d8ea' }
];
const img = (id:string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=82`;
export const photos: PhotoRecord[] = [
 {id:'p1',projectId:'hackney',image:img('photo-1541888946425-d0fbb186c5f8'),timestamp:'Today, 11:15',capturedBy:'Dave Evans',role:'Foreman',location:'Ground floor · Gridline 3',tags:['JCT Variation'],note:'Steel beam clash with specified MVHR ducting. Rerouted through web opening; Variation Notice #14 issued.',syncStatus:'synced'},
 {id:'p2',projectId:'hackney',image:img('photo-1504307651254-35680f356dfd'),timestamp:'30 Aug, 16:20',capturedBy:'Liam Cooper',role:'Site Manager',location:'First floor · Unit 4B',tags:['Pre-Cover'],note:'Drywall encasement complete. Double layer 15mm SoundBlock board ready for skim sign-off.',syncStatus:'synced',pairedPhotoId:'p3'},
 {id:'p3',projectId:'hackney',image:img('photo-1581094794329-c8112a89af12'),timestamp:'28 Aug, 09:41',capturedBy:'Liam Cooper',role:'Site Manager',location:'First floor · Unit 4B',tags:['Pre-Cover','Firestop Inspection'],note:'Intumescent mastic seal completed around 110mm soil stack penetration. Verified to Detail FP-04.',syncStatus:'synced',pairedPhotoId:'p2'},
 {id:'p4',projectId:'hackney',image:img('photo-1590381105924-c72589b9ef3f'),timestamp:'27 Aug, 14:05',capturedBy:'Priya Shah',role:'Clerk of Works',location:'Rear elevation',tags:['Daily Progress'],note:'Brickwork reached course 18. Scaffold lift two ready for inspection.',syncStatus:'synced'},
];
export const team: TeamMember[] = [{id:'1',name:'Liam Cooper',role:'Site Manager',initials:'LC',status:'On site'},{id:'2',name:'Dave Evans',role:'Foreman',initials:'DE',status:'On site'},{id:'3',name:'Priya Shah',role:'Clerk of Works',initials:'PS',status:'Away'},{id:'4',name:'Mark Ward',role:'Subcontractor',initials:'MW',status:'On site'}];
