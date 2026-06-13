interface PersonProgress {
  userId: string;
  name: string;
  email: string;
  role: string;
  todo: number;
  inProgress: number;
  done: number;
  total: number;
  completionRate: number;
}

interface PersonProgressTrackerProps {
  people: PersonProgress[];
  title?: string;
  subtitle?: string;
}

export default function PersonProgressTracker({
  people,
  title = 'Person-wise Progress',
  subtitle = 'Individual completion across all team members',
}: PersonProgressTrackerProps) {
  if (people.length === 0) {
    return (
      <div className="panel">
        <div className="panel-header">
          <h2>{title}</h2>
          <p>No team members yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="person-progress-grid">
        {people.map((person) => (
          <div key={person.userId} className="person-progress-card">
            <div className="person-progress-header">
              <div>
                <strong>{person.name}</strong>
                <span className="person-email">{person.email}</span>
              </div>
              <span className={`role-pill role-${person.role.toLowerCase()}`}>{person.role}</span>
            </div>

            <div className="person-progress-stats">
              <span>To Do: {person.todo}</span>
              <span>In Progress: {person.inProgress}</span>
              <span>Done: {person.done}</span>
            </div>

            <div className="segmented-bar">
              {person.total > 0 ? (
                <>
                  {person.todo > 0 && (
                    <div
                      className="segment todo"
                      style={{ width: `${(person.todo / person.total) * 100}%` }}
                      title={`To Do: ${person.todo}`}
                    />
                  )}
                  {person.inProgress > 0 && (
                    <div
                      className="segment progress"
                      style={{ width: `${(person.inProgress / person.total) * 100}%` }}
                      title={`In Progress: ${person.inProgress}`}
                    />
                  )}
                  {person.done > 0 && (
                    <div
                      className="segment done"
                      style={{ width: `${(person.done / person.total) * 100}%` }}
                      title={`Done: ${person.done}`}
                    />
                  )}
                </>
              ) : (
                <div className="segment empty" style={{ width: '100%' }} />
              )}
            </div>

            <div className="person-progress-footer">
              <span>{person.completionRate}% complete</span>
              <span>{person.total} task{person.total !== 1 ? 's' : ''}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export type { PersonProgress };
