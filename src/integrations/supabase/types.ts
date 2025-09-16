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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_policy_recommendations: {
        Row: {
          applied_at: string | null
          applied_by: string | null
          confidence_score: number
          current_metrics: Json
          expected_impact: Json
          generated_at: string
          id: string
          reasoning: string | null
          recommendation_type: string
          recommended_changes: Json
          status: string
          tenant_id: string
        }
        Insert: {
          applied_at?: string | null
          applied_by?: string | null
          confidence_score?: number
          current_metrics?: Json
          expected_impact?: Json
          generated_at?: string
          id?: string
          reasoning?: string | null
          recommendation_type: string
          recommended_changes?: Json
          status?: string
          tenant_id: string
        }
        Update: {
          applied_at?: string | null
          applied_by?: string | null
          confidence_score?: number
          current_metrics?: Json
          expected_impact?: Json
          generated_at?: string
          id?: string
          reasoning?: string | null
          recommendation_type?: string
          recommended_changes?: Json
          status?: string
          tenant_id?: string
        }
        Relationships: []
      }
      alert_actions: {
        Row: {
          action_type: string
          alert_id: string
          created_at: string
          id: string
          metadata: Json | null
          note: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          alert_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          note?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          alert_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          last_action_at: string
          message: string | null
          priority: string
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          sla_due_at: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          last_action_at?: string
          message?: string | null
          priority?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          sla_due_at?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          last_action_at?: string
          message?: string | null
          priority?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          sla_due_at?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_cache: {
        Row: {
          ci_high: number | null
          ci_low: number | null
          context: Json | null
          created_at: string
          drivers: Json | null
          entity_id: string
          entity_type: string
          id: string
          metric_key: string
          n_effective: number | null
          tenant_id: string
          updated_at: string
          value: number
        }
        Insert: {
          ci_high?: number | null
          ci_low?: number | null
          context?: Json | null
          created_at?: string
          drivers?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          metric_key: string
          n_effective?: number | null
          tenant_id: string
          updated_at?: string
          value: number
        }
        Update: {
          ci_high?: number | null
          ci_low?: number | null
          context?: Json | null
          created_at?: string
          drivers?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          metric_key?: string
          n_effective?: number | null
          tenant_id?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      analytics_qos: {
        Row: {
          created_at: string
          date_collected: string
          days_advance_median: number | null
          ece_score: number | null
          id: string
          kpis_csrd_covered_pct: number | null
          precision_c_index: number | null
          recommendations_applied_pct: number | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          date_collected?: string
          days_advance_median?: number | null
          ece_score?: number | null
          id?: string
          kpis_csrd_covered_pct?: number | null
          precision_c_index?: number | null
          recommendations_applied_pct?: number | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          date_collected?: string
          days_advance_median?: number | null
          ece_score?: number | null
          id?: string
          kpis_csrd_covered_pct?: number | null
          precision_c_index?: number | null
          recommendations_applied_pct?: number | null
          tenant_id?: string
        }
        Relationships: []
      }
      anonymous_feedback: {
        Row: {
          category: string
          created_at: string
          id: string
          message: string
          metadata: Json
          tenant_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          message: string
          metadata?: Json
          tenant_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          message?: string
          metadata?: Json
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_feedback_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      assurance_reviews: {
        Row: {
          assurance_level: Database["public"]["Enums"]["assurance_level"]
          created_at: string
          digital_signature: string | null
          findings: string | null
          id: string
          recommendations: string | null
          report_version_id: string
          review_status: string
          reviewed_at: string | null
          reviewer_id: string
          tenant_id: string
        }
        Insert: {
          assurance_level: Database["public"]["Enums"]["assurance_level"]
          created_at?: string
          digital_signature?: string | null
          findings?: string | null
          id?: string
          recommendations?: string | null
          report_version_id: string
          review_status?: string
          reviewed_at?: string | null
          reviewer_id: string
          tenant_id: string
        }
        Update: {
          assurance_level?: Database["public"]["Enums"]["assurance_level"]
          created_at?: string
          digital_signature?: string | null
          findings?: string | null
          id?: string
          recommendations?: string | null
          report_version_id?: string
          review_status?: string
          reviewed_at?: string | null
          reviewer_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_assurance_review_report"
            columns: ["report_version_id"]
            isOneToOne: false
            referencedRelation: "report_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          created_at: string
          date: string
          hours_worked: number | null
          id: string
          justification: string | null
          overtime_hours: number | null
          row_hash: string | null
          source: string | null
          status: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          hours_worked?: number | null
          id?: string
          justification?: string | null
          overtime_hours?: number | null
          row_hash?: string | null
          source?: string | null
          status: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          hours_worked?: number | null
          id?: string
          justification?: string | null
          overtime_hours?: number | null
          row_hash?: string | null
          source?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          assurance_review_id: string
          entity_id: string
          entity_type: string
          id: string
          new_value: Json | null
          old_value: Json | null
          performed_by: string
          tenant_id: string
          timestamp: string
        }
        Insert: {
          action: string
          assurance_review_id: string
          entity_id: string
          entity_type: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          performed_by: string
          tenant_id: string
          timestamp?: string
        }
        Update: {
          action?: string
          assurance_review_id?: string
          entity_id?: string
          entity_type?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          performed_by?: string
          tenant_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_audit_log_review"
            columns: ["assurance_review_id"]
            isOneToOne: false
            referencedRelation: "assurance_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      benchmarks_ref: {
        Row: {
          created_at: string
          ecdf_data: Json
          id: string
          industry: string
          metric_key: string
          region: string
          sample_n: number
          size_bucket: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          ecdf_data: Json
          id?: string
          industry: string
          metric_key: string
          region?: string
          sample_n: number
          size_bucket: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          ecdf_data?: Json
          id?: string
          industry?: string
          metric_key?: string
          region?: string
          sample_n?: number
          size_bucket?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      billing_invoices: {
        Row: {
          created_at: string
          currency: string | null
          due_date: string | null
          file_path: string | null
          id: string
          invoice_number: string
          metadata: Json | null
          paid_date: string | null
          period_end: string
          period_start: string
          sent_date: string | null
          status: string | null
          subtotal: number
          tax_amount: number
          tenant_id: string
          total: number
        }
        Insert: {
          created_at?: string
          currency?: string | null
          due_date?: string | null
          file_path?: string | null
          id?: string
          invoice_number: string
          metadata?: Json | null
          paid_date?: string | null
          period_end: string
          period_start: string
          sent_date?: string | null
          status?: string | null
          subtotal: number
          tax_amount: number
          tenant_id: string
          total: number
        }
        Update: {
          created_at?: string
          currency?: string | null
          due_date?: string | null
          file_path?: string | null
          id?: string
          invoice_number?: string
          metadata?: Json | null
          paid_date?: string | null
          period_end?: string
          period_start?: string
          sent_date?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number
          tenant_id?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      checkins: {
        Row: {
          created_at: string
          id: string
          mood: number
          question_id: string
          response_value: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood: number
          question_id: string
          response_value: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mood?: number
          question_id?: string
          response_value?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          created_at: string
          created_by: string
          data_point_id: string
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          priority: string | null
          status: Database["public"]["Enums"]["task_status"]
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          created_at?: string
          created_by: string
          data_point_id: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          data_point_id?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_compliance_tasks_data_point"
            columns: ["data_point_id"]
            isOneToOne: false
            referencedRelation: "esrs_data_points"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_baselines: {
        Row: {
          absenteeism_cost_per_hour: number | null
          avg_salary_month: number | null
          created_at: string
          id: string
          replacement_cost_factor: number | null
          role_level: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          absenteeism_cost_per_hour?: number | null
          avg_salary_month?: number | null
          created_at?: string
          id?: string
          replacement_cost_factor?: number | null
          role_level?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          absenteeism_cost_per_hour?: number | null
          avg_salary_month?: number | null
          created_at?: string
          id?: string
          replacement_cost_factor?: number | null
          role_level?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      csrd_profile: {
        Row: {
          assurance_level: Database["public"]["Enums"]["assurance_level"]
          company_size: string
          created_at: string
          employee_count: number | null
          id: string
          is_eu_entity: boolean
          net_turnover: number | null
          sector: string
          tenant_id: string
          total_assets: number | null
          updated_at: string
          year_first_report: number | null
        }
        Insert: {
          assurance_level?: Database["public"]["Enums"]["assurance_level"]
          company_size: string
          created_at?: string
          employee_count?: number | null
          id?: string
          is_eu_entity?: boolean
          net_turnover?: number | null
          sector: string
          tenant_id: string
          total_assets?: number | null
          updated_at?: string
          year_first_report?: number | null
        }
        Update: {
          assurance_level?: Database["public"]["Enums"]["assurance_level"]
          company_size?: string
          created_at?: string
          employee_count?: number | null
          id?: string
          is_eu_entity?: boolean
          net_turnover?: number | null
          sector?: string
          tenant_id?: string
          total_assets?: number | null
          updated_at?: string
          year_first_report?: number | null
        }
        Relationships: []
      }
      custom_policies: {
        Row: {
          category: string
          created_at: string
          creator_id: string
          delta_json: Json
          description: string | null
          id: string
          is_active: boolean
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          creator_id: string
          delta_json?: Json
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          creator_id?: string
          delta_json?: Json
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      custom_questions: {
        Row: {
          category: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          scale_description: string
          subcategory: string
          tenant_id: string
          text: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by: string
          id: string
          is_active?: boolean
          scale_description?: string
          subcategory: string
          tenant_id: string
          text: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          scale_description?: string
          subcategory?: string
          tenant_id?: string
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_questions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          name: string
          question_id: string
          scheduled_time: string
          sent_at: string | null
          subject: string
          tenant_id: string
          total_recipients: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          name: string
          question_id: string
          scheduled_time?: string
          sent_at?: string | null
          subject: string
          tenant_id: string
          total_recipients?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          name?: string
          question_id?: string
          scheduled_time?: string
          sent_at?: string | null
          subject?: string
          tenant_id?: string
          total_recipients?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      email_queue: {
        Row: {
          created_at: string
          error_message: string | null
          html_content: string
          id: string
          max_retries: number
          metadata: Json | null
          priority: string
          retry_count: number
          scheduled_at: string
          sent_at: string | null
          status: string
          subject: string
          template_type: string
          tenant_id: string | null
          to_email: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          html_content: string
          id?: string
          max_retries?: number
          metadata?: Json | null
          priority?: string
          retry_count?: number
          scheduled_at?: string
          sent_at?: string | null
          status?: string
          subject: string
          template_type: string
          tenant_id?: string | null
          to_email: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          html_content?: string
          id?: string
          max_retries?: number
          metadata?: Json | null
          priority?: string
          retry_count?: number
          scheduled_at?: string
          sent_at?: string | null
          status?: string
          subject?: string
          template_type?: string
          tenant_id?: string | null
          to_email?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_sent_log: {
        Row: {
          campaign_id: string
          clicked_at: string | null
          delivery_status: string | null
          email: string
          id: string
          opened_at: string | null
          sent_at: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          clicked_at?: string | null
          delivery_status?: string | null
          email: string
          id?: string
          opened_at?: string | null
          sent_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          clicked_at?: string | null
          delivery_status?: string | null
          email?: string
          id?: string
          opened_at?: string | null
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_sent_log_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          created_at: string
          html_content: string
          id: string
          is_default: boolean
          subject: string
          tenant_id: string | null
          type: string
          updated_at: string
          variables: string[]
        }
        Insert: {
          created_at?: string
          html_content: string
          id?: string
          is_default?: boolean
          subject: string
          tenant_id?: string | null
          type: string
          updated_at?: string
          variables?: string[]
        }
        Update: {
          created_at?: string
          html_content?: string
          id?: string
          is_default?: boolean
          subject?: string
          tenant_id?: string | null
          type?: string
          updated_at?: string
          variables?: string[]
        }
        Relationships: []
      }
      employee_aliases: {
        Row: {
          alias_code: string
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          tenant_id: string
          user_id: string
        }
        Insert: {
          alias_code: string
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          tenant_id: string
          user_id: string
        }
        Update: {
          alias_code?: string
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_aliases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_shift_prefs: {
        Row: {
          blocked: boolean
          created_at: string
          employee_id: string
          id: string
          shift_template_id: string | null
          updated_at: string
          weekday: number
          weight: number
        }
        Insert: {
          blocked?: boolean
          created_at?: string
          employee_id: string
          id?: string
          shift_template_id?: string | null
          updated_at?: string
          weekday: number
          weight?: number
        }
        Update: {
          blocked?: boolean
          created_at?: string
          employee_id?: string
          id?: string
          shift_template_id?: string | null
          updated_at?: string
          weekday?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_shift_prefs_shift_template_id_fkey"
            columns: ["shift_template_id"]
            isOneToOne: false
            referencedRelation: "shift_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      esrs_data_points: {
        Row: {
          code: string
          created_at: string
          data_type: string
          description: string | null
          esrs_standard: string
          id: string
          is_mandatory: boolean | null
          owner_role: string | null
          source_system: string | null
          tenant_id: string
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          data_type: string
          description?: string | null
          esrs_standard: string
          id?: string
          is_mandatory?: boolean | null
          owner_role?: string | null
          source_system?: string | null
          tenant_id: string
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          data_type?: string
          description?: string | null
          esrs_standard?: string
          id?: string
          is_mandatory?: boolean | null
          owner_role?: string | null
          source_system?: string | null
          tenant_id?: string
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      esrs_values: {
        Row: {
          coverage_status: Database["public"]["Enums"]["coverage_status"]
          created_at: string
          data_point_id: string
          evidence_file_id: string | null
          id: string
          last_updated_by: string | null
          quality_score: number | null
          reporting_period: number
          source_description: string | null
          tenant_id: string
          updated_at: string
          value_boolean: boolean | null
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          coverage_status?: Database["public"]["Enums"]["coverage_status"]
          created_at?: string
          data_point_id: string
          evidence_file_id?: string | null
          id?: string
          last_updated_by?: string | null
          quality_score?: number | null
          reporting_period: number
          source_description?: string | null
          tenant_id: string
          updated_at?: string
          value_boolean?: boolean | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          coverage_status?: Database["public"]["Enums"]["coverage_status"]
          created_at?: string
          data_point_id?: string
          evidence_file_id?: string | null
          id?: string
          last_updated_by?: string | null
          quality_score?: number | null
          reporting_period?: number
          source_description?: string | null
          tenant_id?: string
          updated_at?: string
          value_boolean?: boolean | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_esrs_values_data_point"
            columns: ["data_point_id"]
            isOneToOne: false
            referencedRelation: "esrs_data_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_esrs_values_evidence"
            columns: ["evidence_file_id"]
            isOneToOne: false
            referencedRelation: "evidence_files"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_analytics: {
        Row: {
          benchmark_data: Json | null
          calculated_at: string
          campaign_id: string
          confidence_interval: Json | null
          created_at: string
          dimension_id: string | null
          id: string
          instrument_id: string
          metric_key: string
          percentile: number | null
          risk_level: string | null
          sample_size: number
          score: number
          team_id: string | null
          tenant_id: string
        }
        Insert: {
          benchmark_data?: Json | null
          calculated_at?: string
          campaign_id: string
          confidence_interval?: Json | null
          created_at?: string
          dimension_id?: string | null
          id?: string
          instrument_id: string
          metric_key: string
          percentile?: number | null
          risk_level?: string | null
          sample_size?: number
          score: number
          team_id?: string | null
          tenant_id: string
        }
        Update: {
          benchmark_data?: Json | null
          calculated_at?: string
          campaign_id?: string
          confidence_interval?: Json | null
          created_at?: string
          dimension_id?: string | null
          id?: string
          instrument_id?: string
          metric_key?: string
          percentile?: number | null
          risk_level?: string | null
          sample_size?: number
          score?: number
          team_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "evaluation_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_campaigns: {
        Row: {
          anonymous: boolean
          completed_responses: number | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          frequency: string
          id: string
          launch_date: string | null
          name: string
          status: string
          target_audience: Json
          template_data: Json
          tenant_id: string
          total_participants: number | null
          updated_at: string
        }
        Insert: {
          anonymous?: boolean
          completed_responses?: number | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          launch_date?: string | null
          name: string
          status?: string
          target_audience?: Json
          template_data?: Json
          tenant_id: string
          total_participants?: number | null
          updated_at?: string
        }
        Update: {
          anonymous?: boolean
          completed_responses?: number | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          launch_date?: string | null
          name?: string
          status?: string
          target_audience?: Json
          template_data?: Json
          tenant_id?: string
          total_participants?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      evaluation_notifications: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          metadata: Json | null
          notification_type: string
          opened_at: string | null
          sent_at: string | null
          status: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          notification_type: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          notification_type?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_notifications_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "evaluation_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_responses: {
        Row: {
          campaign_id: string
          completed_at: string | null
          completion_status: string
          created_at: string
          device_info: Json | null
          id: string
          responses: Json
          started_at: string
          tenant_id: string
          time_spent_minutes: number | null
          updated_at: string
          user_alias: string | null
          user_id: string | null
        }
        Insert: {
          campaign_id: string
          completed_at?: string | null
          completion_status?: string
          created_at?: string
          device_info?: Json | null
          id?: string
          responses?: Json
          started_at?: string
          tenant_id: string
          time_spent_minutes?: number | null
          updated_at?: string
          user_alias?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string
          completed_at?: string | null
          completion_status?: string
          created_at?: string
          device_info?: Json | null
          id?: string
          responses?: Json
          started_at?: string
          tenant_id?: string
          time_spent_minutes?: number | null
          updated_at?: string
          user_alias?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_responses_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "evaluation_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_files: {
        Row: {
          checksum: string | null
          created_at: string
          description: string | null
          file_path: string
          file_size: number | null
          filename: string
          id: string
          mime_type: string | null
          tenant_id: string
          uploaded_by: string
        }
        Insert: {
          checksum?: string | null
          created_at?: string
          description?: string | null
          file_path: string
          file_size?: number | null
          filename: string
          id?: string
          mime_type?: string | null
          tenant_id: string
          uploaded_by: string
        }
        Update: {
          checksum?: string | null
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number | null
          filename?: string
          id?: string
          mime_type?: string | null
          tenant_id?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      flex_policies: {
        Row: {
          allowed_modes: string[]
          core_hours: Json
          created_at: string
          id: string
          is_active: boolean
          min_on_site_days: number
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          allowed_modes?: string[]
          core_hours?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          min_on_site_days?: number
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          allowed_modes?: string[]
          core_hours?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          min_on_site_days?: number
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      flex_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          date: string
          employee_id: string
          id: string
          reason: string | null
          rejection_reason: string | null
          requested_hours: Json | null
          requested_mode: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          date: string
          employee_id: string
          id?: string
          reason?: string | null
          rejection_reason?: string | null
          requested_hours?: Json | null
          requested_mode: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          date?: string
          employee_id?: string
          id?: string
          reason?: string | null
          rejection_reason?: string | null
          requested_hours?: Json | null
          requested_mode?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      headcount_snapshots: {
        Row: {
          created_at: string
          date_month: string
          headcount: number
          id: string
          involuntary_terminations: number
          tenant_id: string
          updated_at: string
          voluntary_terminations: number
        }
        Insert: {
          created_at?: string
          date_month: string
          headcount: number
          id?: string
          involuntary_terminations?: number
          tenant_id: string
          updated_at?: string
          voluntary_terminations?: number
        }
        Update: {
          created_at?: string
          date_month?: string
          headcount?: number
          id?: string
          involuntary_terminations?: number
          tenant_id?: string
          updated_at?: string
          voluntary_terminations?: number
        }
        Relationships: []
      }
      hr_events: {
        Row: {
          created_at: string
          event_date: string
          event_type: string
          fte: number | null
          id: string
          reason: string | null
          row_hash: string | null
          source: string | null
          team_id: string | null
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_date: string
          event_type: string
          fte?: number | null
          id?: string
          reason?: string | null
          row_hash?: string | null
          source?: string | null
          team_id?: string | null
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_date?: string
          event_type?: string
          fte?: number | null
          id?: string
          reason?: string | null
          row_hash?: string | null
          source?: string | null
          team_id?: string | null
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_policy_configs: {
        Row: {
          config_data: Json
          config_name: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          policy_type: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          config_data?: Json
          config_name: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          policy_type: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          config_data?: Json
          config_name?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          policy_type?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      integration_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          error_message: string | null
          id: string
          integration_id: string
          status: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          error_message?: string | null
          id?: string
          integration_id: string
          status: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          error_message?: string | null
          id?: string
          integration_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations_config"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations_config: {
        Row: {
          config: Json
          created_at: string
          created_by: string
          id: string
          integration_type: string
          is_active: boolean
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by: string
          id?: string
          integration_type: string
          is_active?: boolean
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string
          id?: string
          integration_type?: string
          is_active?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      intervention_messages: {
        Row: {
          alert_id: string
          alias_id: string
          consent_given: boolean | null
          content: Json
          created_by: string | null
          id: string
          message_type: string
          responded_at: string | null
          response: Json | null
          sent_at: string | null
          tenant_id: string
        }
        Insert: {
          alert_id: string
          alias_id: string
          consent_given?: boolean | null
          content: Json
          created_by?: string | null
          id?: string
          message_type: string
          responded_at?: string | null
          response?: Json | null
          sent_at?: string | null
          tenant_id: string
        }
        Update: {
          alert_id?: string
          alias_id?: string
          consent_given?: boolean | null
          content?: Json
          created_by?: string | null
          id?: string
          message_type?: string
          responded_at?: string | null
          response?: Json | null
          sent_at?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intervention_messages_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intervention_messages_alias_id_fkey"
            columns: ["alias_id"]
            isOneToOne: false
            referencedRelation: "employee_aliases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intervention_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string
          created_by: string
          email: string
          expires_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          status: string
          team_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          email: string
          expires_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: string
          team_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          email?: string
          expires_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: string
          team_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      iro_catalog: {
        Row: {
          created_at: string
          description: string
          id: string
          likelihood: string | null
          magnitude: string | null
          materiality_id: string
          tenant_id: string
          time_horizon: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          likelihood?: string | null
          magnitude?: string | null
          materiality_id: string
          tenant_id: string
          time_horizon?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          likelihood?: string | null
          magnitude?: string | null
          materiality_id?: string
          tenant_id?: string
          time_horizon?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_iro_materiality"
            columns: ["materiality_id"]
            isOneToOne: false
            referencedRelation: "materiality_matrix"
            referencedColumns: ["id"]
          },
        ]
      }
      materiality_matrix: {
        Row: {
          created_at: string
          csrd_profile_id: string
          financial_score: number | null
          id: string
          impact_score: number | null
          is_material: boolean | null
          justification: string | null
          quadrant: Database["public"]["Enums"]["materiality_quadrant"] | null
          tenant_id: string
          topic_code: string
          topic_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          csrd_profile_id: string
          financial_score?: number | null
          id?: string
          impact_score?: number | null
          is_material?: boolean | null
          justification?: string | null
          quadrant?: Database["public"]["Enums"]["materiality_quadrant"] | null
          tenant_id: string
          topic_code: string
          topic_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          csrd_profile_id?: string
          financial_score?: number | null
          id?: string
          impact_score?: number | null
          is_material?: boolean | null
          justification?: string | null
          quadrant?: Database["public"]["Enums"]["materiality_quadrant"] | null
          tenant_id?: string
          topic_code?: string
          topic_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_materiality_csrd_profile"
            columns: ["csrd_profile_id"]
            isOneToOne: false
            referencedRelation: "csrd_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_configs: {
        Row: {
          created_at: string
          email: string
          enabled: boolean
          frequency: string
          id: string
          last_sent: string | null
          tenant_id: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          enabled?: boolean
          frequency: string
          id?: string
          last_sent?: string | null
          tenant_id: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          enabled?: boolean
          frequency?: string
          id?: string
          last_sent?: string | null
          tenant_id?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          tenant_id: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          tenant_id: string
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          tenant_id?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      policy_performance_metrics: {
        Row: {
          created_at: string
          id: string
          measurement_date: string
          metric_type: string
          metric_value: number
          period_type: string
          policy_config_id: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          measurement_date?: string
          metric_type: string
          metric_value: number
          period_type?: string
          policy_config_id?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          measurement_date?: string
          metric_type?: string
          metric_value?: number
          period_type?: string
          policy_config_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_performance_metrics_policy_config_id_fkey"
            columns: ["policy_config_id"]
            isOneToOne: false
            referencedRelation: "hr_policy_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_templates: {
        Row: {
          category: string
          created_at: string
          default_delta_json: Json
          description: string | null
          id: string
          is_active: boolean
          is_recommended: boolean
          name: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          default_delta_json?: Json
          description?: string | null
          id?: string
          is_active?: boolean
          is_recommended?: boolean
          name: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          default_delta_json?: Json
          description?: string | null
          id?: string
          is_active?: boolean
          is_recommended?: boolean
          name?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      privacy_audit_log: {
        Row: {
          action: string
          affected_user_id: string | null
          alias_id: string | null
          created_at: string
          details: Json | null
          id: string
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          affected_user_id?: string | null
          alias_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          affected_user_id?: string | null
          alias_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "privacy_audit_log_alias_id_fkey"
            columns: ["alias_id"]
            isOneToOne: false
            referencedRelation: "employee_aliases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "privacy_audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      productivity_metrics: {
        Row: {
          created_at: string
          date: string
          id: string
          metric_type: string
          row_hash: string | null
          source: string | null
          team_id: string | null
          tenant_id: string
          unit: string | null
          updated_at: string
          user_id: string | null
          value: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          metric_type: string
          row_hash?: string | null
          source?: string | null
          team_id?: string | null
          tenant_id: string
          unit?: string | null
          updated_at?: string
          user_id?: string | null
          value: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          metric_type?: string
          row_hash?: string | null
          source?: string | null
          team_id?: string | null
          tenant_id?: string
          unit?: string | null
          updated_at?: string
          user_id?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "productivity_metrics_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productivity_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          team_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          team_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          team_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      report_versions: {
        Row: {
          created_at: string
          file_path: string | null
          generated_by: string
          id: string
          metadata: Json | null
          reporting_period: number
          status: Database["public"]["Enums"]["compliance_status"]
          tenant_id: string
          updated_at: string
          version_number: string
          xhtml_content: string | null
        }
        Insert: {
          created_at?: string
          file_path?: string | null
          generated_by: string
          id?: string
          metadata?: Json | null
          reporting_period: number
          status?: Database["public"]["Enums"]["compliance_status"]
          tenant_id: string
          updated_at?: string
          version_number: string
          xhtml_content?: string | null
        }
        Update: {
          created_at?: string
          file_path?: string | null
          generated_by?: string
          id?: string
          metadata?: Json | null
          reporting_period?: number
          status?: Database["public"]["Enums"]["compliance_status"]
          tenant_id?: string
          updated_at?: string
          version_number?: string
          xhtml_content?: string | null
        }
        Relationships: []
      }
      rota_audit: {
        Row: {
          action: string
          changed_by: string
          id: string
          new_employee_id: string | null
          notes: string | null
          old_employee_id: string | null
          rota_id: string | null
          timestamp: string
        }
        Insert: {
          action: string
          changed_by: string
          id?: string
          new_employee_id?: string | null
          notes?: string | null
          old_employee_id?: string | null
          rota_id?: string | null
          timestamp?: string
        }
        Update: {
          action?: string
          changed_by?: string
          id?: string
          new_employee_id?: string | null
          notes?: string | null
          old_employee_id?: string | null
          rota_id?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "rota_audit_rota_id_fkey"
            columns: ["rota_id"]
            isOneToOne: false
            referencedRelation: "rotas"
            referencedColumns: ["id"]
          },
        ]
      }
      rotas: {
        Row: {
          created_at: string
          day: string
          employee_id: string
          id: string
          requested_swap_to: string | null
          shift_template_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day: string
          employee_id: string
          id?: string
          requested_swap_to?: string | null
          shift_template_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day?: string
          employee_id?: string
          id?: string
          requested_swap_to?: string | null
          shift_template_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rotas_shift_template_id_fkey"
            columns: ["shift_template_id"]
            isOneToOne: false
            referencedRelation: "shift_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      scenario_outputs: {
        Row: {
          baseline: number | null
          ci_high: number | null
          ci_low: number | null
          created_at: string
          delta: number | null
          id: string
          metric_key: string
          projected: number | null
          scenario_id: string
          tenant_id: string
        }
        Insert: {
          baseline?: number | null
          ci_high?: number | null
          ci_low?: number | null
          created_at?: string
          delta?: number | null
          id?: string
          metric_key: string
          projected?: number | null
          scenario_id: string
          tenant_id: string
        }
        Update: {
          baseline?: number | null
          ci_high?: number | null
          ci_low?: number | null
          created_at?: string
          delta?: number | null
          id?: string
          metric_key?: string
          projected?: number | null
          scenario_id?: string
          tenant_id?: string
        }
        Relationships: []
      }
      scenario_params: {
        Row: {
          created_at: string
          delta_type: string
          delta_value: number
          id: string
          param_key: string
          scenario_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          delta_type: string
          delta_value: number
          id?: string
          param_key: string
          scenario_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          delta_type?: string
          delta_value?: number
          id?: string
          param_key?: string
          scenario_id?: string
          tenant_id?: string
        }
        Relationships: []
      }
      scenarios: {
        Row: {
          baseline_period: string
          created_at: string
          creator_id: string
          custom_policy_id: string | null
          description: string | null
          id: string
          name: string
          policy_template_id: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          baseline_period: string
          created_at?: string
          creator_id: string
          custom_policy_id?: string | null
          description?: string | null
          id?: string
          name: string
          policy_template_id?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          baseline_period?: string
          created_at?: string
          creator_id?: string
          custom_policy_id?: string | null
          description?: string | null
          id?: string
          name?: string
          policy_template_id?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      shift_preferences: {
        Row: {
          created_at: string
          id: string
          preferences: Json
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          preferences?: Json
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          preferences?: Json
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_preferences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_templates: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_active: boolean
          min_staff: number
          name: string
          skill_tags: string[]
          start_time: string
          team_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_active?: boolean
          min_staff?: number
          name: string
          skill_tags?: string[]
          start_time: string
          team_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_active?: boolean
          min_staff?: number
          name?: string
          skill_tags?: string[]
          start_time?: string
          team_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_templates_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          billing_cycle: string | null
          created_at: string
          display_name: string
          features: Json
          id: string
          is_active: boolean | null
          max_employees: number | null
          min_employees: number | null
          plan_name: string
          price_per_employee: number
          updated_at: string
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string
          display_name: string
          features?: Json
          id?: string
          is_active?: boolean | null
          max_employees?: number | null
          min_employees?: number | null
          plan_name: string
          price_per_employee: number
          updated_at?: string
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string
          display_name?: string
          features?: Json
          id?: string
          is_active?: boolean | null
          max_employees?: number | null
          min_employees?: number | null
          plan_name?: string
          price_per_employee?: number
          updated_at?: string
        }
        Relationships: []
      }
      tag_map: {
        Row: {
          created_at: string
          data_point_id: string
          id: string
          report_version_id: string
          tag_value: string | null
          tenant_id: string
          xbrl_tag: string
        }
        Insert: {
          created_at?: string
          data_point_id: string
          id?: string
          report_version_id: string
          tag_value?: string | null
          tenant_id: string
          xbrl_tag: string
        }
        Update: {
          created_at?: string
          data_point_id?: string
          id?: string
          report_version_id?: string
          tag_value?: string | null
          tenant_id?: string
          xbrl_tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tag_map_data_point"
            columns: ["data_point_id"]
            isOneToOne: false
            referencedRelation: "esrs_data_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tag_map_report"
            columns: ["report_version_id"]
            isOneToOne: false
            referencedRelation: "report_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          task_id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          task_id: string
          tenant_id: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          task_id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_task_comments_task"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "compliance_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          invite_code: string | null
          manager_id: string | null
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code?: string | null
          manager_id?: string | null
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string | null
          manager_id?: string | null
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_api_tokens: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          last4: string | null
          name: string | null
          revoked_at: string | null
          tenant_id: string
          token_hash: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          last4?: string | null
          name?: string | null
          revoked_at?: string | null
          tenant_id: string
          token_hash: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          last4?: string | null
          name?: string | null
          revoked_at?: string | null
          tenant_id?: string
          token_hash?: string
        }
        Relationships: []
      }
      tenant_billing: {
        Row: {
          annual_price: number | null
          billing_address: Json | null
          billing_email: string
          created_at: string
          currency: string | null
          id: string
          last_payment_date: string | null
          monthly_price: number
          next_billing_date: string | null
          notes: string | null
          payment_day: number | null
          payment_method: string | null
          payment_status: string | null
          price_per_employee: number | null
          tax_rate: number | null
          tenant_id: string
          total_employees: number | null
          updated_at: string
          volume_discount: number | null
        }
        Insert: {
          annual_price?: number | null
          billing_address?: Json | null
          billing_email: string
          created_at?: string
          currency?: string | null
          id?: string
          last_payment_date?: string | null
          monthly_price?: number
          next_billing_date?: string | null
          notes?: string | null
          payment_day?: number | null
          payment_method?: string | null
          payment_status?: string | null
          price_per_employee?: number | null
          tax_rate?: number | null
          tenant_id: string
          total_employees?: number | null
          updated_at?: string
          volume_discount?: number | null
        }
        Update: {
          annual_price?: number | null
          billing_address?: Json | null
          billing_email?: string
          created_at?: string
          currency?: string | null
          id?: string
          last_payment_date?: string | null
          monthly_price?: number
          next_billing_date?: string | null
          notes?: string | null
          payment_day?: number | null
          payment_method?: string | null
          payment_status?: string | null
          price_per_employee?: number | null
          tax_rate?: number | null
          tenant_id?: string
          total_employees?: number | null
          updated_at?: string
          volume_discount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_billing_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          arr: number | null
          company_size: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string
          description: string | null
          domain: string | null
          eie_v2_enabled: boolean | null
          id: string
          industry: string | null
          max_users: number | null
          mrr: number | null
          name: string
          onboarding_completed: boolean
          settings: Json | null
          status: string | null
          subscription_plan: string | null
          subscription_status: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          arr?: number | null
          company_size?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          description?: string | null
          domain?: string | null
          eie_v2_enabled?: boolean | null
          id?: string
          industry?: string | null
          max_users?: number | null
          mrr?: number | null
          name: string
          onboarding_completed?: boolean
          settings?: Json | null
          status?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          arr?: number | null
          company_size?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          description?: string | null
          domain?: string | null
          eie_v2_enabled?: boolean | null
          id?: string
          industry?: string | null
          max_users?: number | null
          mrr?: number | null
          name?: string
          onboarding_completed?: boolean
          settings?: Json | null
          status?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      webhook_endpoints: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          error_count: number
          events: string[]
          id: string
          is_active: boolean
          last_triggered_at: string | null
          name: string
          secret: string
          success_count: number
          tenant_id: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          error_count?: number
          events?: string[]
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name: string
          secret: string
          success_count?: number
          tenant_id: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          error_count?: number
          events?: string[]
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name?: string
          secret?: string
          success_count?: number
          tenant_id?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          webhook_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhook_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      work_mode_logs: {
        Row: {
          actual_hours: Json | null
          actual_mode: string
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          date: string
          employee_id: string
          id: string
          location: string | null
        }
        Insert: {
          actual_hours?: Json | null
          actual_mode: string
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          date: string
          employee_id: string
          id?: string
          location?: string | null
        }
        Update: {
          actual_hours?: Json | null
          actual_mode?: string
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          date?: string
          employee_id?: string
          id?: string
          location?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_evaluation_scores: {
        Args: { campaign_uuid: string }
        Returns: undefined
      }
      calculate_tenant_pricing: {
        Args: { tenant_uuid: string }
        Returns: {
          annual_total: number
          monthly_total: number
          price_per_employee: number
          total_employees: number
          volume_discount: number
        }[]
      }
      cleanup_expired_aliases: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_employee_alias: {
        Args: { employee_id: string }
        Returns: string
      }
      generate_evaluation_alias: {
        Args: { campaign_uuid: string; user_uuid: string }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      grant_identity_consent: {
        Args: { message_uuid: string }
        Returns: boolean
      }
      send_intervention_message: {
        Args: {
          alert_uuid: string
          employee_alias: string
          msg_content: Json
          msg_type: string
        }
        Returns: string
      }
      trigger_webhooks: {
        Args: { event_type: string; payload: Json }
        Returns: undefined
      }
    }
    Enums: {
      assurance_level: "limited" | "reasonable"
      compliance_status: "DRAFT" | "SUBMITTED" | "QA" | "FINAL"
      coverage_status: "OK" | "MISSING" | "ESTIMATE"
      materiality_quadrant: "high_high" | "high_low" | "low_high" | "low_low"
      subscription_plan_type: "lite" | "esencial" | "profesional" | "enterprise"
      task_status: "TODO" | "IN_PROGRESS" | "READY" | "COMPLETED"
      user_role:
        | "EMPLOYEE"
        | "MANAGER"
        | "HR_ADMIN"
        | "SUPER_ADMIN"
        | "COMPLIANCE_OFFICER"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      assurance_level: ["limited", "reasonable"],
      compliance_status: ["DRAFT", "SUBMITTED", "QA", "FINAL"],
      coverage_status: ["OK", "MISSING", "ESTIMATE"],
      materiality_quadrant: ["high_high", "high_low", "low_high", "low_low"],
      subscription_plan_type: ["lite", "esencial", "profesional", "enterprise"],
      task_status: ["TODO", "IN_PROGRESS", "READY", "COMPLETED"],
      user_role: [
        "EMPLOYEE",
        "MANAGER",
        "HR_ADMIN",
        "SUPER_ADMIN",
        "COMPLIANCE_OFFICER",
      ],
    },
  },
} as const
