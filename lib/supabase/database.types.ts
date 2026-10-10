export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          email: string
          id: string
          is_active?: boolean | null
          name: string
          role: string
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      checkout_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          receipt_path: string | null
          token_hash: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id: string
          receipt_path?: string | null
          token_hash: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          receipt_path?: string | null
          token_hash?: string
        }
        Relationships: []
      }
      kit_items: {
        Row: {
          created_at: string | null
          id: string
          kit_id: string
          product_id: string
          product_variant_id: string | null
          quantity: number
          sort_order: number | null
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          kit_id: string
          product_id: string
          product_variant_id?: string | null
          quantity: number
          sort_order?: number | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          kit_id?: string
          product_id?: string
          product_variant_id?: string | null
          quantity?: number
          sort_order?: number | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kit_items_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kit_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kit_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      kits: {
        Row: {
          badge: string | null
          category_id: string | null
          compare_price_minor: number | null
          compliance_status: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          gallery_images: string[] | null
          id: string
          image_url: string
          ingredients: string | null
          is_featured: boolean | null
          name: string
          package_size: string | null
          price_minor: number
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          slug: string
          sort_order: number | null
          status: string
          storage_instructions: string | null
          subtitle: string | null
          updated_at: string | null
          usage_instructions: string | null
        }
        Insert: {
          badge?: string | null
          category_id?: string | null
          compare_price_minor?: number | null
          compliance_status?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          gallery_images?: string[] | null
          id: string
          image_url: string
          ingredients?: string | null
          is_featured?: boolean | null
          name: string
          package_size?: string | null
          price_minor: number
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number | null
          status?: string
          storage_instructions?: string | null
          subtitle?: string | null
          updated_at?: string | null
          usage_instructions?: string | null
        }
        Update: {
          badge?: string | null
          category_id?: string | null
          compare_price_minor?: number | null
          compliance_status?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          gallery_images?: string[] | null
          id?: string
          image_url?: string
          ingredients?: string | null
          is_featured?: boolean | null
          name?: string
          package_size?: string | null
          price_minor?: number
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number | null
          status?: string
          storage_instructions?: string | null
          subtitle?: string | null
          updated_at?: string | null
          usage_instructions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kits_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          status: string | null
          unsubscribe_token_hash: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          status?: string | null
          unsubscribe_token_hash: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          status?: string | null
          unsubscribe_token_hash?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      order_events: {
        Row: {
          actor_id: string | null
          actor_type: string
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          new_status: string | null
          old_status: string | null
          order_id: string
        }
        Insert: {
          actor_id?: string | null
          actor_type: string
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          old_status?: string | null
          order_id: string
        }
        Update: {
          actor_id?: string | null
          actor_type?: string
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          old_status?: string | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          kit_id: string | null
          line_total_minor: number
          metadata: string | null
          name_snapshot: string | null
          order_id: string
          price_minor: number
          product_id: string | null
          product_name: string
          quantity: number
          sku_snapshot: string | null
          unit_price_minor: number | null
          updated_at: string | null
          variant_id: string | null
          variant_name: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          image_url?: string | null
          kit_id?: string | null
          line_total_minor: number
          metadata?: string | null
          name_snapshot?: string | null
          order_id: string
          price_minor: number
          product_id?: string | null
          product_name: string
          quantity: number
          sku_snapshot?: string | null
          unit_price_minor?: number | null
          updated_at?: string | null
          variant_id?: string | null
          variant_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          kit_id?: string | null
          line_total_minor?: number
          metadata?: string | null
          name_snapshot?: string | null
          order_id?: string
          price_minor?: number
          product_id?: string | null
          product_name?: string
          quantity?: number
          sku_snapshot?: string | null
          unit_price_minor?: number | null
          updated_at?: string | null
          variant_id?: string | null
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_stock_reservations: {
        Row: {
          order_id: string
          quantity: number
          released_at: string | null
          variant_id: string
        }
        Insert: {
          order_id: string
          quantity: number
          released_at?: string | null
          variant_id: string
        }
        Update: {
          order_id?: string
          quantity?: number
          released_at?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_stock_reservations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_stock_reservations_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_note: string | null
          courier_name: string | null
          created_at: string | null
          currency: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          discount_minor: number | null
          id: string
          idempotency_key: string | null
          notes: string | null
          order_number: string
          order_status: string
          payment_method: string
          payment_status: string
          receipt_path: string | null
          request_fingerprint: string | null
          shipping_address: string
          shipping_city: string
          shipping_minor: number
          shipping_notes: string | null
          shipping_postal_code: string | null
          shipping_province: string
          subtotal_minor: number
          total_minor: number
          tracking_courier: string | null
          tracking_number: string | null
          tracking_token_hash: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_note?: string | null
          courier_name?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          discount_minor?: number | null
          id: string
          idempotency_key?: string | null
          notes?: string | null
          order_number: string
          order_status?: string
          payment_method: string
          payment_status?: string
          receipt_path?: string | null
          request_fingerprint?: string | null
          shipping_address: string
          shipping_city: string
          shipping_minor: number
          shipping_notes?: string | null
          shipping_postal_code?: string | null
          shipping_province: string
          subtotal_minor: number
          total_minor: number
          tracking_courier?: string | null
          tracking_number?: string | null
          tracking_token_hash: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_note?: string | null
          courier_name?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          discount_minor?: number | null
          id?: string
          idempotency_key?: string | null
          notes?: string | null
          order_number?: string
          order_status?: string
          payment_method?: string
          payment_status?: string
          receipt_path?: string | null
          request_fingerprint?: string | null
          shipping_address?: string
          shipping_city?: string
          shipping_minor?: number
          shipping_notes?: string | null
          shipping_postal_code?: string | null
          shipping_province?: string
          subtotal_minor?: number
          total_minor?: number
          tracking_courier?: string | null
          tracking_number?: string | null
          tracking_token_hash?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          barcode: string | null
          compare_price_minor: number | null
          created_at: string | null
          id: string
          inventory_quantity: number
          option_name: string
          option_value: string
          price_minor: number
          product_id: string
          sku: string | null
          sort_order: number | null
          status: string
          updated_at: string | null
          weight_grams: number
        }
        Insert: {
          barcode?: string | null
          compare_price_minor?: number | null
          created_at?: string | null
          id: string
          inventory_quantity?: number
          option_name: string
          option_value: string
          price_minor: number
          product_id: string
          sku?: string | null
          sort_order?: number | null
          status?: string
          updated_at?: string | null
          weight_grams: number
        }
        Update: {
          barcode?: string | null
          compare_price_minor?: number | null
          created_at?: string | null
          id?: string
          inventory_quantity?: number
          option_name?: string
          option_value?: string
          price_minor?: number
          product_id?: string
          sku?: string | null
          sort_order?: number | null
          status?: string
          updated_at?: string | null
          weight_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          badge: string | null
          barcode: string | null
          caffeine_level: string | null
          category_id: string | null
          compare_price_minor: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          flavor_profile: string | null
          gallery_images: string[] | null
          growing_information: string | null
          harvest_region: string | null
          id: string
          image_url: string
          ingredients: string | null
          is_featured: boolean | null
          name: string
          nutrition_information: Json | null
          package_size: string | null
          price_minor: number
          product_type: string | null
          rating: number | null
          review_count: number | null
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          sku: string | null
          slug: string
          sort_order: number | null
          status: string
          steep_time: string | null
          storage_instructions: string | null
          updated_at: string | null
          usage_instructions: string | null
          water_temp: string | null
          weight_grams: number | null
        }
        Insert: {
          badge?: string | null
          barcode?: string | null
          caffeine_level?: string | null
          category_id?: string | null
          compare_price_minor?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          flavor_profile?: string | null
          gallery_images?: string[] | null
          growing_information?: string | null
          harvest_region?: string | null
          id: string
          image_url: string
          ingredients?: string | null
          is_featured?: boolean | null
          name: string
          nutrition_information?: Json | null
          package_size?: string | null
          price_minor: number
          product_type?: string | null
          rating?: number | null
          review_count?: number | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sku?: string | null
          slug: string
          sort_order?: number | null
          status?: string
          steep_time?: string | null
          storage_instructions?: string | null
          updated_at?: string | null
          usage_instructions?: string | null
          water_temp?: string | null
          weight_grams?: number | null
        }
        Update: {
          badge?: string | null
          barcode?: string | null
          caffeine_level?: string | null
          category_id?: string | null
          compare_price_minor?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          flavor_profile?: string | null
          gallery_images?: string[] | null
          growing_information?: string | null
          harvest_region?: string | null
          id?: string
          image_url?: string
          ingredients?: string | null
          is_featured?: boolean | null
          name?: string
          nutrition_information?: Json | null
          package_size?: string | null
          price_minor?: number
          product_type?: string | null
          rating?: number | null
          review_count?: number | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          sort_order?: number | null
          status?: string
          steep_time?: string | null
          storage_instructions?: string | null
          updated_at?: string | null
          usage_instructions?: string | null
          water_temp?: string | null
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string
          created_at: string | null
          customer_name: string
          id: string
          is_demo: boolean | null
          kit_id: string | null
          product_id: string | null
          product_name: string | null
          rating: number
          status: string
          title: string | null
          updated_at: string | null
          verified_purchase: boolean | null
        }
        Insert: {
          body: string
          created_at?: string | null
          customer_name: string
          id: string
          is_demo?: boolean | null
          kit_id?: string | null
          product_id?: string | null
          product_name?: string | null
          rating: number
          status?: string
          title?: string | null
          updated_at?: string | null
          verified_purchase?: boolean | null
        }
        Update: {
          body?: string
          created_at?: string | null
          customer_name?: string
          id?: string
          is_demo?: boolean | null
          kit_id?: string | null
          product_id?: string | null
          product_name?: string | null
          rating?: number
          status?: string
          title?: string | null
          updated_at?: string | null
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      site_change_events: {
        Row: {
          created_at: string
          event_id: number
          topic: string
        }
        Insert: {
          created_at?: string
          event_id?: never
          topic?: string
        }
        Update: {
          created_at?: string
          event_id?: never
          topic?: string
        }
        Relationships: []
      }
      site_content_drafts: {
        Row: {
          content: Json
          definition_slug: string
          kind: string
          route: string | null
          slug: string
          title: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          content: Json
          definition_slug: string
          kind: string
          route?: string | null
          slug: string
          title: string
          updated_at?: string
          updated_by?: string | null
          version: number
        }
        Update: {
          content?: Json
          definition_slug?: string
          kind?: string
          route?: string | null
          slug?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: []
      }
      site_content_revisions: {
        Row: {
          action: string
          content: Json
          created_at: string
          created_by: string | null
          id: string
          slug: string
          title: string
          version: number
        }
        Insert: {
          action: string
          content: Json
          created_at?: string
          created_by?: string | null
          id?: string
          slug: string
          title: string
          version: number
        }
        Update: {
          action?: string
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          slug?: string
          title?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "site_content_revisions_slug_fkey"
            columns: ["slug"]
            isOneToOne: false
            referencedRelation: "site_content_drafts"
            referencedColumns: ["slug"]
          },
        ]
      }
      site_documents: {
        Row: {
          content: Json
          kind: string
          published_at: string
          route: string | null
          slug: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          content: Json
          kind: string
          published_at?: string
          route?: string | null
          slug: string
          title: string
          updated_at?: string
          version: number
        }
        Update: {
          content?: Json
          kind?: string
          published_at?: string
          route?: string | null
          slug?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "site_documents_slug_fkey"
            columns: ["slug"]
            isOneToOne: true
            referencedRelation: "site_content_drafts"
            referencedColumns: ["slug"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      stock_alert_deliveries: {
        Row: {
          attempt_count: number | null
          channel: string | null
          error_message: string | null
          id: string
          notification_type: string
          sent_at: string | null
          status: string
          subscription_id: string
        }
        Insert: {
          attempt_count?: number | null
          channel?: string | null
          error_message?: string | null
          id: string
          notification_type?: string
          sent_at?: string | null
          status?: string
          subscription_id: string
        }
        Update: {
          attempt_count?: number | null
          channel?: string | null
          error_message?: string | null
          id?: string
          notification_type?: string
          sent_at?: string | null
          status?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_alert_deliveries_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "stock_alert_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_alert_subscriptions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          kit_id: string | null
          last_error: string | null
          normalized_email: string | null
          notified_at: string | null
          product_id: string | null
          product_variant_id: string | null
          sellable_title: string | null
          status: string | null
          unsubscribe_token: string | null
          unsubscribe_token_hash: string
          updated_at: string | null
          user_id: string | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          kit_id?: string | null
          last_error?: string | null
          normalized_email?: string | null
          notified_at?: string | null
          product_id?: string | null
          product_variant_id?: string | null
          sellable_title?: string | null
          status?: string | null
          unsubscribe_token?: string | null
          unsubscribe_token_hash: string
          updated_at?: string | null
          user_id?: string | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          kit_id?: string | null
          last_error?: string | null
          normalized_email?: string | null
          notified_at?: string | null
          product_id?: string | null
          product_variant_id?: string | null
          sellable_title?: string | null
          status?: string | null
          unsubscribe_token?: string | null
          unsubscribe_token_hash?: string
          updated_at?: string | null
          user_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_alert_subscriptions_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_alert_subscriptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_alert_subscriptions_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allocate_checkout_order_reference: {
        Args: { p_checkout_reference: string; p_request_fingerprint: string }
        Returns: string
      }
      claim_order_emails: { Args: { p_limit?: number }; Returns: Json }
      consume_rate_limit: {
        Args: { p_bucket: string; p_limit: number; p_window_seconds: number }
        Returns: Json
      }
      create_order_secure_transactional: {
        Args: {
          p_customer_email: string
          p_customer_name: string
          p_customer_phone: string
          p_expected_quote: Json
          p_idempotency_key: string
          p_items: Json
          p_order_id: string
          p_order_number: string
          p_payment_method: string
          p_receipt_path: string
          p_request_fingerprint: string
          p_shipping_address: string
          p_shipping_city: string
          p_shipping_notes: string
          p_shipping_postal_code: string
          p_shipping_province: string
          p_tracking_token_hash: string
        }
        Returns: Json
      }
      create_order_transactional: {
        Args: {
          p_customer_email: string
          p_customer_name: string
          p_customer_phone: string
          p_idempotency_key: string
          p_items: Json
          p_order_id: string
          p_order_number: string
          p_payment_method: string
          p_receipt_path: string
          p_request_fingerprint: string
          p_shipping_address: string
          p_shipping_city: string
          p_shipping_notes: string
          p_shipping_postal_code: string
          p_shipping_province: string
          p_tracking_token_hash: string
        }
        Returns: Json
      }
      find_checkout_order_reference: {
        Args: { p_checkout_reference: string; p_request_fingerprint: string }
        Returns: string
      }
      finish_order_email: {
        Args: {
          p_claim_token: string
          p_error_code?: string
          p_id: string
          p_provider_id?: string
          p_status: string
        }
        Returns: boolean
      }
      get_site_content_snapshot: { Args: never; Returns: Json }
      is_admin: { Args: never; Returns: boolean }
      is_owner: { Args: never; Returns: boolean }
      lookup_order_with_capability: {
        Args: { p_order_number: string; p_token?: string; p_verify?: string }
        Returns: Json
      }
      mutate_site_content: {
        Args: {
          p_action: string
          p_content?: Json
          p_expected_version: number
          p_revision_id?: string
          p_slug: string
          p_title?: string
        }
        Returns: Json
      }
      prepare_order_email: {
        Args: { p_claim_token: string; p_id: string; p_message: Json }
        Returns: Json
      }
      save_admin_catalog: {
        Args: {
          p_children?: Json
          p_create?: boolean
          p_document: Json
          p_kind: string
        }
        Returns: Json
      }
      update_order_fulfillment_transactional: {
        Args: {
          p_actor_id?: string
          p_actor_type?: string
          p_courier_name?: string
          p_notes?: string
          p_order_id: string
          p_order_status: string
          p_tracking_number?: string
        }
        Returns: Json
      }
      update_order_payment_transactional: {
        Args: {
          p_actor_id?: string
          p_actor_type?: string
          p_notes?: string
          p_order_id: string
          p_order_status?: string
          p_payment_status: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
