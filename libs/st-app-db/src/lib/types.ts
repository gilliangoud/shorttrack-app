export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      competitions: {
        Row: {
          active: boolean
          created_at: string
          dates: string[] | null
          host: string | null
          id: number
          name: string
          sync_competition: boolean
          sync_competitors: boolean
          sync_location: string | null
          sync_races: boolean
          sync_results: boolean
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          dates?: string[] | null
          host?: string | null
          id?: number
          name: string
          sync_competition?: boolean
          sync_competitors?: boolean
          sync_location?: string | null
          sync_races?: boolean
          sync_results?: boolean
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          dates?: string[] | null
          host?: string | null
          id?: number
          name?: string
          sync_competition?: boolean
          sync_competitors?: boolean
          sync_location?: string | null
          sync_races?: boolean
          sync_results?: boolean
          updated_at?: string | null
        }
      }
      competitors: {
        Row: {
          category_name: string | null
          club_name: string | null
          competition_id: number
          created_at: string
          first_name: string | null
          group_name: string | null
          helmet_id: number | null
          id: number
          last_name: string | null
          scratched: boolean | null
          updated_at: string
        }
        Insert: {
          category_name?: string | null
          club_name?: string | null
          competition_id: number
          created_at?: string
          first_name?: string | null
          group_name?: string | null
          helmet_id?: number | null
          id?: number
          last_name?: string | null
          scratched?: boolean | null
          updated_at?: string
        }
        Update: {
          category_name?: string | null
          club_name?: string | null
          competition_id?: number
          created_at?: string
          first_name?: string | null
          group_name?: string | null
          helmet_id?: number | null
          id?: number
          last_name?: string | null
          scratched?: boolean | null
          updated_at?: string
        }
      }
      lanes: {
        Row: {
          competitorId: number | null
          created_at: string
          finish_position: number | null
          id: number
          passings: string[]
          raceId: number
          resultsRef: number
          time: string | null
          updated_at: string
        }
        Insert: {
          competitorId?: number | null
          created_at?: string
          finish_position?: number | null
          id?: number
          passings?: string[]
          raceId: number
          resultsRef?: number
          time?: string | null
          updated_at?: string
        }
        Update: {
          competitorId?: number | null
          created_at?: string
          finish_position?: number | null
          id?: number
          passings?: string[]
          raceId?: number
          resultsRef?: number
          time?: string | null
          updated_at?: string
        }
      }
      passings: {
        Row: {
          decoder_id: string | null
          gps_locked: boolean | null
          hits: number | null
          id: number
          inserted: string | null
          loop_id: string | null
          low_battery: boolean | null
          modified: boolean | null
          passing_number: number | null
          resend: boolean | null
          strength: number | null
          time: string | null
          tran_code: string | null
          transponder: string | null
        }
        Insert: {
          decoder_id?: string | null
          gps_locked?: boolean | null
          hits?: number | null
          id?: number
          inserted?: string | null
          loop_id?: string | null
          low_battery?: boolean | null
          modified?: boolean | null
          passing_number?: number | null
          resend?: boolean | null
          strength?: number | null
          time?: string | null
          tran_code?: string | null
          transponder?: string | null
        }
        Update: {
          decoder_id?: string | null
          gps_locked?: boolean | null
          hits?: number | null
          id?: number
          inserted?: string | null
          loop_id?: string | null
          low_battery?: boolean | null
          modified?: boolean | null
          passing_number?: number | null
          resend?: boolean | null
          strength?: number | null
          time?: string | null
          tran_code?: string | null
          transponder?: string | null
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
      }
      races: {
        Row: {
          armed: boolean
          competition: number
          created_at: string
          distance: number
          id: number
          name: string | null
          start_id: number | null
          track: number
          updated_at: string
        }
        Insert: {
          armed?: boolean
          competition: number
          created_at?: string
          distance?: number
          id?: number
          name?: string | null
          start_id?: number | null
          track?: number
          updated_at?: string
        }
        Update: {
          armed?: boolean
          competition?: number
          created_at?: string
          distance?: number
          id?: number
          name?: string | null
          start_id?: number | null
          track?: number
          updated_at?: string
        }
      }
      results: {
        Row: {
          created_at: string | null
          id: number
          result: Json | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          result?: Json | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          result?: Json | null
          type?: string
          updated_at?: string | null
        }
      }
      starts: {
        Row: {
          gps_locked: boolean | null
          id: number
          inserted: string
          time: string | null
        }
        Insert: {
          gps_locked?: boolean | null
          id?: number
          inserted?: string
          time?: string | null
        }
        Update: {
          gps_locked?: boolean | null
          id?: number
          inserted?: string
          time?: string | null
        }
      }
      transponders: {
        Row: {
          competitor_id: number | null
          id: string
          lane: number | null
          name: string | null
        }
        Insert: {
          competitor_id?: number | null
          id: string
          lane?: number | null
          name?: string | null
        }
        Update: {
          competitor_id?: number | null
          id?: string
          lane?: number | null
          name?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      install_available_extensions_and_test: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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
