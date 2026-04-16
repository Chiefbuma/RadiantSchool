import React from 'react';
import { Button } from '../ui/button';

interface PortalPageProps {
  title: string;
  subtitle?: string;
  type: 'table' | 'form' | 'info';
  data?: any[];
  columns?: string[];
  formFields?: { label: string; placeholder: string; type?: string; hint?: string }[];
  actionLabel?: string;
}

export default function PortalPage({ 
  title, 
  subtitle, 
  type, 
  data = [], 
  columns = [], 
  formFields = [], 
  actionLabel = 'Submit' 
}: PortalPageProps) {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-sm sm:text-lg font-bold text-ink-tech mb-2 leading-tight uppercase tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-primary-ocean font-bold text-[10px] sm:text-sm italic">{subtitle}</p>
        )}
      </div>

      {type === 'form' && (
        <div className="max-w-4xl border border-gray-300 bg-white p-4 sm:p-8 shadow-sm">
          <div className="border-b border-gray-800 pb-2 mb-6">
            <p className="text-[10px] sm:text-sm font-bold italic text-gray-700">Please fill in the required details below.</p>
          </div>

          <form className="space-y-6 max-w-2xl" onSubmit={(e) => e.preventDefault()}>
            {formFields.map((field, idx) => (
              <div key={idx} className="flex flex-col md:grid md:grid-cols-3 md:items-start gap-2 md:gap-4">
                <label className="text-xs sm:text-sm font-bold text-gray-700">{field.label}:</label>
                <div className="md:col-span-1">
                  <input 
                    type={field.type || 'text'} 
                    placeholder={field.placeholder}
                    className="border border-gray-400 p-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary-ocean" 
                  />
                </div>
                {field.hint && (
                  <span className="text-[10px] sm:text-sm italic text-gray-600 font-medium leading-tight">{field.hint}</span>
                )}
              </div>
            ))}

            <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
              <div className="md:col-start-2">
                <Button 
                  type="submit"
                  className="bg-gray-100 border border-gray-400 text-ink-tech hover:bg-gray-200 rounded-none px-8 py-2 h-auto text-xs sm:text-sm font-bold shadow-sm w-full md:w-auto"
                >
                  {actionLabel}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {type === 'table' && (
        <div className="border border-gray-300 bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-800">
                {columns.map((col, idx) => (
                  <th key={idx} className="p-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-700 border-r border-gray-300 last:border-r-0">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className="p-3 text-[10px] sm:text-sm font-medium text-gray-600 border-r border-gray-200 last:border-r-0">
                        {row[col.toLowerCase().replace(/ /g, '_')] || row[col] || '-'}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center text-gray-400 italic text-sm">
                    No records found in this section.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {type === 'info' && (
        <div className="max-w-4xl border border-gray-300 bg-white p-6 sm:p-10 shadow-sm">
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-gray-700 leading-relaxed">
              This module is currently being populated with official records. Please check back later for updated information regarding your academic status.
            </p>
            <div className="mt-8 p-4 bg-blue-50 border-l-4 border-primary-ocean">
              <p className="text-xs font-bold text-primary-ocean uppercase tracking-widest mb-2">Notice</p>
              <p className="text-xs text-gray-600 italic">
                For urgent inquiries, please contact the Registrar's office or visit the ICT Centre.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
