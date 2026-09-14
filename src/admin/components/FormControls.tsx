import React, { ChangeEvent, ReactElement, ReactNode, useId, useState } from 'react'

export function AdminField({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  const id = useId()
  return (
    <div className={`admin-field ${error ? 'is-invalid' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {React.cloneElement(children as ReactElement<{ id?: string }>, { id })}
      {hint && <small>{hint}</small>}
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={`admin-input ${props.className ?? ''}`} /> }
export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...props} className={`admin-textarea ${props.className ?? ''}`} /> }
export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) { return <select {...props} className={`admin-select ${props.className ?? ''}`} /> }

export function Toggle({ label, checked, onChange, disabled = false }: { label: string; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return <label className={`switch-field ${disabled ? 'is-disabled' : ''}`}><span>{label}</span><span className={`switch ${checked ? 'is-on' : ''}`}><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} aria-label={label} disabled={disabled} /></span></label>
}

export function TagsInput({ value, onChange, disabled = false }: { value: string[]; onChange: (value: string[]) => void; disabled?: boolean }) {
  const [input, setInput] = useState('')
  const addTag = () => {
    const tag = input.trim().replace(/,$/, '')
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setInput('')
  }
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.endsWith(',')) { setInput(event.target.value.slice(0, -1)); addTag(); return }
    setInput(event.target.value)
  }
  return <div className="tags-editor" role="list" aria-label="Technology tags">
    {value.map((tag) => <span className="tag-chip" role="listitem" key={tag}>{tag}<button type="button" onClick={() => onChange(value.filter((item) => item !== tag))} aria-label={`Remove ${tag}`} disabled={disabled}>×</button></span>)}
    <input value={input} onChange={handleChange} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addTag() } }} placeholder="Type and press Enter" aria-label="Add technology tag" disabled={disabled} />
  </div>
}
