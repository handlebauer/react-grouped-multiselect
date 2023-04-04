export default function PartialCheck({ colour }) {
  return (
    <span className="check-container partial">
      <span className="check">
        <svg
          viewBox="0 0 100 100"
          width="0.5em"
          height="0.5em"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="50" />
        </svg>{' '}
      </span>
    </span>
  )
}
