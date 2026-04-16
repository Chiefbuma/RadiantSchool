import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Save, 
  X, 
  Upload, 
  ChevronDown,
  FileText,
  MoreHorizontal
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { toast } from 'sonner';

export type AdminFieldType = 'text' | 'number' | 'date' | 'select' | 'radio' | 'checkbox' | 'file' | 'textarea';

export interface AdminFormField {
  label: string;
  key: string;
  type: AdminFieldType;
  placeholder?: string;
  options?: string[]; // For select and radio
  hint?: string;
}

interface AdminPortalPageProps {
  title: string;
  subtitle?: string;
  columns: string[];
  initialData: any[];
  formFields: AdminFormField[];
}

export default function AdminPortalPage({ 
  title, 
  subtitle, 
  columns = [], 
  initialData = [], 
  formFields = [], 
}: AdminPortalPageProps) {
  const [data, setData] = useState<any[]>(initialData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAdd = () => {
    setEditingIndex(null);
    const emptyForm = formFields.reduce((acc, field) => {
      if (field.type === 'checkbox') return { ...acc, [field.key]: false };
      return { ...acc, [field.key]: '' };
    }, {});
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    setFormData({ ...data[index] });
    setIsDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    const newData = [...data];
    newData.splice(index, 1);
    setData(newData);
    toast.error("Record deleted successfully");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndex !== null) {
      const newData = [...data];
      newData[editingIndex] = formData;
      setData(newData);
      toast.success("Record updated successfully");
    } else {
      setData([...data, formData]);
      toast.success("New record added successfully");
    }
    setIsDialogOpen(false);
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const renderField = (field: AdminFormField) => {
    switch (field.type) {
      case 'select':
        return (
          <div className="relative">
            <select
              value={formData[field.key] || ''}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-ocean appearance-none bg-white"
              required
            >
              <option value="" disabled>{field.placeholder || `Select ${field.label}`}</option>
              {field.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        );
      case 'radio':
        return (
          <div className="flex flex-wrap gap-4 pt-1">
            {field.options?.map(opt => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name={field.key}
                  value={opt}
                  checked={formData[field.key] === opt}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  className="w-4 h-4 text-primary-ocean border-gray-300 focus:ring-primary-ocean"
                />
                <span className="text-sm text-gray-700 group-hover:text-primary-ocean transition-colors">{opt}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={!!formData[field.key]}
              onChange={(e) => handleInputChange(field.key, e.target.checked)}
              className="w-4 h-4 text-primary-ocean border-gray-300 rounded focus:ring-primary-ocean"
            />
            <span className="text-sm text-gray-700">{field.placeholder || 'Enable this option'}</span>
          </label>
        );
      case 'file':
        return (
          <div className="space-y-2">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 p-4 text-center hover:border-primary-ocean cursor-pointer transition-colors bg-gray-50 group"
            >
              <Upload className="w-6 h-6 mx-auto text-gray-400 group-hover:text-primary-ocean mb-2" />
              <p className="text-xs text-gray-500 font-medium">
                {formData[field.key] ? `File: ${formData[field.key]}` : 'Click to upload or drag and drop'}
              </p>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                onChange={(e) => handleInputChange(field.key, e.target.files?.[0]?.name || '')}
              />
            </div>
          </div>
        );
      case 'textarea':
        return (
          <textarea
            value={formData[field.key] || ''}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-ocean"
          />
        );
      default:
        return (
          <input
            type={field.type}
            value={formData[field.key] || ''}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-ocean"
            required
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-ink-tech uppercase tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-1 font-medium italic">{subtitle}</p>}
        </div>
        <Button 
          onClick={handleOpenAdd}
          className="bg-primary-ocean hover:bg-primary-ocean/90 text-white rounded-none h-9 px-4 text-xs font-bold gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New {title.split(' ').pop()}
        </Button>
      </div>

      <div className="border border-gray-300 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                {columns.map((col) => (
                  <th key={col} className="p-3 text-[10px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 last:border-r-0">
                    {col}
                  </th>
                ))}
                <th className="p-3 text-[10px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  {columns.map((col, i) => {
                    const key = formFields.find(f => f.label === col)?.key || Object.keys(row)[i];
                    const val = row[key];
                    return (
                      <td key={i} className="p-3 text-[10px] sm:text-xs text-gray-600 font-medium border-r border-gray-200 last:border-r-0">
                        {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : val || '-'}
                      </td>
                    );
                  })}
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleOpenEdit(idx)}
                        className="text-primary-ocean hover:text-primary-ocean/80 p-1 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(idx)}
                        className="text-red-500 hover:text-red-400 p-1 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="p-12 text-center text-gray-400 italic text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-8 h-8 opacity-20" />
                      <span>No records found in this module.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-none border-gray-300 p-0 overflow-hidden">
          <DialogHeader className="bg-gray-100 p-6 border-b border-gray-200">
            <DialogTitle className="text-lg font-bold text-ink-tech uppercase tracking-tight">
              {editingIndex !== null ? `Edit ${title.split(' ').pop()}` : `Add New ${title.split(' ').pop()}`}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-medium italic">
              Please provide the required information below. Fields marked with * are mandatory.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto no-scrollbar">
            {formFields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] sm:text-xs font-bold text-gray-700 uppercase tracking-widest">
                    {field.label} <span className="text-red-500">*</span>
                  </label>
                  {field.hint && <span className="text-[9px] text-gray-400 italic">{field.hint}</span>}
                </div>
                {renderField(field)}
              </div>
            ))}
          </form>

          <DialogFooter className="bg-gray-50 p-4 border-t border-gray-200 flex sm:justify-between items-center gap-4">
            <p className="text-[10px] text-gray-400 italic hidden sm:block">
              Changes will be applied immediately to the system.
            </p>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsDialogOpen(false)}
                className="rounded-none text-xs font-bold uppercase tracking-widest flex-1 sm:flex-none border border-gray-300"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                onClick={handleSave}
                className="bg-primary-ocean hover:bg-primary-ocean/90 text-white rounded-none px-8 text-xs font-bold uppercase tracking-widest gap-2 flex-1 sm:flex-none shadow-sm"
              >
                <Save className="w-4 h-4" />
                {editingIndex !== null ? 'Update' : 'Create'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
