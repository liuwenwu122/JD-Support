
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { ResumeProfile, ResumeVersion } from '../types';
import { INITIAL_PROFILES } from '../constants';

const LOCAL_STORAGE_KEY = 'career_lift_data';

// --- Helpers ---
const loadLocal = (): ResumeProfile[] => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : INITIAL_PROFILES;
};

const saveLocal = (profiles: ResumeProfile[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profiles));
};

// --- API ---

export const db = {
    getAllProfiles: async (): Promise<ResumeProfile[]> => {
        if (isSupabaseConfigured() && supabase) {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('updated_at', { ascending: false });
                
                if (error) throw error;
                
                // Map DB columns to App types if necessary
                return (data || []).map((row: any) => ({
                    id: row.id,
                    name: row.name,
                    targetRole: row.target_role || row.targetRole,
                    // Note: If using Supabase, you'd need a column for targetJobDescription or store it in a JSONB column. 
                    // For this demo, we assume the 'versions' JSON might hold it or we fall back to local logic if schema is strict.
                    // We will map it if it exists in the row, otherwise undefined.
                    targetJobDescription: row.target_job_description || row.targetJobDescription, 
                    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
                    versions: typeof row.versions === 'string' ? JSON.parse(row.versions) : (row.versions || [])
                }));
            } catch (e) {
                console.error('Supabase load failed, falling back to local:', e);
                return loadLocal();
            }
        }
        return loadLocal();
    },

    createProfile: async (profile: ResumeProfile): Promise<void> => {
        if (isSupabaseConfigured() && supabase) {
            const row = {
                id: profile.id,
                name: profile.name,
                target_role: profile.targetRole,
                // Assuming schema supports it, or we accept it might be lost in strict Supabase setup without migration
                target_job_description: profile.targetJobDescription,
                versions: profile.versions, 
                updated_at: new Date(profile.updatedAt).toISOString()
            };
            const { error } = await supabase.from('profiles').insert(row);
            if (error) console.error("Create profile error:", error);
        } else {
            const profiles = loadLocal();
            saveLocal([profile, ...profiles]);
        }
    },

    deleteProfile: async (id: string): Promise<void> => {
        if (isSupabaseConfigured() && supabase) {
             await supabase.from('profiles').delete().eq('id', id);
        } else {
            const profiles = loadLocal();
            saveLocal(profiles.filter(p => p.id !== id));
        }
    },

    // Save/Update the entire profile state (includes versions)
    updateProfile: async (profile: ResumeProfile): Promise<void> => {
        if (isSupabaseConfigured() && supabase) {
            const row = {
                id: profile.id,
                name: profile.name,
                target_role: profile.targetRole,
                target_job_description: profile.targetJobDescription,
                versions: profile.versions,
                updated_at: new Date(profile.updatedAt).toISOString()
            };
            
            const { error } = await supabase
                .from('profiles')
                .upsert(row);
                
            if (error) console.error("Update profile error:", error);
        } else {
            const profiles = loadLocal();
            const updated = profiles.map(p => p.id === profile.id ? profile : p);
            saveLocal(updated);
        }
    }
};
