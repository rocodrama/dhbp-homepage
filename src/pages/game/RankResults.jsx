const MEDALS = ['🥇', '🥈', '🥉']

// rows: [{ name, rank, detail }] — rank는 동점 공동 등수(1, 2, 2, 4)
export default function RankResults({ rows, targetRank }) {
  const hit = rows.filter((r) => r.rank === targetRank)

  return (
    <>
      <div className="result-banner">
        {hit.length
          ? `🎯 ${targetRank}등 — ${hit.map((r) => r.name).join(', ')}`
          : `동점이라 ${targetRank}등이 없어 😐`}
      </div>
      <div className="item-list result-table">
        {rows.map((r) => (
          <div className={'item-row' + (r.rank === targetRank ? ' rank-hit' : '')} key={r.name}>
            <span className="item-row-title">
              {MEDALS[r.rank - 1] ?? '　'} {r.rank}등 · {r.name}
            </span>
            <span className="item-row-meta">{r.detail}</span>
          </div>
        ))}
      </div>
    </>
  )
}
