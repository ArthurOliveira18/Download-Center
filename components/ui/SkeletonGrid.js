import styles from "./SkeletonGrid.module.css";

export function SkeletonGrid({ count = 4 }) {
  return (
    <div className={styles.grid} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div className={styles.card} key={index}>
          <span />
          <strong />
          <p />
          <p />
          <div />
        </div>
      ))}
    </div>
  );
}
