import { AircraftPart, DocumentChunk, RedactionItem } from '../types';

export interface DiffLine {
  lineIndex: number;
  globalLineNumber: number;
  originalText: string;
  redactedText: string;
  indent: number;
  isRedacted: boolean;
  redactionItem?: RedactionItem;
  canRedact: boolean;
  fieldKey?: string;
  fieldValue?: string | number | boolean;
  partIndex?: number;
  partId?: string;
  isSectionHeader?: boolean;
}

export function generateDiffLines(
  chunk: DocumentChunk,
  redactions: RedactionItem[]
): DiffLine[] {
  const lines: DiffLine[] = [];
  let currentLine = chunk.startLine;

  const pushLine = (
    originalText: string,
    redactedText: string,
    indent = 0,
    extra: Partial<DiffLine> = {}
  ) => {
    lines.push({
      lineIndex: lines.length,
      globalLineNumber: currentLine++,
      originalText,
      redactedText,
      indent,
      isRedacted: !!extra.isRedacted,
      redactionItem: extra.redactionItem,
      canRedact: !!extra.canRedact,
      fieldKey: extra.fieldKey,
      fieldValue: extra.fieldValue,
      partIndex: extra.partIndex,
      partId: extra.partId,
      isSectionHeader: extra.isSectionHeader,
    });
  };

  // Chunk Header
  pushLine('{', '{', 0);
  pushLine(
    `  "manifest_document": "F35_BLOCK4_SUBSYSTEM_MANIFEST.json",`,
    `  "manifest_document": "F35_BLOCK4_SUBSYSTEM_MANIFEST.json",`,
    1
  );
  pushLine(
    `  "chunk_id": "${chunk.id}",`,
    `  "chunk_id": "${chunk.id}",`,
    1
  );
  pushLine(
    `  "chunk_index": ${chunk.chunkIndex},`,
    `  "chunk_index": ${chunk.chunkIndex},`,
    1
  );
  pushLine(
    `  "chunk_title": "${chunk.title}",`,
    `  "chunk_title": "${chunk.title}",`,
    1
  );
  pushLine(
    `  "subsystem_group": "${chunk.subsystemCategory}",`,
    `  "subsystem_group": "${chunk.subsystemCategory}",`,
    1
  );
  pushLine(
    `  "classification_banner": "SECRET // NOFORN // REL TO USA, FVEY",`,
    `  "classification_banner": "SECRET // NOFORN // REL TO USA, FVEY",`,
    1
  );
  pushLine(
    `  "total_aircraft_parts": ${chunk.parts.length},`,
    `  "total_aircraft_parts": ${chunk.parts.length},`,
    1
  );
  pushLine(`  "parts": [`, `  "parts": [`, 1);

  // Iterate over parts
  chunk.parts.forEach((part: AircraftPart, pIdx: number) => {
    const isLastPart = pIdx === chunk.parts.length - 1;
    pushLine(`    {`, `    {`, 2, { isSectionHeader: true, partIndex: pIdx, partId: part.part_id });

    const fields: Array<{ key: keyof AircraftPart; value: any; redactable: boolean }> = [
      { key: 'part_id', value: part.part_id, redactable: false },
      { key: 'nomenclature', value: part.nomenclature, redactable: false },
      { key: 'subsystem', value: part.subsystem, redactable: false },
      { key: 'nsn_national_stock_number', value: part.nsn_national_stock_number, redactable: true },
      { key: 'cage_code', value: part.cage_code, redactable: true },
      { key: 'serial_number', value: part.serial_number, redactable: true },
      { key: 'defense_classification', value: part.defense_classification, redactable: false },
      { key: 'itar_eccn_control', value: part.itar_eccn_control, redactable: true },
      { key: 'operating_band_or_frequency', value: part.operating_band_or_frequency, redactable: true },
      { key: 'mil_spec_standard', value: part.mil_spec_standard, redactable: true },
      { key: 'assembly_station', value: part.assembly_station, redactable: true },
      { key: 'firmware_crypt_hash', value: part.firmware_crypt_hash, redactable: true },
      { key: 'failure_rate_mtbf_hrs', value: part.failure_rate_mtbf_hrs, redactable: true },
      { key: 'critical_load_rating_kn', value: part.critical_load_rating_kn, redactable: true },
      { key: 'supplier_restricted_cage', value: part.supplier_restricted_cage, redactable: true },
      { key: 'opsec_review_status', value: part.opsec_review_status, redactable: false },
    ];

    // Filter out undefined values
    const validFields = fields.filter(f => f.value !== undefined);

    validFields.forEach((field, fIdx) => {
      const isLastField = fIdx === validFields.length - 1;
      const comma = isLastField ? '' : ',';
      const jsonPath = `parts[${pIdx}].${field.key}`;

      const activeRedaction = redactions.find(
        r => r.chunkId === chunk.id && r.jsonPath === jsonPath && r.isApplied
      );

      const formattedVal = typeof field.value === 'string' 
        ? `"${field.value}"`
        : `${field.value}`;

      const originalText = `      "${field.key}": ${formattedVal}${comma}`;
      
      let redactedText = originalText;
      if (activeRedaction) {
        const mask = typeof field.value === 'string'
          ? `"████████████████"`
          : `"████"`;
        redactedText = `      "${field.key}": ${mask}${comma}`;
      }

      pushLine(originalText, redactedText, 3, {
        canRedact: field.redactable,
        isRedacted: !!activeRedaction,
        redactionItem: activeRedaction,
        fieldKey: String(field.key),
        fieldValue: field.value,
        partIndex: pIdx,
        partId: part.part_id,
      });
    });

    pushLine(`    }${isLastPart ? '' : ','}`, `    }${isLastPart ? '' : ','}`, 2);
  });

  pushLine(`  ]`, `  ]`, 1);
  pushLine(`}`, `}`, 0);

  return lines;
}
