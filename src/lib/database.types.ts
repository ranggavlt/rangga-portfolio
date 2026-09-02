export type AdminUserRow = { user_id: string; created_at: string; updated_at: string }
export type ProfileRow = { id: string; full_name: string; professional_title: string; hero_eyebrow: string; hero_heading: string; hero_description: string; about_heading: string; about_biography: string; about_secondary: string; location: string; availability_text: string; email: string; portrait_url: string; cv_url: string; footer_text: string; created_at: string; updated_at: string }
export type ProjectRow = { id: string; slug: string; title: string; year: string; category: string; short_description: string; full_description: string; role: string; tech: string[]; live_url: string; source_url: string; status: 'draft' | 'published'; display_order: number; created_at: string; updated_at: string }
export type ProjectImageRow = { id: string; project_id: string; src: string; alt: string; caption: string; position: number; created_at: string; updated_at: string }
export type ExperienceRow = { id: string; period: string; company: string; role: string; description: string; published: boolean; display_order: number; created_at: string; updated_at: string }
export type EducationRow = { id: string; period: string; institution: string; degree: string; detail: string; display_order: number; created_at: string; updated_at: string }
export type OrganizationRow = { id: string; name: string; meta: string; detail: string; published: boolean; display_order: number; created_at: string; updated_at: string }
export type SkillRow = { id: string; label: string; skills: string[]; display_order: number; created_at: string; updated_at: string }
export type SocialLinkRow = { id: string; platform: string; url: string; display_order: number; enabled: boolean; created_at: string; updated_at: string }
export type ContactMessageRow = { id: string; sender: string; email: string; message: string; submitted_at: string; read: boolean; created_at: string; updated_at: string }

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      admin_users: Table<AdminUserRow, { user_id: string }>
      profiles: Table<ProfileRow, Omit<ProfileRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }>
      projects: Table<ProjectRow, Omit<ProjectRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }>
      project_images: Table<ProjectImageRow, Omit<ProjectImageRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }>
      experiences: Table<ExperienceRow, Omit<ExperienceRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }>
      education: Table<EducationRow, Omit<EducationRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }>
      organizations: Table<OrganizationRow, Omit<OrganizationRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }>
      skills: Table<SkillRow, Omit<SkillRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }>
      social_links: Table<SocialLinkRow, Omit<SocialLinkRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }>
      contact_messages: Table<ContactMessageRow, Pick<ContactMessageRow, 'sender' | 'email' | 'message'> & { id?: string; submitted_at?: string; read?: boolean }>
    }
    Views: Record<string, never>
    Functions: { is_admin: { Args: Record<string, never>; Returns: boolean } }
    Enums: { project_status: 'draft' | 'published' }
    CompositeTypes: Record<string, never>
  }
}
