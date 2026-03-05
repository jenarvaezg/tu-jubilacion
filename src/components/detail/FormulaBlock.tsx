interface FormulaBlockProps {
  readonly title: string;
  readonly formula: string;
  readonly explanation: string;
}

export function FormulaBlock({ title, formula, explanation }: FormulaBlockProps) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
      <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-3 text-xs text-gray-700 font-mono leading-relaxed">
        {formula}
      </pre>
      <p className="mt-2 text-xs text-gray-600 leading-relaxed">{explanation}</p>
    </div>
  );
}
