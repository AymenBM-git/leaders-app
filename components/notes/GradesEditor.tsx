import React from 'react';
import type { StudentRow, TypeEpr } from '../types';
import { AlertCircle } from 'lucide-react';

interface Props {
  students: StudentRow[];
  examTypes: TypeEpr[];
  onUpdateStudent: (studentId: string, field: string, value: string, gradeKey?: string) => void;
}

export const GradesEditor: React.FC<Props> = ({ students, examTypes, onUpdateStudent }) => {

  const getExamKey = (exam: TypeEpr) => `${exam.CODETYPEEPRE}_${exam.NUMEEPRE}`;

  // Function to format grade on blur
  const handleBlur = (studentId: string, key: string, value: string) => {
    if (!value.trim() || value === '--.--') return;

    // Replace comma with dot for flexibility (15,5 -> 15.5)
    const normalizedValue = value.replace(',', '.');
    const num = parseFloat(normalizedValue);

    if (!isNaN(num)) {
      // Format to 2 decimal places first (e.g., 9 -> "9.00")
      let formatted = num.toFixed(2);
      
      // Add leading zero if less than 10 to ensure format "09.00"
      if (num < 10) {
        formatted = formatted.padStart(5, '0');
      }

      // Update only if different to avoid loops/unnecessary renders
      if (formatted !== value) {
        onUpdateStudent(studentId, 'grade', formatted, key);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 flex flex-col h-full">
      <div className="overflow-x-auto" dir="rtl">
        <table className="w-full text-sm text-right">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b-2 border-slate-200">
            <tr>
              <th className="p-3 w-16 text-center border-l border-slate-200 sticky right-0 bg-slate-100 z-10">ع.ر</th>
              <th className="p-3 min-w-[200px] border-l border-slate-200 sticky right-16 bg-slate-100 z-10">الإسم و اللقب</th>
              
              {/* Dynamic Exam Columns */}
              {examTypes.map((exam) => (
                <th key={getExamKey(exam)} className="p-3 w-24 text-center border-l border-slate-200">
                  <div className="flex flex-col items-center">
                    <span>{exam.abretypeeprear}</span>
                    <span className="text-xs font-normal text-slate-500">{exam.libTypeEpr}</span>
                  </div>
                </th>
              ))}

              <th className="p-3 min-w-[250px] border-l border-slate-200">ملاحظات الأستاذ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((student, idx) => (
              <tr 
                key={student.id} 
                className={`hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
              >
                {/* Order Number */}
                <td className="p-3 text-center border-l border-slate-200 font-mono font-medium text-slate-500 sticky right-0 bg-inherit z-10">
                  {student.order}
                </td>

                {/* Name & Guardian */}
                <td className="p-3 border-l border-slate-200 sticky right-16 bg-inherit z-10">
                  <div className="font-bold text-slate-800">{student.name}</div>
                  <div className="text-xs text-slate-400 mt-1">ولي الأمر: {student.guardian}</div>
                </td>

                {/* Grade Inputs */}
                {examTypes.map((exam) => {
                  const key = getExamKey(exam);
                  const val = student.grades[key] || '';
                  
                  const numVal = parseFloat(val);
                  const isNumber = !isNaN(numVal);
                  
                  // Validation Logic
                  const isOutOfRange = !isNumber || (numVal < 0 || numVal > 20);
                  const isFailing = isNumber && numVal < 10 && !isOutOfRange;
                  const isPlaceholder = val === '--.--' || val === '';
                  
                  return (
                    <td key={key} className="p-2 border-l border-slate-200 text-center relative">
                      <input
                        type="text"
                        value={val}
                        title={isOutOfRange ? "المعدل يجب أن يكون بين 0 و 20" : ""}
                        onChange={(e) => onUpdateStudent(student.id, 'grade', e.target.value, key)}
                        onBlur={(e) => handleBlur(student.id, key, e.target.value)}
                        className={`w-full text-center p-1 rounded border focus:ring-2 focus:outline-none font-mono font-semibold transition-colors
                          ${isOutOfRange 
                              ? 'text-red-700 bg-red-100 border-red-500 ring-1 ring-red-500 focus:ring-red-600 font-bold' 
                              : ''}
                          ${!isOutOfRange && isFailing 
                              ? 'text-red-600 border-red-200 bg-red-50 focus:ring-red-200' 
                              : ''}
                          ${!isOutOfRange && !isFailing && !isPlaceholder 
                              ? 'text-slate-800 border-slate-300 focus:ring-blue-200' 
                              : ''}
                          ${isPlaceholder 
                              ? 'text-gray-400 bg-gray-50 border-gray-200' 
                              : ''}
                        `}
                      />
                       {/* Warning Icon for errors */}
                       {isOutOfRange && (
                        <div className="absolute top-1 right-1 pointer-events-none">
                            <AlertCircle size={12} className="text-red-600" />
                        </div>
                      )}
                    </td>
                  );
                })}

                {/* Observation */}
                <td className="p-2 border-l border-slate-200">
                   <input
                        type="text"
                        value={student.observation}
                        onChange={(e) => onUpdateStudent(student.id, 'observation', e.target.value)}
                        className="w-full text-right p-1.5 rounded border border-slate-300 text-slate-700 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                      />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {students.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-gray-400">
          <AlertCircle size={48} className="mb-4" />
          <p>لا توجد بيانات للعرض</p>
        </div>
      )}
    </div>
  );
};
