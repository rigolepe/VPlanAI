export interface DataSource {
  id: string;
  name: string;
  data: any; // This could be more specific depending on your data structure
  includeInContext: boolean;
}