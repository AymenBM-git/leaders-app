import React from 'react';
import type { XmlHeaderData } from './types';
import { School, User, Calendar, BookOpen } from 'lucide-react';

interface Props {
  data: XmlHeaderData;
}

export const HeaderInfo: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-gray-800">
        
        {/* School Info */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-blue-600 font-semibold mb-1">
            <School size={18} />
            <span>المؤسسة</span>
          </div>
          <div className="text-lg font-bold">{data.libeetab || '-'}</div>
          <div className="text-sm text-gray-500">{data.codeeetab}</div>
        </div>

        {/* Teacher Info */}
        <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2 text-blue-600 font-semibold mb-1">
            <User size={18} />
            <span>الأستاذ</span>
          </div>
          <div className="text-lg font-bold">{data.libens || '-'}</div>
          <div className="text-sm text-gray-500 font-mono">{data.iuense}</div>
        </div>

        {/* Class Info */}
        <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2 text-blue-600 font-semibold mb-1">
            <BookOpen size={18} />
            <span>القسم و المادة</span>
          </div>
          <div className="text-lg font-bold">{data.libeclass || '-'}</div>
          <div className="text-sm text-gray-600">{data.libematier || '-'}</div>
        </div>

        {/* Period Info */}
        <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2 text-blue-600 font-semibold mb-1">
            <Calendar size={18} />
            <span>الفترة</span>
          </div>
          <div className="text-lg font-bold text-red-600">{data.libperiodexam || '-'}</div>
          <div className="text-sm text-gray-500">عدد التلاميذ: {data.nbrEleve}</div>
        </div>

      </div>
    </div>
  );
};
