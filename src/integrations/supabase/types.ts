export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          credits: number;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
        };
      };
    };
  };
};