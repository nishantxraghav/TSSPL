import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2, X } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { useApp } from '@/context/AppContext';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface ChecklistForm {
  title: string;
  description: string;
}

export function AdminBGVChecklist() {
  const { bgvChecklist, addChecklistItem, deleteChecklistItem } = useApp();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChecklistForm>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const onSubmit = async (data: ChecklistForm) => {
    await addChecklistItem({
      id: '',
      title: data.title,
      description: data.description,
      createdAt: new Date().toISOString(),
    });
    toast.success('Checklist item added!');
    reset();
  };

  const handleDelete = (id: string) => {
    deleteChecklistItem(id);
    toast.success('Checklist item removed.');
    setDeleteId(null);
  };

  return (
    <div className="p-6">
      <TopBar title="BGV Checklist Manager" breadcrumb={['Admin', 'BGV Checklist']} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 h-fit">
          <h3 className="font-syne font-bold text-slate-800 text-base mb-4">Add New Check</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Check Title *</label>
              <input
                {...register('title', { required: 'Title is required' })}
                placeholder="e.g. Identity Verification"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
              />
              {errors.title && <p className="text-rose-500 text-xs mt-1 font-jakarta">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Description *</label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={3}
                placeholder="What does this check verify?"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] resize-none"
              />
              {errors.description && <p className="text-rose-500 text-xs mt-1 font-jakarta">{errors.description.message}</p>}
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white py-2.5 rounded-lg text-sm font-jakarta font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Check
            </button>
          </form>
        </div>

        {/* Checklist Items */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-syne font-bold text-slate-800">Active Checklist Items</h3>
            <span className="text-xs text-slate-400 font-jakarta bg-slate-100 px-2 py-1 rounded-full">{bgvChecklist.length} items</span>
          </div>

          {bgvChecklist.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No checklist items"
              description="Add BGV check items that will appear as checkboxes on the employee submission form."
            />
          ) : (
            <div className="p-4 space-y-3">
              {bgvChecklist.map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#2563EB]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[#2563EB] text-xs font-bold">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-syne font-bold text-slate-800 text-sm">{item.title}</div>
                    <div className="text-slate-500 text-xs font-jakarta mt-0.5">{item.description}</div>
                    <div className="text-slate-300 text-xs font-jakarta mt-1">Added {formatDate(item.createdAt)}</div>
                  </div>
                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-rose-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <h3 className="font-syne font-bold text-slate-900 text-lg mb-2">Remove Check Item?</h3>
            <p className="text-slate-500 text-sm font-jakarta mb-6">This item will no longer appear on future employee submission forms.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-jakarta font-medium hover:bg-slate-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-jakarta font-semibold">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
