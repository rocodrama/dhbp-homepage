import { clampRank } from './ranking'

// 몇 등이 걸릴지 미리 정해두는 드롭박스. 1등만 뽑고 끝내는 대신
// 끝까지 돌려서 나온 종합 순위에서 이 등수를 집어낸다.
export default function RankPicker({ count, rank, setRank }) {
  const max = Math.max(count, 1)
  return (
    <label className="rank-picker">
      🎯 당첨 등수
      <select value={clampRank(rank, count)} onChange={(e) => setRank(Number(e.target.value))}>
        {Array.from({ length: max }, (_, i) => (
          <option key={i} value={i + 1}>
            {i + 1}등{i + 1 === max && max > 1 ? ' (꼴등)' : ''}
          </option>
        ))}
      </select>
    </label>
  )
}
