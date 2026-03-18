// Skylife 장비랙 데이터
const S = 0.65; // 랙 간격 (m)
const R = 2.4;  // 열 간격 (m)

export interface Equipment {
  u: number;
  name: string;
  model: string;
}

export interface Rack {
  id: string;
  no: string;
  name: string;
  row: string;
  pos: number;
  x: number;
  z: number;
  isHPA?: boolean;
  equipments: Equipment[];
}

export interface Room {
  id: string;
  name: string;
  icon: string;
  color: string;
  floorW: number;
  floorD: number;
  racks: Rack[];
}

export const SKYLIFE_DATA: { rooms: Room[] } = {
  rooms: [
    {
      id: 'hpa', name: 'HPA실',
      icon: '📡', color: '#00d4ff',
      floorW: S * 8 + 1.5, floorD: R + 2.0,
      racks: [
        { id:'hpa-bsa', no:'HPA-1', name:'[6호] BS#A HPA System', row:'HPA열', pos:1, x:S*0, z:0, isHPA:true,
          equipments:[{u:34, name:'BS#A HPA#1 (Main)', model:'TL12UI'},{u:27, name:'BS#A HPA#2 (Backup)', model:'TL12UI'}]},
        { id:'hpa-bsb', no:'HPA-2', name:'[7호] BS#B HPA System', row:'HPA열', pos:2, x:S*1, z:0, isHPA:true,
          equipments:[{u:35, name:'BS#B HPA#1', model:'XTRT-12500DBS'},{u:30, name:'BS#B HPA#2', model:'XTRT-12500DBS'}]},
        { id:'hpa-csa', no:'HPA-3', name:'[6호] CS#A HPA System', row:'HPA열', pos:3, x:S*2, z:0, isHPA:true,
          equipments:[{u:34, name:'CS#A HPA#1 (Main)', model:'TL12UI'},{u:27, name:'CS#A HPA#2 (Backup)', model:'TL12UI'}]},
        { id:'hpa-csb', no:'HPA-4', name:'[6호] CS#B HPA System', row:'HPA열', pos:4, x:S*3, z:0, isHPA:true,
          equipments:[{u:35, name:'CS#B HPA#1 (PA1 Main)', model:'T5UI'},{u:30, name:'CS#B HPA#2 (PA2 Backup)', model:'T5UI'}]},
        { id:'hpa-bsa-rf1', no:'RF-1', name:'[6호] BS#A RF Rack-1 (MOD,UPC)', row:'RF열', pos:1, x:S*0, z:R,
          equipments:[
            {u:39,name:'BS#02 Up Converter',model:'Freq:14.54448'},{u:38,name:'BS#04 Up Converter',model:'Freq:14.58284'},
            {u:36,name:'BS#06 Up Converter',model:'Freq:14.62120'},{u:35,name:'BS#08 Up Converter',model:'Freq:14.65956'},
            {u:34,name:'BS#10 Up Converter',model:'Freq:14.69792'},{u:33,name:'BS#12 Up Converter',model:'Freq:14.73628'},
            {u:29,name:'UPC (Up-link Power Control)',model:'UPC'},
            {u:21,name:'BS#02 Modulator',model:''},{u:22,name:'BS#04 Modulator',model:''},
            {u:24,name:'BS#06 Modulator',model:''},{u:25,name:'BS#08 Modulator',model:''},
            {u:27,name:'BS#10 Modulator',model:''},{u:28,name:'BS#12 Modulator',model:''},
            {u:17,name:'Patch Panel',model:''}]},
        { id:'hpa-bsa-rf2', no:'RF-2', name:'[6호] BS#A RF Rack-2 (절체반,ACU)', row:'RF열', pos:2, x:S*1, z:R,
          equipments:[
            {u:39,name:'RF Patch Control',model:''},{u:36,name:'TLT (Test Loop Translator)',model:''},
            {u:34,name:'BDC (Block Down Converter)',model:''},{u:32,name:'1:1 LNA Controller',model:''},
            {u:30,name:'Spectrum Analyzer',model:''},{u:26,name:'Antenna Control Unit',model:'ACU Model 7200'},
            {u:24,name:'TRU (Tracking Receiver Unit)',model:''},{u:18,name:'Deicing & Rain Blower Control Panel',model:''},
            {u:15,name:'M&C COMM Server',model:''},{u:9,name:'Dehydrator',model:''}]},
        { id:'hpa-bsb-rf1', no:'RF-3', name:'[7호] BS#B RF Rack-1 (MOD,UPC)', row:'RF열', pos:3, x:S*2, z:R,
          equipments:[
            {u:39,name:'BS#14 Up Converter',model:'Freq:17.86452'},{u:38,name:'BS#16 Up Converter',model:'Freq:17.90288'},
            {u:36,name:'BS#18 Up Converter',model:'Freq:17.94124'},{u:35,name:'BS#20 Up Converter',model:'Freq:17.97960'},
            {u:34,name:'BS#22 Up Converter',model:'Freq:18.01796'},{u:33,name:'BS#24 Up Converter',model:'Freq:18.05632'},
            {u:29,name:'UPC (Up-link Power Control)',model:'UPC'},
            {u:21,name:'BS#14 Modulator',model:''},{u:22,name:'BS#16 Modulator',model:''},
            {u:24,name:'BS#18 Modulator',model:''},{u:25,name:'BS#20 Modulator',model:''},
            {u:27,name:'BS#22 Modulator',model:''},{u:28,name:'BS#24 Modulator',model:''},
            {u:17,name:'Patch Panel',model:''}]},
        { id:'hpa-bsb-rf2', no:'RF-4', name:'[7호] BS#B RF Rack-2 (절체반,ACU)', row:'RF열', pos:4, x:S*3, z:R,
          equipments:[
            {u:39,name:'RF Patch Control',model:''},{u:36,name:'TLT',model:''},
            {u:34,name:'BDC',model:''},{u:32,name:'1:1 LNA Controller',model:''},
            {u:30,name:'Spectrum Analyzer',model:''},{u:28,name:'Antenna Control Unit',model:'ACU M950'},
            {u:24,name:'TRU',model:''},{u:21,name:'Rain & Feed Heater Controller',model:''},
            {u:17,name:'Deicing Control System',model:''},{u:9,name:'Dehydrator',model:''}]},
        { id:'hpa-csa-rf1', no:'RF-5', name:'[6호] CS#A RF Rack-1 (절체반,ACU)', row:'RF열', pos:5, x:S*4, z:R,
          equipments:[
            {u:39,name:'RF Patch Control',model:''},{u:36,name:'TLT',model:''},
            {u:34,name:'BDC',model:''},{u:32,name:'1:1 LNA Controller',model:''},
            {u:30,name:'Spectrum Analyzer',model:''},{u:26,name:'Antenna Control Unit',model:'ACU Model 7200'},
            {u:24,name:'TRU',model:''},{u:18,name:'Deicing & Rain Blower Panel',model:''},
            {u:15,name:'CS1 COMM Server',model:''},{u:9,name:'Dehydrator',model:''}]},
        { id:'hpa-csa-rf2', no:'RF-6', name:'[6호] CS#A RF Rack-2 (MOD,UPC)', row:'RF열', pos:6, x:S*5, z:R,
          equipments:[
            {u:39,name:'CS#08 Up Converter',model:'Freq:14.158'},{u:38,name:'CS#10 Up Converter',model:'Freq:14.198'},
            {u:36,name:'CS#12 Up Converter',model:'Freq:14.238'},{u:35,name:'CS#14 Up Converter',model:'Freq:14.278'},
            {u:34,name:'CS#16 Up Converter',model:'Freq:14.318'},{u:33,name:'CS#24 Up Converter',model:'Freq:14.478'},
            {u:29,name:'UPC',model:''},
            {u:21,name:'CS#08 Modulator',model:''},{u:22,name:'CS#10 Modulator',model:''},
            {u:24,name:'CS#12 Modulator',model:''},{u:25,name:'CS#14 Modulator',model:''},
            {u:27,name:'CS#16 Modulator',model:''},{u:28,name:'CS#24 Modulator',model:''},
            {u:17,name:'Patch Panel',model:''},{u:13,name:'용인 통신제어기 (예비)',model:''}]},
        { id:'hpa-csb-rf1', no:'RF-7', name:'[6호] CS#B RF Rack-1 (절체반,ACU)', row:'RF열', pos:7, x:S*6, z:R,
          equipments:[
            {u:39,name:'RF Patch Control',model:''},{u:36,name:'TLT',model:''},
            {u:34,name:'BDC',model:''},{u:32,name:'1:1 LNA Controller',model:''},
            {u:30,name:'Spectrum Analyzer',model:''},{u:27,name:'Antenna Control Unit',model:'ACU M950'},
            {u:24,name:'TRU',model:''},{u:21,name:'Deicing Panel',model:''},
            {u:9,name:'Dehydrator',model:''}]},
        { id:'hpa-csb-rf2', no:'RF-8', name:'[6호] CS#B RF Rack-2 (MOD,UPC)', row:'RF열', pos:8, x:S*7, z:R,
          equipments:[
            {u:39,name:'CS#02 Up Converter',model:'Freq:14.038'},{u:38,name:'CS#04 Up Converter',model:'Freq:14.078'},
            {u:36,name:'CS#06 Up Converter',model:'Freq:14.118'},{u:35,name:'CS#18 Up Converter',model:'Freq:14.358'},
            {u:34,name:'CS#20 Up Converter',model:'Freq:14.398'},{u:33,name:'CS#22 Up Converter',model:'Freq:14.438'},
            {u:29,name:'UPC',model:''},
            {u:21,name:'CS#02 Modulator',model:''},{u:22,name:'CS#04 Modulator',model:''},
            {u:24,name:'CS#06 Modulator',model:''},{u:25,name:'CS#18 Modulator',model:''},
            {u:27,name:'CS#20 Modulator',model:''},{u:28,name:'CS#22 Modulator',model:''},
            {u:17,name:'Patch Panel',model:''}]}
      ]
    },
    {
      id: 'rf', name: 'RF실',
      icon: '📺', color: '#a855f7',
      floorW: S * 9 + 1.5, floorD: R * 2 + 2.0,
      racks: [
        { id:'2-1', no:'2-1', name:'DS3 Converter Rack #1', row:'2열', pos:1, x:S*0, z:0,
          equipments:[{u:42,name:'CNN',model:'DS3'},{u:37,name:'NHK WP',model:'DS3'},
          {u:33,name:'ASI ACO #3 CS#B [6호]',model:''},{u:27,name:'BBC Audio',model:'DS3'},
          {u:22,name:'BBC World',model:'DS3'}]},
        { id:'2-2', no:'2-2', name:'ASI 2:1 SW Rack #1', row:'2열', pos:2, x:S*1, z:0,
          equipments:[{u:41,name:'ASI ACO #1 BS#A [6호]',model:''},{u:37,name:'ASI ACO #2 CS#A [6호]',model:''},
          {u:30,name:'ASI ACO #1 BS#B [7호]',model:''},{u:24,name:'L2 Switch (24-port)',model:''},
          {u:19,name:'Multi-port Serial Converter',model:''},{u:7,name:'L2 Switch (24-port)',model:''}]},
        { id:'2-3', no:'2-3', name:'TS Monitor Rack', row:'2열', pos:3, x:S*2, z:0,
          equipments:[{u:43,name:'Outdoor HD (Main)',model:'Monitor'},{u:38,name:'A/V Monitor',model:''},
          {u:35,name:'A/V Monitor Jack Panel',model:''},{u:29,name:'TSI GPI Control',model:'GPI 2013'},
          {u:24,name:'해외채널 L2 Switch (36-port)',model:''},{u:7,name:'L2 Switch (24-port)',model:''}]},
        { id:'2-4', no:'2-4', name:'Up-link IRD Rack #1', row:'2열', pos:4, x:S*3, z:0,
          equipments:[{u:45,name:'BBC Earth (Main)',model:'IRD'},{u:44,name:'BBC Earth (B/U)',model:'IRD'},
          {u:43,name:'FOX News',model:'IRD'},{u:38,name:'Animal Planet',model:'IRD'},
          {u:30,name:'Fight Sports',model:'IRD'},{u:24,name:'C-Music (Main)',model:'IRD'},
          {u:22,name:'Smithsonian (Main)',model:'IRD'},{u:18,name:'CCTV-4 HD (Main)',model:'IRD'},
          {u:12,name:'CGTN HD (Main)',model:'IRD'}]},
        { id:'2-5', no:'2-5', name:'Up-link IRD Rack #2', row:'2열', pos:5, x:S*4, z:0,
          equipments:[{u:43,name:'EURO Sports',model:'IRD'},{u:38,name:'NatGeo Wild',model:'IRD'},
          {u:22,name:'NGT (Main)',model:'IRD'},{u:8,name:'Discovery Science',model:'IRD'}]},
        { id:'2-6', no:'2-6', name:'중계기 Monitor Rack #1 [7호 BS#B]', row:'2열', pos:6, x:S*5, z:0,
          equipments:[{u:46,name:'Chainasat-6A Deicing Controller',model:''},{u:40,name:'Deicing Power Control',model:''},
          {u:32,name:'ACU (Model:7134)',model:''},{u:19,name:'해외재전송 Deicing Controller',model:''},
          {u:17,name:'Up-link BS#14 (P083)',model:'IRD'},{u:16,name:'Up-link BS#16 (P120)',model:'IRD'},
          {u:15,name:'Up-link BS#18 (P122)',model:'IRD'},{u:13,name:'Up-link BS#20 (P188)',model:'IRD'},
          {u:11,name:'Up-link BS#22 (P133)',model:'IRD'},{u:9,name:'Up-link BS#24 (P291)',model:'IRD'},
          {u:5,name:'BS#B [7호] 모니터링 라우터-1',model:''},{u:3,name:'BS#B [7호] 모니터링 라우터-2',model:''},
          {u:1,name:'BS#B [7호] 멀티뷰어',model:''}]},
        { id:'2-7', no:'2-7', name:'중계기 Monitor Rack #2 [6호 CS#A]', row:'2열', pos:7, x:S*6, z:0,
          equipments:[{u:17,name:'Up-link CS#08 (P024)',model:'IRD'},{u:16,name:'Up-link CS#10 (P165)',model:'IRD'},
          {u:15,name:'Up-link CS#12 (P102)',model:'IRD'},{u:13,name:'Up-link CS#14 (P26)',model:'IRD'},
          {u:11,name:'Up-link CS#16 (P86)',model:'IRD'},{u:9,name:'Up-link CS#24 (P88)',model:'IRD'},
          {u:5,name:'CS#A [6호] A/V Monitoring Switcher',model:''},
          {u:3,name:'CS#A [6호] 멀티뷰어',model:''},{u:1,name:'CS#A [6호] 멀티뷰어 Encoder',model:''}]},
        { id:'2-8', no:'2-8', name:'D/W-link IRD Rack #1 [6호 BS#A]', row:'2열', pos:8, x:S*7, z:0,
          equipments:[{u:45,name:'Up-link BS#02 (P013)',model:'IRD'},{u:43,name:'Up-link BS#04 (P000)',model:'IRD'},
          {u:41,name:'Up-link BS#06 (P25)',model:'IRD'},{u:39,name:'Up-link BS#08 (P121)',model:'IRD'},
          {u:37,name:'Up-link BS#10 (P9)',model:'IRD'},{u:35,name:'Up-link BS#12 (P66)',model:'IRD'},
          {u:27,name:'Down-link BS#02 (P013)',model:'IRD'},{u:25,name:'Down-link BS#04',model:'IRD'},
          {u:23,name:'Down-link BS#06',model:'IRD'},{u:21,name:'Down-link BS#08',model:'IRD'},
          {u:6,name:'BS#A [6호] A/V Monitoring Switcher',model:''},
          {u:4,name:'BS#A [6호] 멀티뷰어',model:''},{u:2,name:'BS#A [6호] 멀티뷰어 Encoder',model:''}]},
        { id:'2-9', no:'2-9', name:'D/W-link IRD Rack #2 [6호 CS#B]', row:'2열', pos:9, x:S*8, z:0,
          equipments:[{u:45,name:'Up-link CS#02 (P54)',model:'IRD'},{u:43,name:'Up-link CS#04 (P303)',model:'IRD'},
          {u:41,name:'Up-link CS#06 (P028)',model:'IRD'},{u:39,name:'Up-link CS#18 (P273)',model:'IRD'},
          {u:27,name:'Down-link CS#02',model:'IRD'},{u:25,name:'Down-link CS#04',model:'IRD'},
          {u:6,name:'CS#B [6호] A/V Monitoring Switcher',model:''},
          {u:4,name:'CS#B [6호] 멀티뷰어',model:''},{u:2,name:'CS#B [6호] 멀티뷰어 Encoder',model:''},
          {u:1,name:'DCH-3000MX DVB Multiplexer',model:''}]},
        { id:'3-1', no:'3-1', name:'DS3 Converter Rack #1', row:'3열', pos:1, x:S*0, z:R,
          equipments:[{u:42,name:'CNN',model:'DS3'},{u:37,name:'NHK WP',model:'DS3'},
          {u:27,name:'BBC Audio',model:'DS3'},{u:22,name:'BBC World',model:'DS3'}]},
        { id:'3-2', no:'3-2', name:'ASI 2:1 SW Rack #1', row:'3열', pos:2, x:S*1, z:R,
          equipments:[{u:41,name:'ASI ACO #1 BS#A [6호]',model:''},{u:37,name:'ASI ACO #2 CS#A [6호]',model:''},
          {u:30,name:'ASI ACO #1 BS#B [7호]',model:''},{u:24,name:'L2 Switch (24-port)',model:''}]},
        { id:'3-3', no:'3-3', name:'TS Monitor Rack', row:'3열', pos:3, x:S*2, z:R,
          equipments:[{u:43,name:'Outdoor HD (Main)',model:'Monitor'},{u:38,name:'A/V Monitor',model:''},
          {u:29,name:'TSI GPI Control',model:'GPI 2013'}]},
        { id:'3-4', no:'3-4', name:'Up-link IRD Rack #1', row:'3열', pos:4, x:S*3, z:R,
          equipments:[{u:45,name:'BBC Earth (Main)',model:'IRD'},{u:44,name:'BBC Earth (B/U)',model:'IRD'},
          {u:43,name:'FOX News',model:'IRD'},{u:38,name:'Animal Planet',model:'IRD'},
          {u:30,name:'Fight Sports',model:'IRD'},{u:24,name:'C-Music (Main)',model:'IRD'},
          {u:18,name:'CCTV-4 HD (Main)',model:'IRD'},{u:12,name:'CGTN HD (Main)',model:'IRD'}]},
        { id:'3-5', no:'3-5', name:'Up-link IRD Rack #2', row:'3열', pos:5, x:S*4, z:R,
          equipments:[{u:43,name:'EURO Sports',model:'IRD'},{u:38,name:'NatGeo Wild',model:'IRD'},
          {u:22,name:'NGT (Main)',model:'IRD'},{u:16,name:'C-Music (B/U)',model:'IRD'}]},
        { id:'4-1', no:'4-1', name:'DS3 Converter Rack #1 (광단국)', row:'4열', pos:1, x:S*0, z:R*2,
          equipments:[
            {u:43,name:'메인 광단국 MD8000EX',model:'MD8000EX'},
            {u:36,name:'백업 광단국 MD8000EX',model:'MD8000EX'},
            {u:30,name:'Patch Panel (메인 Rx)',model:''},{u:28,name:'Patch Panel (메인 Tx)',model:''},
            {u:26,name:'DVB/ASI TS 분배기 (Rx 1-24)',model:''},
            {u:24,name:'Patch Panel (백업 Rx)',model:''},{u:22,name:'Patch Panel (백업 Tx)',model:''},
            {u:20,name:'DVB/ASI TS 분배기 (Tx 1-24)',model:''}]}
      ]
    }
  ]
};

export function findRack(rackId: string): { room: Room; rack: Rack } | null {
  for (const room of SKYLIFE_DATA.rooms)
    for (const rack of room.racks)
      if (rack.id === rackId) return { room, rack };
  return null;
}

export function qrToRackId(qrValue: string): string | null {
  const v = qrValue.trim().toUpperCase();
  for (const room of SKYLIFE_DATA.rooms)
    for (const rack of room.racks)
      if (rack.id.toUpperCase() === v || rack.no.toUpperCase() === v)
        return rack.id;
  return null;
}
