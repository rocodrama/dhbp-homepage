import { useState } from 'react'
import NameInput from './NameInput'

export default function TeamSplit() {
  const [names, setNames] = useState([])
  const [teamCount, setTeamCount] = useState(2)
  const [teams, setTeams] = useState(null)

  const split = () => {
    if (names.length < teamCount) {
      alert('팀 수보다 참가자가 많아야 해요.')
      return
    }
    const shuffled = [...names].sort(() => Math.random() - 0.5)
    const result = Array.from({ length: teamCount }, () => [])
    shuffled.forEach((n, i) => result[i % teamCount].push(n))
    setTeams(result)
  }

  return (
    <div>
      <NameInput names={names} setNames={setNames} placeholder="참가자 이름 입력 후 추가" />
      <div className="name-input-row" style={{ maxWidth: 200 }}>
        <select value={teamCount} onChange={(e) => setTeamCount(Number(e.target.value))}>
          {[2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}팀
            </option>
          ))}
        </select>
        <button className="btn-primary" onClick={split}>
          팀 나누기
        </button>
      </div>

      {teams && (
        <div className="team-grid">
          {teams.map((team, i) => (
            <div className="team-card" key={i}>
              <h4>{i + 1}팀</h4>
              {team.map((n) => (
                <div key={n} className="team-member">
                  {n}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
