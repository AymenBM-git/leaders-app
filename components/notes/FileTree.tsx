import React, { useState } from 'react';
import type { FileNode } from '../types';
import { Folder, FolderOpen, ChevronRight, ChevronDown, Table } from 'lucide-react';

interface FileTreeProps {
  nodes: FileNode[];
  selectedFileId: string | null;
  onSelectFile: (node: FileNode) => void;
  level?: number;
}

const FileTreeNode: React.FC<{
  node: FileNode;
  selectedFileId: string | null;
  onSelectFile: (node: FileNode) => void;
  level: number;
}> = ({ node, selectedFileId, onSelectFile, level }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const isSelected = node.id === selectedFileId;
  const paddingRight = `${level * 16}px`; // RTL indentation

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    } else {
      onSelectFile(node);
    }
  };

  return (
    <div>
      <div 
        onClick={handleClick}
        className={`
          flex items-center gap-2 py-1.5 px-2 cursor-pointer text-sm select-none transition-colors duration-150
          ${isSelected ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-600' : 'text-slate-700 hover:bg-slate-100'}
        `}
        style={{ paddingRight }}
        title={node.name} // Show original filename on hover
      >
        {/* Expand/Collapse Icon for Folders */}
        <div className="w-4 flex-shrink-0">
            {node.type === 'folder' && (
                isOpen ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400 rtl:rotate-180" />
            )}
        </div>

        {/* Folder/File Icon */}
        <div className={`flex-shrink-0 ${node.type === 'folder' ? 'text-amber-400' : 'text-blue-500'}`}>
          {node.type === 'folder' ? (
            isOpen ? <FolderOpen size={18} fill="currentColor" fillOpacity={0.2} /> : <Folder size={18} fill="currentColor" fillOpacity={0.2} />
          ) : (
            // Use Table icon for class files to match the "grid" look from the prompt
            <Table size={16} />
          )}
        </div>

        {/* Name (Display Class Name if available, else Filename) */}
        <span className="truncate font-medium">{node.displayName || node.name}</span>
      </div>

      {/* Children */}
      {node.type === 'folder' && isOpen && node.children && (
        <div className="border-r border-slate-200 mr-2.5">
          <FileTree 
            nodes={node.children} 
            selectedFileId={selectedFileId} 
            onSelectFile={onSelectFile} 
            level={level + 1} 
          />
        </div>
      )}
    </div>
  );
};

export const FileTree: React.FC<FileTreeProps> = ({ nodes, selectedFileId, onSelectFile, level = 0 }) => {
  return (
    <div>
      {nodes.map((node) => (
        <FileTreeNode 
          key={node.id} 
          node={node} 
          selectedFileId={selectedFileId} 
          onSelectFile={onSelectFile}
          level={level}
        />
      ))}
    </div>
  );
};
