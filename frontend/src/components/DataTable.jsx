export function DataTable({
  columns,
  data,
  title,
  emptyMessage = 'No data available',
  rowAction,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-700/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
      {title && (
        <div className="px-6 py-4 border-b border-slate-700/30 bg-slate-800/30">
          <h3 className="text-white font-semibold">{title}</h3>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/30 bg-slate-800/50">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider ${
                    column.align === 'center'
                      ? 'text-center'
                      : column.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                  }`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  onClick={() => rowAction?.(row)}
                  className={`border-b border-slate-700/20 transition-all duration-200 ${
                    rowAction
                      ? 'hover:bg-slate-700/30 cursor-pointer'
                      : 'hover:bg-slate-700/20'
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={`${row.id || idx}-${String(column.key)}`}
                      className={`px-6 py-4 text-sm text-slate-300 ${
                        column.align === 'center'
                          ? 'text-center'
                          : column.align === 'right'
                            ? 'text-right'
                            : 'text-left'
                      }`}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-slate-400 text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
