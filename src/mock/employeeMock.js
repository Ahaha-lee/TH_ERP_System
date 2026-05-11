
import { employees as masterEmployees } from './masterData';

// Re-export for direct file imports, but we'll remove it from star exports in index.js if needed
// Actually, to fix star export conflict, we MUST not have multiple files exporting the same name.
// Since masterData now exports the "official" version, we'll keep it there.
const employees = masterEmployees;
// No export here, use masterData instead
