import { useState } from 'react';

export const SQLViewer = ({ query, queries, title, explanation }) => {
  const [isCopied, setIsCopied] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [expandedQuery, setExpandedQuery] = useState(
    queries ? Object.keys(queries)[0] : null
  );

  const handleCopy = (queryKey) => {
    const textToCopy = query || (queryKey && queries ? queries[queryKey] : '');
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(queryKey || 'single');
    setTimeout(() => setIsCopied(null), 2000);
  };

  const highlightSql = (sql) => {
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'JOIN', 'INNER', 'JOIN',
      'GROUP', 'BY', 'ORDER', 'BY', 'LIMIT', 'OFFSET', 'ON', 'AND', 'OR',
      'AS', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'DATE_TRUNC', 'CASE',
      'WHEN', 'THEN', 'ELSE', 'END', 'IN', 'NOT', 'IS', 'NULL', 'DISTINCT',
    ];

    let highlightedSql = sql;

    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlightedSql = highlightedSql.replace(
        regex,
        `<span class="text-cyan-400 font-semibold">${keyword}</span>`
      );
    });

    highlightedSql = highlightedSql.replace(
      /'([^']*)'/g,
      '<span class="text-emerald-400">\'$1\'</span>'
    );

    highlightedSql = highlightedSql.replace(
      /\b(\d+)\b/g,
      '<span class="text-orange-400">$1</span>'
    );

    highlightedSql = highlightedSql.replace(
      /([a-zA-Z_]\w*)\.([a-zA-Z_]\w*)/g,
      '<span class="text-purple-400">$1</span><span class="text-slate-300">.</span><span class="text-purple-300">$2</span>'
    );

    highlightedSql = highlightedSql.replace(
      /\s+AS\s+([a-zA-Z_]\w*)/gi,
      ' <span class="text-cyan-400 font-semibold">AS</span> <span class="text-yellow-400">$1</span>'
    );

    return highlightedSql;
  };

  return (
    <div className="space-y-3">
      {query && !queries && (
        <div className="rounded-lg overflow-hidden border border-slate-700/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700/30">
            <div className="flex items-center gap-3">
              <span className="text-xl">📝</span>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  {title || 'SQL Query'}
                </h3>
                {explanation && (
                  <div className="relative">
                    <button
                      onClick={() => setShowExplanation(!showExplanation)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors mt-1 flex items-center gap-1"
                      title="Click to see query explanation"
                    >
                      💡 Explain Query
                    </button>

                    {showExplanation && (
                      <div className="absolute top-full left-0 mt-1 bg-slate-900 border border-cyan-400/30 rounded p-3 text-xs text-slate-300 max-w-sm z-50 shadow-lg">
                        {explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => handleCopy()}
              className={`px-3 py-1 text-xs rounded transition-all flex items-center gap-1 border ${
                isCopied === 'single'
                  ? 'bg-green-500/20 border-green-400/50 text-green-300'
                  : 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/30'
              }`}
            >
              {isCopied === 'single' ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-48 p-4 font-mono text-sm leading-relaxed">
            <pre>
              <code dangerouslySetInnerHTML={{ __html: highlightSql(query) }} />
            </pre>
          </div>
        </div>
      )}

      {queries && !query &&
        Object.keys(queries).map((queryKey) => (
          <div
            key={queryKey}
            className="rounded-lg overflow-hidden border border-slate-700/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50"
          >
            <button
              onClick={() =>
                setExpandedQuery(
                  expandedQuery === queryKey ? null : queryKey
                )
              }
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700/30 hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-3 text-left">
                <span className="text-xl">📝</span>
                <span className="text-white font-semibold text-sm">
                  {queryKey}
                </span>
              </div>
              <span className="text-slate-400">
                {expandedQuery === queryKey ? '▼' : '▶'}
              </span>
            </button>

            {expandedQuery === queryKey && (
              <>
                <div className="flex items-center justify-between px-4 py-2 bg-slate-700/20 border-b border-slate-700/30">
                  <button
                    onClick={() => handleCopy(queryKey)}
                    className={`px-3 py-1 text-xs rounded transition-all flex items-center gap-1 border ${
                      isCopied === queryKey
                        ? 'bg-green-500/20 border-green-400/50 text-green-300'
                        : 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/30'
                    }`}
                  >
                    {isCopied === queryKey ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
                <div className="overflow-x-auto overflow-y-auto max-h-48 p-4 font-mono text-sm leading-relaxed">
                  <pre>
                    <code
                      dangerouslySetInnerHTML={{
                        __html: highlightSql(queries[queryKey]),
                      }}
                    />
                  </pre>
                </div>
              </>
            )}
          </div>
        ))}
    </div>
  );
};
