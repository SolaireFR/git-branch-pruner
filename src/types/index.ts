/**
 * Git branch information interface
 */
export interface Branch {
  /** Branch name */
  name: string;
  /** Whether it is a local branch */
  isLocal: boolean;
  /** Branch existence status */
  exists: {
    /** Whether it exists locally */
    local: boolean;
    /** Whether it exists remotely */
    remote: boolean;
  };
  /** Whether it is the currently checked out branch */
  isCurrentBranch: boolean;
  /** Whether it is the main branch (main/master) */
  isMainBranch: boolean;
}
