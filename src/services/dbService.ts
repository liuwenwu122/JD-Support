
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { ResumeProfile } from '../types';
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
                // RLS will automatically filter for the authenticated user
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
                    targetJobDescription: row.target_job_description || row.targetJobDescription,
                    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
                    versions: typeof row.versions === 'string' ? JSON.parse(row.versions) : (row.versions || [])
                }));
            } catch (e) {
                console.error('Supabase load failed, falling back to local:', e);
                // Fallback to local storage if not logged in or error (though in protected route we should be logged in)
                return loadLocal();
            }
        }
        return loadLocal();
    },

    createProfile: async (profile: ResumeProfile): Promise<void> => {
        if (isSupabaseConfigured() && supabase) {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error("No authenticated user found for createProfile");
                return;
            }

            const row = {
                id: profile.id,
                user_id: user.id, // Link to user
                name: profile.name,
                target_role: profile.targetRole,
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
            const { error } = await supabase.from('profiles').delete().eq('id', id);
            if (error) throw error;
        } else {
            const profiles = loadLocal();
            saveLocal(profiles.filter(p => p.id !== id));
        }
    },

    // Save/Update the entire profile state (includes versions)
    updateProfile: async (profile: ResumeProfile): Promise<void> => {
        if (isSupabaseConfigured() && supabase) {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error("No authenticated user found for updateProfile");
                return;
            }

            const row = {
                id: profile.id,
                user_id: user.id, // Ensure user_id is present for upsert
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
