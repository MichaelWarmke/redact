export type RedactionReasonCode = 
  | 'IL6-OPSEC-01'
  | 'ITAR-CAT8-SEC4'
  | 'CUI-SP-PRVCY'
  | 'EAR99-ECCN-7A'
  | 'NOFORN-REL-USA'
  | 'MIL-STD-810H-S'
  | 'FOUO-EXPORT-RESTRICT'
  | 'CUSTOM';

export interface RedactionDefinition {
  id: string;
  code: RedactionReasonCode;
  customLabel?: string;
  description: string;
  classificationLevel: 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET' | 'CUI' | 'RESTRICTED';
  badgeColor: string;
}

export interface RedactionItem {
  id: string;
  chunkId: string;
  lineIndex: number; // 0-indexed relative to chunk
  globalLineNumber: number; // absolute line in 10,000 line file
  jsonPath: string; // e.g. "parts[4].serial_number"
  originalValue: string | number | boolean;
  redactedValue: string;
  code: RedactionReasonCode;
  customLabel?: string;
  reviewer: string;
  timestamp: string;
  justification?: string;
  isApplied: boolean;
}

export interface AircraftPart {
  part_id: string;
  nomenclature: string;
  subsystem: string;
  nsn_national_stock_number: string;
  cage_code: string;
  serial_number: string;
  defense_classification: 'SECRET' | 'CONFIDENTIAL' | 'CUI' | 'UNCLASSIFIED';
  itar_eccn_control: string;
  operating_band_or_frequency?: string;
  mil_spec_standard: string;
  assembly_station: string;
  firmware_crypt_hash?: string;
  failure_rate_mtbf_hrs: number;
  critical_load_rating_kn?: number;
  supplier_restricted_cage: string;
  opsec_review_status: 'PENDING' | 'FLAGGED' | 'CLEARED' | 'REDACTED';
}

export interface DocumentChunk {
  id: string;
  chunkIndex: number;
  title: string;
  subsystemCategory: string;
  startLine: number;
  endLine: number;
  partCount: number;
  parts: AircraftPart[];
  status: 'PENDING_REVIEW' | 'IN_REVIEW' | 'REDACTED_APPROVED' | 'REQUIRES_RECHECK';
  assignedReviewer: string;
  redactionsCount: number;
}
