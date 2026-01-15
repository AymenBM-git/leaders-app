import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import type { NoteElev, ParsedData, StudentRow, TypeEpr, XmlHeaderData } from '../components/notes/types';

const parserOptions = {
  ignoreAttributes: false,
  parseTagValue: false, // Keep everything as strings initially to preserve formatting like "05.50"
};

const builderOptions = {
  ignoreAttributes: false,
  format: true,
  indentBy: '    ',
};

export const parseEduservXML = (xmlContent: string): ParsedData => {
  const parser = new XMLParser(parserOptions);
  const jsonObj = parser.parse(xmlContent);

  const root = jsonObj.notelev_xml;
  if (!root) throw new Error("Invalid XML: Missing <notelev_xml> root.");

  // 1. Extract Header Data
  const header: XmlHeaderData = {
    iuense: root.iuense,
    libens: root.libens,
    codeeetab: root.codeeetab,
    libeetab: root.libeetab,
    codeperiodexam: root.codeperiodexam,
    libperiodexam: root.libperiodexam,
    codeclass: root.codeclass,
    libeclass: root.libeclass,
    codematiere: root.codematiere,
    libematier: root.libematier,
    nbrclass: root.nbrclass,
    codedre: root.codedre,
    drear: root.drear,
    nbrEleve: root.nbrEleve,
    codedisc: root.codedisc,
    libedisc: root.libedisc,
  };

  // 2. Extract Exam Types
  // Ensure array even if single item
  const rawTypes = Array.isArray(root.typeepr) ? root.typeepr : [root.typeepr];
  const examTypes: TypeEpr[] = rawTypes.map((t: any) => ({
    CODEMATI: Number(t.CODEMATI),
    CODETYPEMATI: Number(t.CODETYPEMATI),
    CODETYPEEPRE: Number(t.CODETYPEEPRE),
    NUMEEPRE: Number(t.NUMEEPRE),
    NOTEEPRE: t.NOTEEPRE,
    CODEETAB: Number(t.CODEETAB),
    abretypeeprear: t.abretypeeprear,
    libTypeEpr: t.libTypeEpr,
    libeMat: t.libeMat,
  }));

  // 3. Extract and Pivot Grades
  const rawGrades = Array.isArray(root.noteelev) ? root.noteelev : [root.noteelev];
  
  // Group by Student ID
  const studentsMap = new Map<string, StudentRow>();

  rawGrades.forEach((entry: any) => {
    // fast-xml-parser might parse numbers, ensure string for ID
    const studentId = String(entry.IDENELEV);
    
    if (!studentsMap.has(studentId)) {
      studentsMap.set(studentId, {
        id: studentId,
        order: Number(entry.numOrdre),
        name: entry.prenomnom,
        guardian: entry.prenomtute,
        observation: entry.obseprof,
        grades: {},
        originalEntries: [],
      });
    }

    const student = studentsMap.get(studentId)!;
    student.originalEntries.push(entry);

    // Create a key for the grade columns: "Type_Number" (e.g., "30_1" for Control 1)
    const gradeKey = `${entry.CODETYPEEPRE}_${entry.NUMEEPRE}`;
    student.grades[gradeKey] = entry.NOTEEPRE;
  });

  const students = Array.from(studentsMap.values()).sort((a, b) => a.order - b.order);

  return { header, examTypes, students };
};

export const generateEduservXML = (data: ParsedData): string => {
  const builder = new XMLBuilder(builderOptions);

  // Reconstruct the flat list of NoteElev elements from our pivoted StudentRows
  const noteelevList: NoteElev[] = [];

  data.students.forEach((student) => {
    // We iterate through the original structure definition to maintain other fields
    // (like CODENIVE, CODEMATI) which we didn't edit, but updated the grade value.
    student.originalEntries.forEach((entry) => {
      const gradeKey = `${entry.CODETYPEEPRE}_${entry.NUMEEPRE}`;
      
      // Get the current value from the edited state
      const currentGrade = student.grades[gradeKey];
      
      const updatedEntry: NoteElev = {
        ...entry,
        NOTEEPRE: currentGrade || entry.NOTEEPRE,
        obseprof: student.observation || "", // Update observation for all entries of this student
      };
      noteelevList.push(updatedEntry);
    });
  });

  // Rebuild the full object
  const xmlObj = {
    notelev_xml: {
      ...data.header,
      typeepr: data.examTypes,
      noteelev: noteelevList
    }
  };

  return builder.build(xmlObj);
};

export const downloadXML = (xmlContent: string, filename: string) => {
  const blob = new Blob([xmlContent], { type: 'text/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
