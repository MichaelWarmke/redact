import { DocumentChunk, RedactionDefinition, RedactionItem, AircraftPart } from '../types';

export const REDACTION_DEFINITIONS: Record<string, RedactionDefinition> = {
  'IL6-OPSEC-01': {
    id: 'IL6-OPSEC-01',
    code: 'IL6-OPSEC-01',
    description: 'IL6 OpSec Review 1 - Critical Mission Architecture & Sensor Specs',
    classificationLevel: 'SECRET',
    badgeColor: 'bg-red-950/80 text-red-300 border-red-700/60 hover:bg-red-900',
  },
  'ITAR-CAT8-SEC4': {
    id: 'ITAR-CAT8-SEC4',
    code: 'ITAR-CAT8-SEC4',
    description: 'ITAR Cat VIII §4.1 - Military Aircraft Subsystems & Flight Control',
    classificationLevel: 'RESTRICTED',
    badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700/60 hover:bg-amber-900',
  },
  'CUI-SP-PRVCY': {
    id: 'CUI-SP-PRVCY',
    code: 'CUI-SP-PRVCY',
    description: 'CUI / SP-PRVCY - Proprietary Manufacturer Serials & Cage IDs',
    classificationLevel: 'CUI',
    badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-700/60 hover:bg-blue-900',
  },
  'EAR99-ECCN-7A': {
    id: 'EAR99-ECCN-7A',
    code: 'EAR99-ECCN-7A',
    description: 'EAR99 ECCN 7A003 - Inertial Navigation & Cryptographic Gyro Specs',
    classificationLevel: 'RESTRICTED',
    badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-700/60 hover:bg-purple-900',
  },
  'NOFORN-REL-USA': {
    id: 'NOFORN-REL-USA',
    code: 'NOFORN-REL-USA',
    description: 'NOFORN // REL TO USA - Cryptographic Vault Keys & Frequencies',
    classificationLevel: 'TOP SECRET',
    badgeColor: 'bg-rose-950/90 text-rose-200 border-rose-600 hover:bg-rose-900',
  },
  'MIL-STD-810H-S': {
    id: 'MIL-STD-810H-S',
    code: 'MIL-STD-810H-S',
    description: 'MIL-STD-810H - Classified Environmental Tolerance Limits',
    classificationLevel: 'CONFIDENTIAL',
    badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900',
  },
  'FOUO-EXPORT-RESTRICT': {
    id: 'FOUO-EXPORT-RESTRICT',
    code: 'FOUO-EXPORT-RESTRICT',
    description: 'Export-Restricted Defense Technical Data Package',
    classificationLevel: 'RESTRICTED',
    badgeColor: 'bg-orange-950/80 text-orange-300 border-orange-700/60 hover:bg-orange-900',
  },
  'CUSTOM': {
    id: 'CUSTOM',
    code: 'CUSTOM',
    description: 'Custom Reviewer Redaction Directive',
    classificationLevel: 'RESTRICTED',
    badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-600 hover:bg-zinc-700',
  }
};

const CHUNK_METADATA = [
  { index: 1, title: 'Core Integrated Processor & Avionics Bus', category: 'AVIONICS', reviewer: 'Maj. E. Vance (USAF)', status: 'IN_REVIEW' as const },
  { index: 2, title: 'AN/APG-81 Active Electronically Scanned Array (AESA)', category: 'RADAR', reviewer: 'C. Hayes (Sensors Lead)', status: 'REQUIRES_RECHECK' as const },
  { index: 3, title: 'Distributed Aperture System (DAS) EO Sensors', category: 'OPTICS', reviewer: 'Dr. K. Rostova (OpSec)', status: 'IN_REVIEW' as const },
  { index: 4, title: 'Electronic Warfare (EW) Jamming & Countermeasures', category: 'EW_SUITE', reviewer: 'Lt. Col. D. Miller', status: 'PENDING_REVIEW' as const },
  { index: 5, title: 'Primary Electro-Hydrostatic Flight Surface Actuators', category: 'FLIGHT_CONTROL', reviewer: 'R. Kowalski (Systems)', status: 'REDACTED_APPROVED' as const },
  { index: 6, title: 'F135-PW-100 Propulsion Sensor Telemetry Bus', category: 'PROPULSION', reviewer: 'T. Briggs (Pratt & W.)', status: 'IN_REVIEW' as const },
  { index: 7, title: 'MIL-STD-1760 Weapons Bay Pylon Controllers', category: 'WEAPONS', reviewer: 'Maj. E. Vance (USAF)', status: 'PENDING_REVIEW' as const },
  { index: 8, title: 'MADL & Link-16 Tactical Data Link Transceiver Modules', category: 'COMMUNICATIONS', reviewer: 'C. Hayes (Sensors Lead)', status: 'PENDING_REVIEW' as const },
  { index: 9, title: 'Inertial Navigation Ring Laser Gyroscopes & GPS Anti-Spoof', category: 'NAVIGATION', reviewer: 'Dr. K. Rostova (OpSec)', status: 'PENDING_REVIEW' as const },
  { index: 10, title: 'Panoramic Cockpit Display & Gen III Helmet HUD Interface', category: 'COCKPIT', reviewer: 'R. Kowalski (Systems)', status: 'REDACTED_APPROVED' as const },
  { index: 11, title: 'Onboard Oxygen Generating (OBOGS) Life Support Valves', category: 'LIFE_SUPPORT', reviewer: 'T. Briggs (Pratt & W.)', status: 'PENDING_REVIEW' as const },
  { index: 12, title: 'Cryogenic PAO Liquid Cooling & Thermal Management Loops', category: 'THERMAL', reviewer: 'Lt. Col. D. Miller', status: 'PENDING_REVIEW' as const },
  { index: 13, title: 'Arresting Hook & Heavy Carrier Landing Gear Dampers', category: 'AIRFRAME_GEAR', reviewer: 'R. Kowalski (Systems)', status: 'PENDING_REVIEW' as const },
  { index: 14, title: 'Radar Absorbent Material (RAM) Skin Fasteners & Sealants', category: 'STEALTH_STRUCT', reviewer: 'Maj. E. Vance (USAF)', status: 'PENDING_REVIEW' as const },
  { index: 15, title: 'Tactical Flight Data Recorder & Cryptographic Key Vault', category: 'CYBER_SECURITY', reviewer: 'Dr. K. Rostova (OpSec)', status: 'REQUIRES_RECHECK' as const },
  { index: 16, title: 'Automated Logistics Information System (ALIS) Gateway', category: 'TELEMETRY', reviewer: 'C. Hayes (Sensors Lead)', status: 'PENDING_REVIEW' as const },
];

function generatePartsForChunk(chunkIndex: number): AircraftPart[] {
  const parts: AircraftPart[] = [];
  const meta = CHUNK_METADATA[chunkIndex - 1];
  
  const componentTemplates: Record<string, { prefix: string; names: string[] }> = {
    AVIONICS: {
      prefix: 'ICP',
      names: [
        'Multi-Core PowerPC Processing Module',
        'VME64 High-Throughput Fibre Backplane',
        'Direct Memory Access Cryptographic Coprocessor',
        'Dual-Redundant MIL-STD-1553B Bus Controller',
        'Avionics Fiber-Optic Transceiver Host',
        'Flight Safety Diagnostic Watchdog Timer Unit',
        'Primary Mission Software Flash Storage EEPROM',
        'Precision Time Base Synchronizer Module'
      ]
    },
    RADAR: {
      prefix: 'AESA',
      names: [
        'Gallium Nitride (GaN) Transmit/Receive Module Array',
        'Beamsteering Digital Frequency Synthesizer',
        'Monopulse Comparator Low-Noise Pre-Amplifier',
        'Radar Exciter Multi-Channel Receiver FPGA',
        'High-Voltage Radar Liquid Cold Plate Heat Exchanger',
        'Electromagnetic Pulse (EMP) Protective Isolator',
        'Target Tracking Doppler Filter Accelerator',
        'Wideband Antenna Element Polarization Switch'
      ]
    },
    OPTICS: {
      prefix: 'DAS',
      names: [
        'Mid-Wave Infrared Distributed Aperture Sensor Head',
        'Cryocooled Indium Antimonide (InSb) Focal Plane',
        'Missile Warning Optical Sensor Dome Window',
        'Spherical Situational Awareness Neural Processor',
        'Optical De-icing Heating Element Interface',
        'High-Bandwidth Serial Digital Video Streamer',
        'Day/Night Low-Light Optical Filter Selector',
        'Gyro-Stabilized Gimbal Rate Sensor'
      ]
    },
    EW_SUITE: {
      prefix: 'EWS',
      names: [
        'Digital Radio Frequency Memory (DRFM) Unit',
        'Radar Warning Receiver (RWR) Wideband Antenna',
        'Chaff/Flare Pyrotechnic Dispenser Controller',
        'Cooperative Coherent Jamming Waveform Generator',
        'Electronic Surveillance Measures Angle-of-Arrival Unit',
        'Active Threat Direction Finding Processor',
        'Band IV Integrated RF Power Amplifier',
        'Self-Protection Jammer High-Power TWT Supply'
      ]
    },
    FLIGHT_CONTROL: {
      prefix: 'FCS',
      names: [
        'Dual-Tandem Electro-Hydrostatic Actuator (EHA)',
        'Trailing Edge Flap Fly-by-Wire Servo Valve',
        'Rudder Deflection Linear Variable Displacement Xducer',
        'Leading Edge Flap Carbon-Carbon Torque Tube',
        'Hydraulic Pressure Transducer 5000 PSI Rating',
        'Horizontal Stabilator Titanium Pivot Pin',
        'Backup Electronic Flight Control Unit (EFCS)',
        'Asymmetric Thrust Vector Nozzle Actuator Linkage'
      ]
    },
    PROPULSION: {
      prefix: 'ENG',
      names: [
        'Turbine Blade Single-Crystal Superalloy Array',
        'Full Authority Digital Engine Controller (FADEC-A)',
        'Variable Area Exhaust Nozzle Synchronizing Ring',
        'Low-Pressure Compressor Titanium Blisk Hub',
        'Fuel Metering Servo Actuator Valve Assembly',
        'Afterburner Optical Flame Ionization Sensor',
        'Bearing Cavity Scavenge Oil Temperature Probe',
        'Turbine Clearance Active Bleed Control Solenoid'
      ]
    }
  };

  const currentTemplate = componentTemplates[meta.category] || componentTemplates.AVIONICS;

  for (let i = 0; i < 20; i++) {
    const itemNum = (chunkIndex - 1) * 20 + (i + 1);
    const padded = String(itemNum).padStart(4, '0');
    const name = currentTemplate.names[i % currentTemplate.names.length];
    
    parts.push({
      part_id: `PN-${currentTemplate.prefix}-${padded}`,
      nomenclature: `${name} [Mk-${(i % 3) + 1}]`,
      subsystem: meta.title,
      nsn_national_stock_number: `5998-01-${String(3400000 + itemNum * 17).padStart(9, '0')}`,
      cage_code: ['98747', '77445', '11835', '60481', '01295'][i % 5],
      serial_number: `SN-F35-BLK4-${padded}-${['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA'][i % 4]}`,
      defense_classification: (i % 3 === 0 ? 'SECRET' : i % 3 === 1 ? 'CONFIDENTIAL' : 'CUI'),
      itar_eccn_control: (i % 2 === 0 ? 'ITAR Cat VIII(a) Defense Article' : 'EAR99 ECCN 7A003.b'),
      operating_band_or_frequency: (i % 2 === 0 ? `${(8.5 + (i * 0.4)).toFixed(3)} GHz - ${(12.0 + (i * 0.3)).toFixed(3)} GHz X/Ku` : undefined),
      mil_spec_standard: `MIL-STD-${['810H-514.8', '461G-CS114', '704F-28VDC', '1553B-NOTICE-2'][i % 4]}`,
      assembly_station: `STATION-${String((i % 6) + 1).padStart(2, '0')}-FWD-BAY`,
      firmware_crypt_hash: `SHA256:7f8a9${(i * 31337).toString(16).padStart(6, '0')}e91b4092b`,
      failure_rate_mtbf_hrs: 18500 + (i * 240),
      critical_load_rating_kn: 45.5 + (i * 3.2),
      supplier_restricted_cage: `CAGE-${['NORTHROP', 'LOCKHEED', 'BAE-SYS', 'RAYTHEON', 'L3HARRIS'][i % 5]}-${String(8400 + i)}`,
      opsec_review_status: (i % 4 === 0 ? 'REDACTED' : i % 4 === 1 ? 'FLAGGED' : 'PENDING'),
    });
  }

  return parts;
}

export function buildInitialChunks(): DocumentChunk[] {
  const LINES_PER_CHUNK = 640;
  
  return CHUNK_METADATA.map((meta, idx) => {
    const startLine = idx * LINES_PER_CHUNK + 1;
    const endLine = (idx + 1) * LINES_PER_CHUNK;
    const parts = generatePartsForChunk(meta.index);

    return {
      id: `chunk-${meta.index}`,
      chunkIndex: meta.index,
      title: meta.title,
      subsystemCategory: meta.category,
      startLine,
      endLine,
      partCount: parts.length,
      parts,
      status: meta.status,
      assignedReviewer: meta.reviewer,
      redactionsCount: idx === 0 ? 5 : idx === 1 ? 7 : idx === 2 ? 4 : 2,
    };
  });
}

// Initial pre-configured redactions for Chunk 1, Chunk 2, and Chunk 3
export function buildInitialRedactions(): RedactionItem[] {
  return [
    {
      id: 'redact-01',
      chunkId: 'chunk-1',
      lineIndex: 12,
      globalLineNumber: 13,
      jsonPath: 'parts[0].serial_number',
      originalValue: 'SN-F35-BLK4-0001-ALPHA',
      redactedValue: '██████████████████████',
      code: 'CUI-SP-PRVCY',
      reviewer: 'Maj. E. Vance (USAF)',
      timestamp: '2026-10-30 09:14:22',
      justification: 'Classified airframe serial allocation reveals build lot schedule.',
      isApplied: true,
    },
    {
      id: 'redact-02',
      chunkId: 'chunk-1',
      lineIndex: 18,
      globalLineNumber: 19,
      jsonPath: 'parts[0].operating_band_or_frequency',
      originalValue: '8.500 GHz - 12.000 GHz X/Ku',
      redactedValue: '███████████████████████████',
      code: 'IL6-OPSEC-01',
      reviewer: 'Maj. E. Vance (USAF)',
      timestamp: '2026-10-30 09:18:05',
      justification: 'Exact operating radar RF bandwidth is restricted under DoD IL6 OpSec directive.',
      isApplied: true,
    },
    {
      id: 'redact-03',
      chunkId: 'chunk-1',
      lineIndex: 22,
      globalLineNumber: 23,
      jsonPath: 'parts[0].firmware_crypt_hash',
      originalValue: 'SHA256:7f8a9000000e91b4092b',
      redactedValue: '██████████████████████████',
      code: 'NOFORN-REL-USA',
      reviewer: 'Maj. E. Vance (USAF)',
      timestamp: '2026-10-30 09:25:40',
      justification: 'Cryptographic hash exposes flight control binary checksum.',
      isApplied: true,
    },
    {
      id: 'redact-04',
      chunkId: 'chunk-1',
      lineIndex: 26,
      globalLineNumber: 27,
      jsonPath: 'parts[0].supplier_restricted_cage',
      originalValue: 'CAGE-NORTHROP-8400',
      redactedValue: '██████████████████',
      code: 'ITAR-CAT8-SEC4',
      reviewer: 'Maj. E. Vance (USAF)',
      timestamp: '2026-10-30 09:30:11',
      justification: 'Tier-1 defense contractor CAGE code identifies sensitive domestic supplier.',
      isApplied: true,
    },
    {
      id: 'redact-05',
      chunkId: 'chunk-1',
      lineIndex: 45,
      globalLineNumber: 46,
      jsonPath: 'parts[2].serial_number',
      originalValue: 'SN-F35-BLK4-0003-CHARLIE',
      redactedValue: '████████████████████████',
      code: 'CUI-SP-PRVCY',
      reviewer: 'Maj. E. Vance (USAF)',
      timestamp: '2026-10-30 10:02:18',
      justification: 'CUI Privacy standard redaction.',
      isApplied: true,
    },
    // Chunk 2 redactions
    {
      id: 'redact-06',
      chunkId: 'chunk-2',
      lineIndex: 14,
      globalLineNumber: 654,
      jsonPath: 'parts[0].operating_band_or_frequency',
      originalValue: '8.900 GHz - 12.300 GHz X/Ku',
      redactedValue: '███████████████████████████',
      code: 'IL6-OPSEC-01',
      reviewer: 'C. Hayes (Sensors Lead)',
      timestamp: '2026-10-30 11:15:00',
      justification: 'AESA pulse repetition and X-band frequency agility threshold.',
      isApplied: true,
    },
    {
      id: 'redact-07',
      chunkId: 'chunk-2',
      lineIndex: 18,
      globalLineNumber: 658,
      jsonPath: 'parts[0].firmware_crypt_hash',
      originalValue: 'SHA256:7f8a9007a69e91b4092b',
      redactedValue: '██████████████████████████',
      code: 'NOFORN-REL-USA',
      reviewer: 'C. Hayes (Sensors Lead)',
      timestamp: '2026-10-30 11:21:44',
      justification: 'Beamforming encryption boot seed.',
      isApplied: true,
    },
    {
      id: 'redact-08',
      chunkId: 'chunk-2',
      lineIndex: 22,
      globalLineNumber: 662,
      jsonPath: 'parts[0].supplier_restricted_cage',
      originalValue: 'CAGE-RAYTHEON-8400',
      redactedValue: '██████████████████',
      code: 'FOUO-EXPORT-RESTRICT',
      reviewer: 'C. Hayes (Sensors Lead)',
      timestamp: '2026-10-30 11:30:19',
      justification: 'Monopulse receiver supply chain restriction.',
      isApplied: true,
    }
  ];
}
