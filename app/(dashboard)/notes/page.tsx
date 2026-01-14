"use client"
import React, { useState, useCallback } from 'react';
import { Upload, Save, FolderOpen as FolderIcon, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { parseEduservXML, generateEduservXML, downloadXML } from '../../../services/xmlService';
import type { ParsedData, FileNode } from './types';
import { HeaderInfo } from '../../../components/notes/HeaderInfo';
import { GradesEditor } from '../../../components/notes/GradesEditor';
import { FileTree } from '../../../components/notes/FileTree';

const App: React.FC = () => {
  // Navigation State
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [currentFileNode, setCurrentFileNode] = useState<FileNode | null>(null); // Track full node for handle access
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Content State
  const [data, setData] = useState<ParsedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen] = useState(true);

  // --- File System Logic (Modern API) ---

  const handleOpenFolder = async () => {
    // @ts-ignore - Check for API support
    if (!window.showDirectoryPicker) {
        setError("المتصفح الخاص بك لا يدعم خاصية تعديل الملفات مباشرة. يرجى استخدام Chrome أو Edge.");
        return;
    }

    try {
        // @ts-ignore
        const dirHandle = await window.showDirectoryPicker();
        setIsLoadingTree(true);
        setFileTree([]);
        setError(null);
        setData(null);
        setCurrentFileNode(null);
        setSelectedFileId(null);

        // Recursive function to build tree from handles
        const buildTree = async (handle: any, pathPrefix: string = ""): Promise<FileNode[]> => {
            const nodes: FileNode[] = [];
            
            for await (const entry of handle.values()) {
                const currentPath = pathPrefix ? `${pathPrefix}/${entry.name}` : entry.name;
                
                if (entry.kind === 'file') {
                     if (entry.name.toLowerCase().endsWith('.xml')) {
                        const file = await entry.getFile();
                        const text = await file.text();
                        
                        // Extract class name
                        const match = text.match(/<libeclass>(.*?)<\/libeclass>/);
                        const className = match ? match[1].trim() : entry.name;

                        nodes.push({
                            id: currentPath,
                            name: entry.name,
                            displayName: className,
                            type: 'file',
                            path: currentPath,
                            handle: entry,
                            fileObject: file
                        });
                     }
                } else if (entry.kind === 'directory') {
                    const children = await buildTree(entry, currentPath);
                    // Only add folder if it has content (optional, keeping it clean)
                    if (children.length > 0) {
                        nodes.push({
                            id: currentPath,
                            name: entry.name,
                            type: 'folder',
                            path: currentPath,
                            children: children,
                            handle: entry
                        });
                    }
                }
            }

             // Sort: Folders first, then files by display name
             return nodes.sort((a, b) => {
                if (a.type === b.type) {
                    const nameA = a.displayName || a.name;
                    const nameB = b.displayName || b.name;
                    return nameA.localeCompare(nameB);
                }
                return a.type === 'folder' ? -1 : 1;
              });
        };

        const tree = await buildTree(dirHandle);
        setFileTree(tree);

    } catch (err: any) {
        if (err.name !== 'AbortError') {
            console.error(err);
            setError("حدث خطأ أثناء قراءة المجلد.");
        }
    } finally {
        setIsLoadingTree(false);
    }
  };

  const loadFile = async (fileNode: FileNode) => {
    setError(null);
    setSaveSuccess(false);
    setSelectedFileId(fileNode.id);

    try {
        let file = fileNode.fileObject;

        // If using File System Access API, get the fresh file reference from disk
        // This ensures that if we saved changes, we load the updated content
        if (fileNode.handle) {
            file = await fileNode.handle.getFile();
        }

        if (!file) return;

        // Update current tracking node with the fresh file object
        setCurrentFileNode({ ...fileNode, fileObject: file });

        const text = await file.text();
        const parsed = parseEduservXML(text);
        setData(parsed);
    } catch (err) {
        console.error(err);
        setError(`خطأ في قراءة الملف: ${fileNode.name}`);
        setData(null);
    }
  };

  // --- Editor Logic ---

  const handleUpdateStudent = useCallback((studentId: string, field: string, value: string, gradeKey?: string) => {
    setData((prev) => {
      if (!prev) return null;

      const updatedStudents = prev.students.map((student) => {
        if (student.id !== studentId) return student;

        if (field === 'observation') {
          return { ...student, observation: value };
        } else if (field === 'grade' && gradeKey) {
          return {
            ...student,
            grades: { ...student.grades, [gradeKey]: value }
          };
        }
        return student;
      });

      return { ...prev, students: updatedStudents };
    });
    setSaveSuccess(false); // Reset success state on edit
  }, []);

  const handleSave = async () => {
    if (!data || !currentFileNode) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const xmlString = generateEduservXML(data);
      
      if (currentFileNode.handle) {
          // Write directly to file handle
          const writable = await currentFileNode.handle.createWritable();
          await writable.write(xmlString);
          await writable.close();
          setSaveSuccess(true);
          
          // Update the fileObject in memory so parsing again works without reload
          // (Though we already have the data in state, this is for consistency)
          const newFile = await currentFileNode.handle.getFile();
          setCurrentFileNode({ ...currentFileNode, fileObject: newFile });

      } else {
          // Fallback if no handle (should not happen in this flow)
          downloadXML(xmlString, currentFileNode.name);
      }
    } catch (err) {
      console.error(err);
      setError("خطأ أثناء حفظ الملف. تأكد من أن الملف غير مفتوح في برنامج آخر.");
    } finally {
      setIsSaving(false);
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* Top Bar */}
      <header className="bg-slate-900 text-white shadow-md p-3 flex-shrink-0 z-20">
        <div className="flex justify-between items-center px-4" dir="rtl">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600 p-1.5 rounded-lg">
               <FolderIcon size={20} className="text-white" />
             </div>
             <div>
                <h1 className="text-lg font-bold">محرر Eduserv</h1>
             </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
                onClick={handleOpenFolder}
                className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-md shadow flex items-center gap-2 transition-colors text-sm"
                disabled={isLoadingTree}
            >
                {isLoadingTree ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                <span>{isLoadingTree ? 'جاري التحميل...' : 'فتح مجلد'}</span>
            </button>
            
            {data && (
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`
                        px-3 py-1.5 rounded-md shadow flex items-center gap-2 transition-colors text-sm min-w-[120px] justify-center
                        ${saveSuccess ? 'bg-green-600 hover:bg-green-500' : 'bg-blue-600 hover:bg-blue-500'}
                        ${isSaving ? 'opacity-70 cursor-wait' : ''}
                        text-white
                    `}
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : (saveSuccess ? <CheckCircle size={16} /> : <Save size={16} />)}
                    <span>{isSaving ? 'جاري الحفظ...' : (saveSuccess ? 'تم الحفظ' : 'حفظ التعديلات')}</span>
                </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout - Split View */}
      <div className="flex flex-1 overflow-hidden flex-row-reverse">
        
        {/* Left Main Content (Editor) */}
        <main className="flex-1 overflow-hidden relative flex flex-col bg-slate-50">
            
            {/* Error Message */}
            {error && (
                <div className="absolute top-4 left-4 right-4 z-50 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg animate-fade-in flex items-start gap-3" dir="rtl">
                    <AlertTriangle size={24} className="mt-0.5" />
                    <div>
                        <p className="font-bold">تنبيه</p>
                        <p>{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="mr-auto text-red-500 hover:text-red-700">✕</button>
                </div>
            )}

            {/* Empty State */}
            {!data && !error && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
                    <div className="bg-slate-200 p-6 rounded-full">
                        <a href="#" onClick={handleOpenFolder}>
                            <FolderIcon size={48} className="opacity-40" />
                        </a>
                    </div>
                    <div className="text-center" dir="rtl">
                        <p className="text-lg font-medium text-slate-600">الرجاء اختيار ملف من القائمة اليمنى</p>
                        <p className="text-sm mt-1">يجب فتح المجلد أولاً لتتمكن من التنقل بين الملفات وحفظها</p>
                    </div>
                </div>
            )}

            {/* Editor Content */}
            {data && (
                <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
                    <div className="max-w-6xl mx-auto space-y-6">
                        <HeaderInfo data={data.header} />
                        <div className="h-[calc(100vh-320px)] min-h-[400px]">
                            <GradesEditor 
                                students={data.students} 
                                examTypes={data.examTypes} 
                                onUpdateStudent={handleUpdateStudent} 
                            />
                        </div>
                    </div>
                </div>
            )}
        </main>

        {/* Right Sidebar (Tree) */}
        <aside 
            className={`
                bg-white border-l border-slate-200 flex flex-col transition-all duration-300
                ${isSidebarOpen ? 'w-72' : 'w-0 opacity-0 overflow-hidden'}
            `}
            dir="rtl"
        >
            <div className="p-3 bg-slate-100 border-b border-slate-200 font-bold text-slate-700 text-sm flex justify-between items-center">
                <span>ملفات المجلد</span>
                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full text-slate-500">
                    {fileTree.length > 0 ? 'جاهز' : 'فارغ'}
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                {isLoadingTree && (
                    <div className="flex flex-col items-center justify-center pt-10 text-slate-400 gap-2">
                        <Loader2 size={24} className="animate-spin text-blue-500" />
                        <span className="text-sm">جاري قراءة الملفات...</span>
                    </div>
                )}
                
                {!isLoadingTree && fileTree.length === 0 && (
                    <div className="text-center mt-10 text-slate-400 text-sm px-4">
                        <p>اضغط على "فتح مجلد" لاختيار مجلد العمل.</p>
                        <p className="text-xs text-slate-400 mt-2">ملاحظة: يتطلب متصفح كروم أو إيدج لدعم الحفظ المباشر.</p>
                    </div>
                )}

                {!isLoadingTree && fileTree.length > 0 && (
                    <FileTree 
                        nodes={fileTree} 
                        selectedFileId={selectedFileId} 
                        onSelectFile={loadFile} 
                    />
                )}
            </div>
        </aside>

      </div>

    </div>
  );
};

export default App;
