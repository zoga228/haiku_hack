export type MarketplaceVideo = {
  id: string;
  user_id: string;
  creator_name: string;
  creator_handle: string | null;
  title: string;
  caption: string | null;
  video_url: string;
  video_path: string | null;
  product_name: string;
  product_price: number | null;
  product_currency: string;
  product_url: string;
  product_image_url?: string | null;
  product_offer_id?: string | null;
  product_origin_country?: string | null;
  marketplace: string | null;
  likes_count: number;
  views_count: number;
  created_at: string;
};

export type VideoInsert = {
  id?: string;
  user_id: string;
  creator_name: string;
  creator_handle?: string | null;
  title: string;
  caption?: string | null;
  video_url: string;
  video_path?: string | null;
  product_name: string;
  product_price?: number | null;
  product_currency?: string;
  product_url: string;
  product_image_url?: string | null;
  product_offer_id?: string | null;
  product_origin_country?: string | null;
  marketplace?: string | null;
  likes_count?: number;
  views_count?: number;
  created_at?: string;
};

export type Database = {
  public: {
    Tables: {
      videos: {
        Row: MarketplaceVideo;
        Insert: VideoInsert;
        Update: Partial<VideoInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_video_counter: {
        Args: {
          video_id: string;
          counter_name: string;
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
