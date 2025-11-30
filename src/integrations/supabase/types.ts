export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          password: string;
          created_at: string;
        };
      };
      user_profiles: {
        Row: {
          id: number;
          user_id: string;
          credits_balance: number;
          created_at: string;
          updated_at: string;
        };
      };
      categories: {
        Row: {
          id: number;
          name: string;
          slug: string;
          icon: string;
          created_at: string;
        };
      };
      subcategories: {
        Row: {
          id: number;
          category_id: number;
          name: string;
          slug: string;
          created_at: string;
        };
      };
      anunturi: {
        Row: {
          id: number;
          user_id: string;
          category_id: number;
          title: string;
          description: string;
          price: number;
          location: string;
          phone: string;
          images: any;
          status: string;
          is_premium: boolean;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
          ai_validation_score?: number;
          ai_validation_issues?: string[];
          ai_validation_suggestions?: string[];
          ai_approved?: boolean;
          ai_validated_at?: string;
        };
      };
      credit_packages: {
        Row: {
          id: number;
          name: string;
          credits: number;
          price: number;
          stripe_price_id?: string;
          is_active: boolean;
        };
      };
      credits_transactions: {
        Row: {
          id: number;
          user_id: string;
          package_id?: number;
          credits_amount: number;
          stripe_payment_id?: string;
          status: string;
          amount_eur?: number;
          created_at: string;
        };
      };
      listing_boosts: {
        Row: {
          id: number;
          listing_id: number;
          boost_type: string;
          starts_at: string;
          duration_days: number;
          is_active: boolean;
          auto_repost: boolean;
          payment_id?: string;
          created_at: string;
        };
      };
    };
  };
};