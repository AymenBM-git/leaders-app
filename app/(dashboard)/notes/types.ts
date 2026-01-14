export interface XmlHeaderData {
  iuense?: string;
  libens?: string; // Teacher Name
  codeeetab?: string;
  libeetab?: string; // School Name
  codeperiodexam?: string;
  libperiodexam?: string; // Period (e.g., Trimester 1)
  codeclass?: string;
  libeclass?: string; // Class Name
  codematiere?: string;
  libematier?: string; // Subject Name
  nbrclass?: string;
  codedre?: string;
  drear?: string;
  nbrEleve?: string;
  codedisc?: string;
  libedisc?: string;
}

// Definition of an exam column (e.g., Control 1, Synthesis)
export interface TypeEpr {
  CODEMATI: number;
  CODETYPEMATI: number;
  CODETYPEEPRE: number; // 30 = Control, 40 = Synthesis
  NUMEEPRE: number; // 1, 2...
  NOTEEPRE: string; // Average? Usually placeholder in header
  CODEETAB: number;
  abretypeeprear: string; // "D.C.", "D.S."
  libTypeEpr: string; // Full label
  libeMat: string;
}

// A single grade entry in the XML (one student, one exam)
export interface NoteElev {
  numOrdre: number;
  prenomnom: string;
  CODENIVE: number;
  CODEMATI: number;
  CODETYPEMATI: number;
  CODEPERIEXAM: number;
  CODETYPEEPRE: number;
  NUMEEPRE: number;
  IDENELEV: string; // Unique Student ID
  NOTEEPRE: string; // The grade value (e.g. "15.50" or "--.--")
  CODEETAB: number;
  abretypeeprear: string;
  libTypeEpr: string;
  prenomtute: string;
  obseprof: string; // Teacher observation
}

// The pivoted structure for the UI
export interface StudentRow {
  id: string; // IDENELEV
  order: number; // numOrdre
  name: string; // prenomnom
  guardian: string; // prenomtute
  observation: string; // obseprof (taken from first entry)
  grades: {
    [key: string]: string; // key = "CODETYPEEPRE_NUMEEPRE", value = NOTEEPRE
  };
  originalEntries: NoteElev[]; // Keep original data to reconstruct XML
}

export interface ParsedData {
  header: XmlHeaderData;
  examTypes: TypeEpr[];
  students: StudentRow[];
}

// --- New Types for File Tree ---

export interface FileNode {
  id: string;
  name: string;
  displayName?: string; // Optional display name (e.g. Class Name)
  type: 'folder' | 'file';
  children?: FileNode[];
  fileObject?: File; // Only if type is 'file'
  path: string;
  handle?: any; // FileSystemHandle for saving back to disk
}
