import "./ProgressBar.scss";

type ProgressBarProps = {
  currentPage: number;
  totalPages: number;
  percentage?: number;
  mini?: boolean;
};

export function ProgressBar({ currentPage, totalPages, percentage, mini = false }: ProgressBarProps) {
  const pct = percentage ?? (totalPages > 0 ? Math.min(Math.round((currentPage / totalPages) * 100), 100) : 0);

  if (mini) {
    return (
      <div className="progress-bar progress-bar--mini">
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="progress-bar-pct">{pct}%</span>
      </div>
    );
  }

  return (
    <div className="progress-bar">
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress-bar-label">
        {totalPages > 0
          ? `${currentPage} de ${totalPages} (${pct}%)`
          : `${pct}%`}
      </span>
    </div>
  );
}
