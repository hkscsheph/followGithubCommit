export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          project_url: string;
          created_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          project_url: string;
          created_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          project_url?: string;
          created_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export type Project = Database['public']['Tables']['projects']['Row'];
