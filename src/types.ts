export interface CommandOption {
  flags: string;
  description: string;
  default?: string;
}

export interface Command {
  name: string;
  description: string;
  arguments?: string;
  options?: CommandOption[];
  action: (args: Record<string, unknown>, opts: Record<string, unknown>) => Promise<void>;
}
