'use client';

import { useState } from 'react';
import { EMAIL_TEMPLATES, EmailTemplate, renderTemplate } from './emailTemplates';

interface EmailTemplateEditorProps {
  vars: Record<string, string>;
  onSelect: (template: EmailTemplate) => void;
}

export default function EmailTemplateEditor({ vars, onSelect }: EmailTemplateEditorProps) {
  const [selectedId, setSelectedId] = useState(EMAIL_TEMPLATES[0].id);
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const base = EMAIL_TEMPLATES.find((t) => t.id === selectedId) ?? EMAIL_TEMPLATES[0];
  const edited: EmailTemplate = {
    ...base,
    subject: customSubject || base.subject,
    body: customBody || base.body,
  };
  const preview = renderTemplate(edited, vars);

  const handleSelectTemplate = (id: string) => {
    setSelectedId(id);
    setCustomSubject('');
    setCustomBody('');
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Email Template</p>
        <div className="flex flex-wrap gap-2">
          {EMAIL_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelectTemplate(t.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                selectedId === t.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Subject</label>
        <input
          value={customSubject || base.subject}
          onChange={(e) => setCustomSubject(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Body</label>
        <textarea
          rows={6}
          value={customBody || base.body}
          onChange={(e) => setCustomBody(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
        <p className="mt-1 text-xs text-slate-400">
          Variables: {'{{groupName}}'}, {'{{recipientName}}'}, {'{{message}}'}, {'{{inviteLink}}'}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPreviewOpen(!previewOpen)}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {previewOpen ? 'Hide Preview' : 'Preview Email'}
        </button>
        <button
          type="button"
          onClick={() => onSelect(edited)}
          className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
        >
          Use Template
        </button>
      </div>

      {previewOpen && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Preview</p>
          <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Subject: {preview.subject}</p>
          <pre className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{preview.body}</pre>
        </div>
      )}
    </div>
  );
}
